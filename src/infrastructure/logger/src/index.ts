/**
 * Logger 统一导出
 *
 * 唯一推荐的使用方式：
 *   import { loggers } from '@nova/infrastructure/logger'
 *   loggers.yourFeature.debug('消息', { data })
 */

// ==================== 类型导出 ====================
export type {
  LogLevel,
  PathStyle,
  FormatConfig,
  FeatureConfig,
  TestModeConfig,
  LoggerConfig,
  CodeLocation,
  LogContext,
} from './types';

export type { FeatureDefinition, FeatureId, LoggerName } from './registry';

// ==================== 核心 API ====================
// 预注册的 loggers（唯一推荐的使用方式）
export { loggers } from './registry';

// 配置相关
export { getDefaultConfig } from './config';
export { FEATURE_CONFIGS } from './registry';

// 配置管理 API（用于运行时动态更新配置）
import { getLogger } from './logger';
import { loggers } from './registry';

export const updateConfig = (updates: Partial<import('./types').LoggerConfig>) => {
  const logger = getLogger();
  logger.updateConfig(updates);
};

export const getConfig = () => {
  const logger = getLogger();
  return logger.getConfig();
};

export const toggleFeature = (featureId: string, enabled: boolean) => {
  const logger = getLogger();
  logger.toggleFeature(featureId, enabled);
};

// 调试方法：在浏览器控制台使用
if (typeof window !== 'undefined') {
  // 暴露 loggers 到全局
  (window as any).__loggers__ = loggers;
  (window as any).__toggleFeature__ = toggleFeature;
  (window as any).__getConfig__ = getConfig;

  (window as any).__debugLogger__ = () => {
    const config = getConfig();
    console.log('=== Logger 配置调试信息 ===');
    console.log('全局等级:', config.globalLevel);
    console.log('测试模式:', config.testMode);
    console.log('\n功能列表:');
    Object.entries(config.features).forEach(([id, feature]) => {
      console.log(`  ${id}:`, {
        enabled: feature.enabled,
        level: feature.level,
        showLocation: feature.showLocation,
      });
    });
    return config;
  };

  // 快速测试方法
  (window as any).__testLogger__ = () => {
    console.log('=== 开始测试 Logger ===');

    // 测试 feature-handle-display
    console.log('\n1. 测试 feature-handle-display:');
    const config = getConfig();
    const featureConfig = config.features['feature-handle-display'];
    console.log('  配置:', featureConfig);

    if (featureConfig.enabled) {
      console.log('  尝试输出日志...');
      loggers.handleDisplay.debug('🧪 debug 测试', { time: new Date() });
      loggers.handleDisplay.info('🧪 info 测试', { time: new Date() });
      loggers.handleDisplay.warn('🧪 warn 测试', { time: new Date() });
      loggers.handleDisplay.error('🧪 error 测试', { time: new Date() });
      console.log('  ✅ 日志调用完成（检查上方是否有带 [feature-handle-display] 的日志）');
    } else {
      console.log('  ⚠️ 功能未启用，正在启用...');
      toggleFeature('feature-handle-display', true);
      console.log('  已启用，请重新运行 __testLogger__()');
    }
  };

}
