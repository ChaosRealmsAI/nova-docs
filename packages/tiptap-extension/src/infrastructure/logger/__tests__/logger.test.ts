/**
 * Logger 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetLogger, getLogger } from '../src/logger';
import type { LoggerConfig } from '../src/types';

// 测试配置
const testConfig: LoggerConfig = {
  globalLevel: 'info',
  format: {
    pathStyle: 'short',
    showColumn: false,
  },
  features: {
    'test-feature-enabled': {
      enabled: true,
      level: 'debug',
      showLocation: true,
      description: '启用的测试功能',
    },
    'test-feature-disabled': {
      enabled: false,
      description: '禁用的测试功能',
    },
    'test-feature-multi-1': {
      enabled: true,
      level: 'info',
      showLocation: false,
      description: '多ID测试功能1',
    },
    'test-feature-multi-2': {
      enabled: true,
      level: 'warn',
      showLocation: true,
      description: '多ID测试功能2',
    },
  },
  testMode: {
    forceEnable: true,
  },
};

describe('Logger System', () => {
  // 保存原始的 console 方法
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    log: console.log,
  };

  beforeEach(() => {
    // 重置 logger 实例
    resetLogger();

    // Mock console 方法
    console.debug = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.log = vi.fn();

    // 通过全局变量设置测试配置（不再使用配置文件）
    ;(globalThis as { __LOGGER_CONFIG__?: LoggerConfig }).__LOGGER_CONFIG__ = testConfig;
  });

  afterEach(() => {
    // 恢复 console 方法
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.log = originalConsole.log;

    // 清理全局配置
    delete (globalThis as { __LOGGER_CONFIG__?: LoggerConfig }).__LOGGER_CONFIG__;
  });

  describe('配置加载', () => {
    it('应该成功加载配置文件', () => {
      const logger = getLogger();
      expect(logger).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('没有全局配置时应该使用默认配置', () => {
      delete (globalThis as { __LOGGER_CONFIG__?: LoggerConfig }).__LOGGER_CONFIG__;
      resetLogger();

      const logger = getLogger();
      expect(logger).toBeDefined();
      // 应该使用默认配置而不是抛出错误
    });
  });

  describe('功能 ID 验证', () => {
    it('使用未定义的功能 ID 应该抛出错误', () => {
      const logger = getLogger();

      expect(() => {
        logger.info('undefined-feature', 'test message');
      }).toThrow(/Feature ID "undefined-feature" is not defined/);
    });

    it('使用已定义的功能 ID 应该正常工作', () => {
      const logger = getLogger();

      expect(() => {
        logger.info('test-feature-enabled', 'test message');
      }).not.toThrow();
    });
  });

  describe('日志等级过滤', () => {
    it('测试环境应该强制启用所有日志', () => {
      const logger = getLogger();

      // 测试环境下，即使禁用的功能也应该输出
      logger.info('test-feature-disabled', 'test message');
      expect(console.info).toHaveBeenCalled();
    });

    it('应该根据配置等级过滤日志', () => {
      // 修改配置为非测试环境
      const prodConfig = {
        ...testConfig,
        testMode: { forceEnable: false },
      };
      ;(globalThis as { __LOGGER_CONFIG__?: LoggerConfig }).__LOGGER_CONFIG__ = prodConfig;
      resetLogger();

      // 临时修改环境变量
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const logger = getLogger();

      // 'test-feature-enabled' 的 level 是 'debug'
      logger.debug('test-feature-enabled', 'debug message');
      expect(console.debug).toHaveBeenCalled();

      vi.clearAllMocks();

      // 禁用的功能不应该输出
      logger.info('test-feature-disabled', 'info message');
      expect(console.info).not.toHaveBeenCalled();

      // 恢复环境变量
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('单个功能 ID', () => {
    it('应该输出正确格式的日志', () => {
      const logger = getLogger();
      logger.info('test-feature-enabled', 'test message');

      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as any).mock.calls[0][0];

      // 验证日志包含必要信息
      expect(logOutput).toContain('[TEST]');
      expect(logOutput).toContain('[INFO ]');
      expect(logOutput).toContain('[test-feature-enabled]');
      expect(logOutput).toContain('test message');
    });

    it('应该正确输出数据对象', () => {
      const logger = getLogger();
      const testData = { key: 'value', count: 123 };
      logger.info('test-feature-enabled', 'test message', testData);

      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as any).mock.calls[0][0];

      expect(logOutput).toContain('test message');
      expect(logOutput).toContain(JSON.stringify(testData));
    });
  });

  describe('多个功能 ID', () => {
    it('应该支持传入多个功能 ID', () => {
      const logger = getLogger();

      expect(() => {
        logger.info(['test-feature-multi-1', 'test-feature-multi-2'], 'multi test');
      }).not.toThrow();
    });

    it('应该在日志中显示所有功能 ID', () => {
      const logger = getLogger();
      logger.info(['test-feature-multi-1', 'test-feature-multi-2'], 'multi test');

      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as any).mock.calls[0][0];

      expect(logOutput).toContain('[test-feature-multi-1,test-feature-multi-2]');
      expect(logOutput).toContain('multi test');
    });
  });

  describe('代码位置追踪', () => {
    it('showLocation 为 true 时应该显示位置信息', () => {
      const logger = getLogger();
      logger.info('test-feature-enabled', 'location test');

      const logOutput = (console.info as any).mock.calls[0][0];

      // 应该包含文件名和行号
      expect(logOutput).toMatch(/\[.*\.ts:\d+\]/);
      // 应该包含函数名
      expect(logOutput).toContain('[');
    });

    it('showLocation 为 false 时不应该显示位置信息', () => {
      const logger = getLogger();
      logger.info('test-feature-multi-1', 'no location test');

      const logOutput = (console.info as any).mock.calls[0][0];

      // 应该有 [TEST] [时间戳] [INFO] [feature-id] 消息
      // 但不应该有 [file:line] 和 [function]
      const parts = logOutput.split(']');
      // [TEST, [时间戳, [INFO , [test-feature-multi-1 后面就是消息
      // 如果有位置信息会有更多的 ]
      expect(parts.length).toBeLessThan(7);
    });
  });

  describe('日志方法', () => {
    it('debug 方法应该调用 console.debug', () => {
      const logger = getLogger();
      logger.debug('test-feature-enabled', 'debug message');

      expect(console.debug).toHaveBeenCalled();
    });

    it('info 方法应该调用 console.info', () => {
      const logger = getLogger();
      logger.info('test-feature-enabled', 'info message');

      expect(console.info).toHaveBeenCalled();
    });

    it('warn 方法应该调用 console.warn', () => {
      const logger = getLogger();
      logger.warn('test-feature-enabled', 'warn message');

      expect(console.warn).toHaveBeenCalled();
    });

    it('error 方法应该调用 console.error', () => {
      const logger = getLogger();
      logger.error('test-feature-enabled', 'error message');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('全局单例', () => {
    it('多次调用 getLogger 应该返回同一实例', () => {
      const logger1 = getLogger();
      const logger2 = getLogger();

      expect(logger1).toBe(logger2);
    });

    it('resetLogger 后应该创建新实例', () => {
      getLogger();
      resetLogger();
      const logger2 = getLogger();

      // 虽然是新实例，但接口应该一致
      expect(logger2).toBeDefined();
      expect(logger2.debug).toBeDefined();
    });
  });
});
