/**
 * Logger 配置管理
 */

import type { LoggerConfig } from './types';
import { FEATURE_CONFIGS } from './feature-definitions';

/**
 * 检测是否在浏览器环境
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * 检测是否在 Node.js 环境
 */
export function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

/**
 * 检测是否在测试环境
 */
export function isTestEnvironment(): boolean {
  if (!isNode()) return false;

  return (
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true' ||
    typeof (globalThis as { jest?: unknown }).jest !== 'undefined'
  );
}

/**
 * 加载配置文件 (浏览器环境)
 */
function loadConfigBrowser(): LoggerConfig {
  return getDefaultConfig();
}

/**
 * 加载配置 (统一接口)
 * 不再从文件加载，只从代码生成默认配置或使用全局配置
 */
export function loadConfig(_configPath?: string): LoggerConfig {
  if (isBrowser()) {
    return loadConfigBrowser();
  }
  return getDefaultConfig();
}

/**
 * 获取默认配置（用于测试和运行时）
 * 从 registry 静态生成，确保与配置文件一致
 */
export function getDefaultConfig(): LoggerConfig {
  // 从 registry 生成配置
  return {
    globalLevel: 'debug',
    format: {
      pathStyle: 'short',
      showColumn: false,
    },
    features: Object.fromEntries(
      Object.entries(FEATURE_CONFIGS).map(([featureId, def]) => [
        featureId,
        {
          enabled: def.defaultEnabled,
          level: def.defaultLevel,
          showLocation: def.defaultShowLocation,
          description: def.description,
          module: def.module,
        },
      ])
    ),
    testMode: {
      forceEnable: false,
    },
  };
}
