#!/usr/bin/env ts-node

import { CLIInterface } from './cliInterface';
import { CLIGameEngine } from './CLIGameEngine';

/**
 * CLI entry point for Rollio game
 */
async function main(): Promise<void> {
  const debugMode = process.argv.includes('--debug');
  const cliInterface = new CLIInterface();
  const gameEngine = new CLIGameEngine(cliInterface, debugMode);
  
  try {
    await gameEngine.run();
  } finally {
    cliInterface.close();
  }
}

main().catch(console.error); 