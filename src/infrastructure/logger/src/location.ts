/**
 * 代码位置追踪
 */

import type { CodeLocation, PathStyle } from './types';
import { isNode } from './config';

/**
 * 简化文件路径
 */
export function simplifyPath(filePath: string, style: PathStyle = 'short'): string {
  if (style === 'full') {
    return filePath;
  }

  if (style === 'relative' && isNode()) {
    try {
      const { relative } = require('path');
      return relative(process.cwd(), filePath);
    } catch {
      // fallback to short
    }
  }

  // short: 只保留文件名和上一级目录
  const parts = filePath.split('/');
  if (parts.length >= 2) {
    return parts.slice(-2).join('/');
  }
  return parts[parts.length - 1] || filePath;
}

/**
 * 获取调用位置信息
 * 通过解析错误堆栈自动追踪代码位置
 */
export function getLocation(pathStyle: PathStyle = 'short'): CodeLocation {
  const stack = new Error().stack || '';
  const lines = stack.split('\n');

  // 跳过堆栈中的：
  // [0] Error
  // [1] getLocation
  // [2] LoggerImpl.log (logger 内部)
  // [3] LoggerImpl.debug/info/warn/error (logger 内部)
  // [4] 真正的调用者
  const callerLine = lines[4] || '';

  // 匹配格式: at functionName (file:line:column)
  // 或者: at file:line:column
  const matchWithFunction = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
  const matchWithoutFunction = callerLine.match(/at\s+(.+?):(\d+):(\d+)/);

  if (matchWithFunction) {
    return {
      function: matchWithFunction[1].trim(),
      file: simplifyPath(matchWithFunction[2], pathStyle),
      line: parseInt(matchWithFunction[3], 10),
      column: parseInt(matchWithFunction[4], 10),
    };
  }

  if (matchWithoutFunction) {
    return {
      function: 'anonymous',
      file: simplifyPath(matchWithoutFunction[1], pathStyle),
      line: parseInt(matchWithoutFunction[2], 10),
      column: parseInt(matchWithoutFunction[3], 10),
    };
  }

  // 无法解析时返回默认值
  return {
    function: 'unknown',
    file: 'unknown',
    line: 0,
    column: 0,
  };
}
