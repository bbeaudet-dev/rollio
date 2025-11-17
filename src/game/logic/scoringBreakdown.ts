/**
 * Scoring Breakdown System
 * 
 * Tracks each step of the scoring transformation process,
 * recording input and output ScoringElements for each effect applied.
 */

import { ScoringElements } from './scoringElements';

export interface ScoringBreakdownStep {
  step: string; // e.g., "baseCombinations", "pipEffect_money_side1", "material_crystal", "charm_flopShield"
  input: ScoringElements;
  output: ScoringElements;
  description: string;
}

export interface ScoringBreakdown {
  steps: ScoringBreakdownStep[];
  final: ScoringElements;
}

/**
 * Builder class for creating scoring breakdowns
 */
export class ScoringBreakdownBuilder {
  private steps: ScoringBreakdownStep[] = [];
  private currentValues: ScoringElements;

  constructor(initialValues: ScoringElements) {
    this.currentValues = initialValues;
  }

  /**
   * Add a step to the breakdown
   */
  addStep(step: string, output: ScoringElements, description: string): void {
    const input = { ...this.currentValues };
    this.steps.push({
      step,
      input,
      output: { ...output },
      description,
    });
    this.currentValues = output;
  }

  /**
   * Get current scoring elements
   */
  getCurrentValues(): ScoringElements {
    return { ...this.currentValues };
  }

  /**
   * Build the final breakdown
   */
  build(): ScoringBreakdown {
    return {
      steps: [...this.steps],
      final: { ...this.currentValues },
    };
  }
}

/**
 * Create a new breakdown builder
 */
export function createBreakdownBuilder(initialValues: ScoringElements): ScoringBreakdownBuilder {
  return new ScoringBreakdownBuilder(initialValues);
}

