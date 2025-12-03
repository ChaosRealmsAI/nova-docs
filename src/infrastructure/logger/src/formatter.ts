/**
 * 日志格式化
 */

import type { LogContext, LogLevel, FormatConfig } from './types';
import { isTestEnvironment } from './config';

/**
 * 格式化时间戳
 */
function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化日志等级
 */
function formatLevel(level: LogLevel): string {
  return level.toUpperCase().padEnd(5, ' ');
}

/**
 * 格式化功能 ID
 */
function formatFeatureIds(featureIds: string[]): string {
  return featureIds.join(',');
}

/**
 * 格式化代码位置
 */
function formatLocation(
  context: LogContext,
  config: FormatConfig,
  showLocation: boolean
): string {
  if (!showLocation) {
    return '';
  }

  const { file, line, column } = context.location;
  const locationStr = config.showColumn
    ? `${file}:${line}:${column}`
    : `${file}:${line}`;

  return `[${locationStr}]`;
}

/**
 * 格式化函数名
 */
function formatFunction(context: LogContext, showLocation: boolean): string {
  if (!showLocation) {
    return '';
  }

  return `[${context.location.function}]`;
}

/**
 * 格式化数据
 */
function formatData(data?: unknown): string {
  if (data === undefined) {
    return '';
  }

  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

/**
 * 格式化完整日志
 * 格式: [时间戳] [等级] [功能ID] [文件路径:行号] [函数名] 消息 [数据]
 */
export function formatLog(
  context: LogContext,
  config: FormatConfig,
  showLocation: boolean
): string {
  const parts: string[] = [];

  // 测试环境标记
  if (isTestEnvironment()) {
    parts.push('[TEST]');
  }

  // 时间戳
  parts.push(`[${formatTimestamp(context.timestamp)}]`);

  // 等级
  parts.push(`[${formatLevel(context.level)}]`);

  // 功能 ID
  parts.push(`[${formatFeatureIds(context.featureIds)}]`);

  // 代码位置
  const location = formatLocation(context, config, showLocation);
  if (location) {
    parts.push(location);
  }

  // 函数名
  const functionName = formatFunction(context, showLocation);
  if (functionName) {
    parts.push(functionName);
  }

  // 消息
  parts.push(context.message);

  // 数据
  const data = formatData(context.data);
  if (data) {
    parts.push(data);
  }

  return parts.join(' ');
}
