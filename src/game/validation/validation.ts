/**
 * Validation utilities for the Rollio game
 * Uses debug utilities for detailed validation output
 */

import { setDebugMode, debugLog, debugTime, debugTimeEnd, debugValidate, debugInspect } from '../utils/debug';
import { getScoringCombinations, getAllPartitionings } from '../logic/scoring';
import { Die } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  debugInfo?: any;
}

/**
 * Validate a dice selection and scoring result
 */
export function validateDiceSelection(
  diceHand: Die[],
  selectedIndices: number[],
  expectedPoints: number,
  debugMode: boolean = false
): ValidationResult {
  setDebugMode(debugMode);
  debugTime('validation');
  
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Validate input
    debugValidate(selectedIndices.length > 0, 'No dice selected');
    debugValidate(selectedIndices.every(i => i >= 0 && i < diceHand.length), 'Invalid dice indices');
    
    // Get scoring combinations
    const combinations = getScoringCombinations(diceHand, selectedIndices, { charms: [] });
    const allPartitionings = getAllPartitionings(diceHand, selectedIndices, { charms: [] });
    
    debugLog('Validation - Combinations found:', combinations.length);
    debugLog('Validation - Partitionings found:', allPartitionings.length);
    
    // Validate scoring
    const actualPoints = combinations.reduce((sum, c) => sum + c.points, 0);
    debugValidate(actualPoints === expectedPoints, `Points mismatch: expected ${expectedPoints}, got ${actualPoints}`);
    
    // Validate partitioning
    debugValidate(allPartitionings.length > 0, 'No valid partitionings found');
    
    // Check for duplicate combinations
    const combinationTypes = combinations.map(c => c.type);
    const uniqueTypes = new Set(combinationTypes);
    if (combinationTypes.length !== uniqueTypes.size) {
      result.warnings.push('Duplicate combination types found');
    }
    
    // Store debug info
    if (debugMode) {
      result.debugInfo = {
        combinations,
        allPartitionings,
        actualPoints,
        expectedPoints,
        selectedDice: selectedIndices.map(i => diceHand[i].rolledValue)
      };
    }
    
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error}`);
  }
  
  debugTimeEnd('validation');
  return result;
}

/**
 * Validate multiple test cases
 */
export function validateTestCases(
  testCases: Array<{
    diceHand: Die[];
    selectedIndices: number[];
    expectedPoints: number;
    description: string;
  }>,
  debugMode: boolean = false
): ValidationResult[] {
  setDebugMode(debugMode);
  debugLog('Starting validation of', testCases.length, 'test cases');
  
  return testCases.map(testCase => {
    debugLog('Validating:', testCase.description);
    return validateDiceSelection(
      testCase.diceHand,
      testCase.selectedIndices,
      testCase.expectedPoints,
      debugMode
    );
  });
}

/**
 * Performance validation - test partitioning algorithm performance
 */
export function validatePerformance(
  diceHand: Die[],
  selectedIndices: number[],
  debugMode: boolean = false
): ValidationResult {
  setDebugMode(debugMode);
  debugTime('performance-test');
  
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Test multiple calls to check for performance issues
    const iterations = 10;
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      getAllPartitionings(diceHand, selectedIndices, { charms: [] });
      const end = performance.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const maxTime = Math.max(...times);
    
    debugLog('Performance - Average time:', avgTime.toFixed(2), 'ms');
    debugLog('Performance - Max time:', maxTime.toFixed(2), 'ms');
    
    // Performance thresholds
    if (avgTime > 100) {
      result.warnings.push(`Slow performance: average ${avgTime.toFixed(2)}ms`);
    }
    
    if (maxTime > 500) {
      result.warnings.push(`Very slow performance: max ${maxTime.toFixed(2)}ms`);
    }
    
    if (debugMode) {
      result.debugInfo = {
        times,
        avgTime,
        maxTime,
        iterations
      };
    }
    
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Performance test error: ${error}`);
  }
  
  debugTimeEnd('performance-test');
  return result;
} 