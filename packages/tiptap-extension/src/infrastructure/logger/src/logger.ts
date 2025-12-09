/**
 * Logger 核心实现
 */

import type { LoggerConfig, Logger, LogLevel, LogContext } from './types';
import { loadConfig, isTestEnvironment } from './config';
import { FEATURE_CONFIGS } from './feature-definitions';
import { getLocation } from './location';
import { formatLog } from './formatter';

/**
 * Logger 实现类
 */
class LoggerImpl implements Logger {
  private config: LoggerConfig;
  private levelWeight: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(configPath?: string) {
    if (typeof window !== 'undefined') {
      // 统一通过 loadConfig 获取配置：
      // - Electron 渲染进程：来自 preload 注入（主进程 JSON）
      // - 纯浏览器环境：使用默认配置（无持久化）
      this.config = loadConfig(configPath);
    } else {
      // Node.js 环境：使用 loadConfig
      this.config = loadConfig(configPath);
    }

    this.ensureFeatureDefinitions();
  }

  /**
   * 确保配置中包含所有最新的 Feature 定义
   */
  private ensureFeatureDefinitions(): void {
    for (const [featureId, definition] of Object.entries(FEATURE_CONFIGS)) {
      if (!this.config.features[featureId]) {
        this.config.features[featureId] = {
          enabled: definition.defaultEnabled,
          level: definition.defaultLevel,
          showLocation: definition.defaultShowLocation,
          description: definition.description,
          module: definition.module,
        };
      }
    }
  }

  /**
   * 更新运行时配置
   */
  updateConfig(updates: Partial<LoggerConfig>): void {
    // 深度合并配置（特别是 features 对象）
    this.config = {
      ...this.config,
      ...updates,
      features: {
        ...this.config.features,
        ...(updates.features || {}),
      },
    };

    // 持久化由上层（Electron 主进程 JSON / 其他环境）负责
  }

  /**
   * 切换功能开关
   */
  toggleFeature(featureId: string, enabled: boolean): void {
    if (!this.config.features[featureId]) {
      // 保持行为安全：如果 Feature 未注册，抛出错误而不是静默日志
      throw new Error(
        `[Logger] 功能 "${featureId}" 不存在，请先在 FEATURE_CONFIGS 中注册该 Feature。`,
      );
      return;
    }

    this.config.features[featureId].enabled = enabled;
  }

  /**
   * 获取当前配置
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * 验证功能 ID 是否在配置中定义
   * 如果不存在，抛出错误
   */
  private validateFeatureId(featureId: string | string[]): void {
    const ids = Array.isArray(featureId) ? featureId : [featureId];

    for (const id of ids) {
      if (!this.config.features[id]) {
        throw new Error(
          `Feature ID "${id}" is not defined in logger configuration. ` +
          `Please add it to FEATURE_CONFIGS in src/infrastructure/logger/src/feature-definitions.ts`
        );
      }
    }
  }

  /**
   * 判断是否应该输出日志
   */
  private shouldLog(featureIds: string[], level: LogLevel): boolean {
    // 测试环境强制启用
    if (isTestEnvironment() && this.config.testMode.forceEnable) {
      return true;
    }

    // 只要有一个 feature 启用就输出
    return featureIds.some(id => {
      const featureConfig = this.config.features[id];

      if (!featureConfig || !featureConfig.enabled) {
        return false;
      }

      const configLevel = featureConfig.level || this.config.globalLevel;
      return this.levelWeight[level] >= this.levelWeight[configLevel];
    });
  }

  /**
   * 判断是否显示代码位置
   */
  private shouldShowLocation(featureIds: string[]): boolean {
    // 只要有一个 feature 要求显示位置就显示
    return featureIds.some(id => {
      const featureConfig = this.config.features[id];
      return featureConfig?.showLocation === true;
    });
  }

  /**
   * 输出日志
   */
  private log(
    featureId: string | string[],
    level: LogLevel,
    message: string,
    data?: unknown
  ): void {
    // 验证功能 ID
    this.validateFeatureId(featureId);

    const featureIds = Array.isArray(featureId) ? featureId : [featureId];

    // 判断是否应该输出
    if (!this.shouldLog(featureIds, level)) {
      return;
    }

    // 判断是否显示位置
    const showLocation = this.shouldShowLocation(featureIds);

    // 构建日志上下文
    const context: LogContext = {
      timestamp: new Date(),
      level,
      featureIds,
      location: getLocation(this.config.format.pathStyle),
      message,
      data,
    };

    // 格式化并输出
    const formattedLog = formatLog(context, this.config.format, showLocation);
    // 使用对应的 console 方法
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'info' ? console.info : console.debug;
    consoleMethod(formattedLog);
  }

  /**
   * 调试日志
   */
  debug(featureId: string | string[], message: string, data?: unknown): void {
    this.log(featureId, 'debug', message, data);
  }

  /**
   * 信息日志
   */
  info(featureId: string | string[], message: string, data?: unknown): void {
    this.log(featureId, 'info', message, data);
  }

  /**
   * 警告日志
   */
  warn(featureId: string | string[], message: string, data?: unknown): void {
    this.log(featureId, 'warn', message, data);
  }

  /**
   * 错误日志
   */
  error(featureId: string | string[], message: string, data?: unknown): void {
    this.log(featureId, 'error', message, data);
  }
}

/**
 * 全局单例
 */
let instance: Logger | null = null;

/**
 * 获取 Logger 实例
 */
export function getLogger(configPath?: string): Logger {
  if (!instance) {
    instance = new LoggerImpl(configPath);
  }
  return instance;
}

/**
 * 重置 Logger 实例（仅用于测试）
 */
export function resetLogger(): void {
  instance = null;
}
