/**
 * Debug utilities for the Rollio game
 */

import fs from 'fs';
import path from 'path';

// Debug configuration interface
interface DebugConfig {
  debug: boolean;
  verbose: boolean;
  logToFile?: boolean;
  logFiles?: {
    actions: string;
    state: string;
  };
  includeCallStack?: boolean;
  includeNextAction?: boolean;
  logActions: {
    gameFlow: boolean;
    scoring: boolean;
    diceRolls: boolean;
    charmActivation: boolean;
    consumableUsage: boolean;
    materialEffects: boolean;
    roundTransitions: boolean;
    stateChanges: boolean;
  };
  performance: {
    enableTiming: boolean;
    logSlowOperations: boolean;
    slowThresholdMs: number;
  };
  stateLogging?: {
    fullState: boolean;
    diffOnly: boolean;
  };
}

// Default configuration
const DEFAULT_CONFIG: DebugConfig = {
  debug: false,
  verbose: false,
  logToFile: false,
  logFiles: {
    actions: 'debug.actions.log',
    state: 'debug.state.log'
  },
  includeCallStack: true,
  includeNextAction: true,
  logActions: {
    gameFlow: false,
    scoring: false,
    diceRolls: false,
    charmActivation: false,
    consumableUsage: false,
    materialEffects: false,
    roundTransitions: false,
    stateChanges: false
  },
  performance: {
    enableTiming: false,
    logSlowOperations: false,
    slowThresholdMs: 10
  },
  stateLogging: {
    fullState: true,
    diffOnly: false
  }
};

// Debug mode control
let DEBUG_CONFIG: DebugConfig = DEFAULT_CONFIG;

// Get debug logs directory
function getDebugLogsDir(): string {
  return path.join(process.cwd(), 'debug', 'logs');
}

// Ensure debug logs directory exists
function ensureDebugLogsDir(): void {
  if (typeof window !== 'undefined') {
    return;
  }
  try {
    const logsDir = getDebugLogsDir();
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  } catch (error) {
    // Silently fail - will error when trying to write
  }
}

// Get current date string for log rotation (YYYY-MM-DD)
function getDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get log file path with daily rotation
function getLogFilePath(baseName: string): string {
  const dateStr = getDateString();
  const fileName = baseName.replace('.log', `-${dateStr}.log`);
  return path.join(getDebugLogsDir(), fileName);
}

// Load configuration from file
function loadDebugConfig(): DebugConfig {
  // In browser environment, just use default config
  if (typeof window !== 'undefined') {
    return DEFAULT_CONFIG;
  }
  
  try {
    const configPath = path.join(process.cwd(), 'debug', 'debug.config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.warn('[DEBUG] Failed to load debug config, using defaults:', error);
  }
  return DEFAULT_CONFIG;
}

// Initialize configuration
try {
  DEBUG_CONFIG = loadDebugConfig();
  ensureDebugLogsDir();
  // Only log config loading if verbose mode is enabled
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.verbose) {
    console.log('[DEBUG] Config loaded:', {
      debug: DEBUG_CONFIG.debug,
      logToFile: DEBUG_CONFIG.logToFile,
      logFiles: DEBUG_CONFIG.logFiles
    });
  }
} catch (error) {
  // Always log errors, but only warnings
  if (DEBUG_CONFIG?.verbose) {
    console.warn('[DEBUG] Failed to load config, using defaults:', error);
  }
  DEBUG_CONFIG = DEFAULT_CONFIG;
}

export function setDebugMode(enabled: boolean) {
  DEBUG_CONFIG.debug = enabled;
  // Only log when debug mode is set if verbose mode is enabled
  if (DEBUG_CONFIG.verbose) {
    console.log(`[DEBUG] setDebugMode called: ${enabled}`);
    console.log(`[DEBUG] Current config:`, {
      debug: DEBUG_CONFIG.debug,
      logToFile: DEBUG_CONFIG.logToFile,
      logActions: DEBUG_CONFIG.logActions
    });
  }
}

export function getDebugMode(): boolean {
  return DEBUG_CONFIG.debug;
}

export function getDebugConfig(): DebugConfig {
  return DEBUG_CONFIG;
}

export function reloadDebugConfig() {
  DEBUG_CONFIG = loadDebugConfig();
  ensureDebugLogsDir();
}

// Helper function to extract caller information from stack trace
function getCallerInfo(): { file: string; function: string; line: number } | null {
  if (typeof window !== 'undefined' || !Error.captureStackTrace) {
    return null;
  }
  
  try {
    const stack = new Error().stack;
    if (!stack) return null;
    
    const lines = stack.split('\n');
    // Skip the first line (Error message) and this function
    // Find the first line that's not from debug.ts
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes('debug.ts')) {
        // Match: at FunctionName (file:line:column) or at file:line:column
        const match = line.match(/at\s+(?:(\w+)\s+)?\(?(.+?):(\d+):(\d+)\)?/);
        if (match) {
          const functionName = match[1] || 'anonymous';
          const filePath = match[2];
          const lineNumber = parseInt(match[3], 10);
          
          // Extract relative path from workspace
          const workspacePath = process.cwd();
          const relativePath = filePath.replace(workspacePath + '/', '');
          
          return {
            file: relativePath,
            function: functionName,
            line: lineNumber
          };
        }
        break;
      }
    }
  } catch (e) {
    // Fallback if stack trace parsing fails
  }
  
  return null;
}

// Format timestamp with milliseconds
function getTimestamp(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

// Track current log file paths and dates for rotation
const currentLogFiles: { actions?: string; state?: string; date?: string } = {};

// Get current log file path (with rotation check)
function getCurrentLogPath(baseName: string): string {
  const currentDate = getDateString();
  const logType = baseName.includes('actions') ? 'actions' : 'state';
  
  // If date changed or file not set, update path
  if (currentLogFiles.date !== currentDate || !currentLogFiles[logType]) {
    currentLogFiles.date = currentDate;
    currentLogFiles[logType] = getLogFilePath(baseName);
  }
  
  return currentLogFiles[logType] || getLogFilePath(baseName);
}

// Concise formatting for dice
function formatDieConcise(die: any): string {
  if (!die || typeof die !== 'object') {
    return JSON.stringify(die);
  }
  
  const parts: string[] = [];
  if (die.id !== undefined) parts.push(`id=${die.id}`);
  if (die.sides !== undefined) parts.push(`sides=${die.sides}`);
  if (die.allowedValues !== undefined) {
    const values = Array.isArray(die.allowedValues) 
      ? `[${die.allowedValues.join(',')}]` 
      : die.allowedValues;
    parts.push(`allowedValues=${values}`);
  }
  if (die.material !== undefined) parts.push(`material=${die.material}`);
  if (die.scored !== undefined) parts.push(`scored=${die.scored}`);
  if (die.rolledValue !== undefined) parts.push(`rolledValue=${die.rolledValue}`);
  
  return parts.join(', ');
}

// Concise formatting for combinations
function formatCombinationConcise(combo: any): string {
  if (!combo || typeof combo !== 'object') {
    return JSON.stringify(combo);
  }
  
  const parts: string[] = [];
  if (combo.type !== undefined) parts.push(`type=${combo.type}`);
  if (combo.dice !== undefined) {
    const dice = Array.isArray(combo.dice) 
      ? `[${combo.dice.join(',')}]` 
      : combo.dice;
    parts.push(`dice=${dice}`);
  }
  if (combo.points !== undefined) parts.push(`points=${combo.points}`);
  
  return parts.join(', ');
}

// Concise formatting for nested objects
function formatObjectConcise(obj: any, indent: number = 0): string {
  if (obj === null || obj === undefined) {
    return String(obj);
  }
  
  if (typeof obj !== 'object') {
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    // Check if it's an array of dice
    if (obj.length > 0 && obj[0] && typeof obj[0] === 'object' && obj[0].id !== undefined && obj[0].sides !== undefined) {
      return `[\n${'  '.repeat(indent + 1)}${obj.map(die => formatDieConcise(die)).join(`\n${'  '.repeat(indent + 1)}`)}\n${'  '.repeat(indent)}]`;
    }
    // Check if it's an array of combinations
    if (obj.length > 0 && obj[0] && typeof obj[0] === 'object' && obj[0].type !== undefined && obj[0].dice !== undefined) {
      return `[\n${'  '.repeat(indent + 1)}${obj.map(combo => formatCombinationConcise(combo)).join(`\n${'  '.repeat(indent + 1)}`)}\n${'  '.repeat(indent)}]`;
    }
    // Regular array
    return `[${obj.map(item => formatObjectConcise(item, indent + 1)).join(', ')}]`;
  }
  
  // Check for diceSetConfig pattern (has dice array)
  if (obj.dice && Array.isArray(obj.dice)) {
    const lines: string[] = ['{'];
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'dice') {
        lines.push(`  ${'  '.repeat(indent)}"${key}": [`);
        for (const die of value as any[]) {
          lines.push(`    ${'  '.repeat(indent)}${formatDieConcise(die)},`);
        }
        lines.push(`  ${'  '.repeat(indent)}],`);
      } else {
        lines.push(`  ${'  '.repeat(indent)}"${key}": ${formatObjectConcise(value, indent + 1)},`);
      }
    }
    lines.push(`${'  '.repeat(indent)}}`);
    return lines.join('\n');
  }
  
  // Regular object - format compactly
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '{}';
  }
  
  // For small objects, put on one line
  if (entries.length <= 3 && entries.every(([_, v]) => typeof v !== 'object' || v === null || Array.isArray(v))) {
    return `{ ${entries.map(([k, v]) => `"${k}": ${formatObjectConcise(v, indent + 1)}`).join(', ')} }`;
  }
  
  // For larger objects, use multi-line
  const lines: string[] = ['{'];
  for (const [key, value] of entries) {
    const formatted = formatObjectConcise(value, indent + 1);
    lines.push(`  ${'  '.repeat(indent)}"${key}": ${formatted},`);
  }
  lines.push(`${'  '.repeat(indent)}}`);
  return lines.join('\n');
}

// Write to action log file
function writeToActionLog(message: string): void {
  // Don't write to file in browser environment
  if (typeof window !== 'undefined') {
    return;
  }
  
  // Check config
  if (!DEBUG_CONFIG || !DEBUG_CONFIG.debug || !DEBUG_CONFIG.logToFile) {
    return;
  }
  
  try {
    ensureDebugLogsDir();
    const baseName = DEBUG_CONFIG.logFiles?.actions || 'debug.actions.log';
    const logPath = getCurrentLogPath(baseName);
    fs.appendFileSync(logPath, message + '\n', 'utf8');
    // Only log success message if verbose mode is enabled
    if (!writeToActionLog._firstWrite && DEBUG_CONFIG.verbose) {
      console.log(`[DEBUG] Writing to action log: ${logPath}`);
      writeToActionLog._firstWrite = true;
    }
  } catch (error: any) {
    // Log error to console so we can see what's wrong
    console.error('[DEBUG] Failed to write to action log:', error?.message || error, {
      path: getCurrentLogPath(DEBUG_CONFIG.logFiles?.actions || 'debug.actions.log'),
      debug: DEBUG_CONFIG.debug,
      logToFile: DEBUG_CONFIG.logToFile
    });
  }
}
// Add a flag to track first write
writeToActionLog._firstWrite = false;

// Write to state log file
function writeToStateLog(message: string): void {
  // Don't write to file in browser environment
  if (typeof window !== 'undefined') {
    return;
  }
  
  // Check config
  if (!DEBUG_CONFIG || !DEBUG_CONFIG.debug || !DEBUG_CONFIG.logToFile) {
    return;
  }
  
  try {
    ensureDebugLogsDir();
    const baseName = DEBUG_CONFIG.logFiles?.state || 'debug.state.log';
    const logPath = getCurrentLogPath(baseName);
    fs.appendFileSync(logPath, message + '\n', 'utf8');
    // Only log success message if verbose mode is enabled
    if (!writeToStateLog._firstWrite && DEBUG_CONFIG.verbose) {
      console.log(`[DEBUG] Writing to state log: ${logPath}`);
      writeToStateLog._firstWrite = true;
    }
  } catch (error: any) {
    // Log error to console so we can see what's wrong
    console.error('[DEBUG] Failed to write to state log:', error?.message || error, {
      path: getCurrentLogPath(DEBUG_CONFIG.logFiles?.state || 'debug.state.log'),
      debug: DEBUG_CONFIG.debug,
      logToFile: DEBUG_CONFIG.logToFile
    });
  }
}
// Add a flag to track first write
writeToStateLog._firstWrite = false;

// Enhanced debug logging functions
export function debugLog(message: string, ...args: any[]) {
  if (DEBUG_CONFIG.debug) {
    const timestamp = getTimestamp();
    const caller = DEBUG_CONFIG.includeCallStack ? getCallerInfo() : null;
    
    let logLine = `[${timestamp}]`;
    
    if (caller) {
      logLine += ` [${caller.file}:${caller.function}:${caller.line}]`;
    }
    
    logLine += ` ${message}`;
    
    if (args.length > 0) {
      logLine += ` | ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')}`;
    }
    
    // Write to file if enabled
    if (DEBUG_CONFIG.logToFile) {
      writeToActionLog(logLine);
    }
    
    // Only log to console if verbose mode is enabled
    if (DEBUG_CONFIG.verbose) {
      console.log(`[DEBUG ${timestamp}] ${message}`, ...args);
    }
  }
}

export function debugWarn(message: string, ...args: any[]) {
  if (DEBUG_CONFIG.debug) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.warn(`[DEBUG ${timestamp}] ${message}`, ...args);
  }
}

export function debugError(message: string, ...args: any[]) {
  if (DEBUG_CONFIG.debug) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.error(`[DEBUG ${timestamp}] ${message}`, ...args);
  }
}

// Comprehensive action logging (legacy - use debugActionWithContext for new code)
export function debugAction(category: keyof DebugConfig['logActions'], action: string, details?: any) {
  // Use the new context-aware version
  debugActionWithContext(category, action, undefined, details);
}

// Verbose logging (for very detailed internal operations)
export function debugVerbose(message: string, ...args: any[]) {
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.verbose) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[VERBOSE ${timestamp}] ${message}`, ...args);
  }
}

// State change logging (legacy - use debugStateChangeWithContext for new code)
export function debugStateChange(description: string, oldState: any, newState: any) {
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.logActions.stateChanges) {
    // Calculate changes if possible
    const changes: { [key: string]: { old: any; new: any } } = {};
    if (typeof oldState === 'object' && typeof newState === 'object') {
      // Simple diff - find changed top-level properties
      const allKeys = new Set([...Object.keys(oldState || {}), ...Object.keys(newState || {})]);
      for (const key of allKeys) {
        if (JSON.stringify(oldState?.[key]) !== JSON.stringify(newState?.[key])) {
          changes[key] = { old: oldState?.[key], new: newState?.[key] };
        }
      }
    }
    
    // Use the new context-aware version
    debugStateChangeWithContext('debugStateChange', description, newState, Object.keys(changes).length > 0 ? changes : undefined);
  }
}

// Performance timing utilities
const timers = new Map<string, number>();

export function debugTime(label: string) {
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.performance.enableTiming) {
    timers.set(label, performance.now());
  }
}

export function debugTimeEnd(label: string) {
  if (DEBUG_CONFIG.debug && DEBUG_CONFIG.performance.enableTiming) {
    const startTime = timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      if (DEBUG_CONFIG.performance.logSlowOperations && duration > DEBUG_CONFIG.performance.slowThresholdMs) {
        debugLog(`⚠️  SLOW: ${label}: ${duration.toFixed(2)}ms`);
      } else {
        debugLog(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
      }
      timers.delete(label);
    }
  }
}

// Debug validation utilities
export function debugValidate(condition: boolean, message: string) {
  if (DEBUG_CONFIG.debug && !condition) {
    debugError(`Validation failed: ${message}`);
  }
}

// Debug data inspection
export function debugInspect(data: any, label: string = 'Data') {
  if (DEBUG_CONFIG.debug) {
    debugLog(`${label}:`, JSON.stringify(data, null, 2));
  }
}

// Enhanced action logging with context
export function debugActionWithContext(
  category: keyof DebugConfig['logActions'],
  action: string,
  nextAction?: string,
  details?: any
): void {
  // Double-check config (in case it was reloaded)
  if (!DEBUG_CONFIG.debug) {
    return;
  }
  
  if (!DEBUG_CONFIG.logActions || !DEBUG_CONFIG.logActions[category]) {
    return;
  }
  
  const timestamp = getTimestamp();
  const caller = DEBUG_CONFIG.includeCallStack ? getCallerInfo() : null;
  
  let logLine = `[${timestamp}]`;
  
  if (caller) {
    logLine += ` [${caller.file}:${caller.function}:${caller.line}]`;
  }
  
  logLine += ` → ${action}`;
  
  if (nextAction && DEBUG_CONFIG.includeNextAction) {
    logLine += ` → ${nextAction}`;
  }
  
  if (details) {
    logLine += ` | ${JSON.stringify(details)}`;
  }
  
  // Write to file
  writeToActionLog(logLine);
  
  // Only log to console if verbose mode is enabled
  if (DEBUG_CONFIG.verbose) {
    console.log(`[ACTION ${timestamp}] ${logLine}`);
  }
}

// Enhanced state change logging with context
export function debugStateChangeWithContext(
  trigger: string,
  description: string,
  gameState: any,
  changes?: { [key: string]: { old: any; new: any } }
): void {
  if (!DEBUG_CONFIG.debug || !DEBUG_CONFIG.logActions.stateChanges) {
    return;
  }
  
  const timestamp = getTimestamp();
  const caller = DEBUG_CONFIG.includeCallStack ? getCallerInfo() : null;
  
  let logLine = `[${timestamp}]`;
  
  if (caller) {
    logLine += ` [${caller.file}:${caller.function}:${caller.line}]`;
  }
  
  logLine += ` [TRIGGER: ${trigger}]`;
  logLine += ` ${description}`;
  
  // Write header line
  writeToStateLog(logLine);
  
  // Write changes if provided
  if (changes && Object.keys(changes).length > 0) {
    writeToStateLog('  CHANGES:');
    for (const [key, change] of Object.entries(changes)) {
      writeToStateLog(`    ${key}: ${JSON.stringify(change.old)} → ${JSON.stringify(change.new)}`);
    }
  }
  
  // Write full state if configured - use concise formatting
  if (DEBUG_CONFIG.stateLogging?.fullState) {
    writeToStateLog('  FULL_STATE:');
    const formattedState = formatObjectConcise(gameState, 1);
    writeToStateLog(formattedState);
  }
  
  writeToStateLog('---'); // Separator
  
  // Don't log to console - only file logs for state changes
}
