/**
 * Logger 系统类型定义
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type PathStyle = 'full' | 'relative' | 'short';

export interface FormatConfig {
  pathStyle: PathStyle;
  showColumn: boolean;
}

export interface FeatureConfig {
  enabled: boolean;
  level?: LogLevel;
  showLocation?: boolean;
  description?: string;
  module?: 'domain-editor' | 'infrastructure' | 'shared' | 'apps';
}

export interface TestModeConfig {
  forceEnable: boolean;
}

export interface LoggerConfig {
  globalLevel: LogLevel;
  format: FormatConfig;
  features: Record<string, FeatureConfig>;
  testMode: TestModeConfig;
}

export interface CodeLocation {
  function: string;
  file: string;
  line: number;
  column: number;
}

export interface LogContext {
  timestamp: Date;
  level: LogLevel;
  featureIds: string[];
  location: CodeLocation;
  message: string;
  data?: unknown;
}

export interface Logger {
  debug(featureId: string | string[], message: string, data?: unknown): void;
  info(featureId: string | string[], message: string, data?: unknown): void;
  warn(featureId: string | string[], message: string, data?: unknown): void;
  error(featureId: string | string[], message: string, data?: unknown): void;
  updateConfig(updates: Partial<LoggerConfig>): void;
  toggleFeature(featureId: string, enabled: boolean): void;
  getConfig(): LoggerConfig;
}
