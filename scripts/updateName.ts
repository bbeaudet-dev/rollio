#!/usr/bin/env ts-node
/**
 * updateName.ts
 * Usage: npx ts-node scripts/updateName.ts <NewName>
 *
 * Updates all references to the game name (Rollio) in markdown, code, and config files.
 * Updates all variants (lowercase, uppercase, emoji, etc.) using src/game/nameConfig.ts as the source of truth for variant formats.
 *
 * - Updates src/game/nameConfig.ts with the new name and variants
 * - Replaces old name in .md, .ts, .tsx, .json, .html files
 * - Prints a summary of changes
 */

import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');
const nameConfigPath = path.join(rootDir, 'scripts/nameConfig.ts');
const historyPath = path.join(__dirname, 'updateNameHistory.json');

const defaultTemplates = {
  GAME_CLI_DESCRIPTION_SHORT: (name: string) => `Dice-rolling roguelike adventure in your terminal.`,
  GAME_CLI_DESCRIPTION_MEDIUM: (name: string) => `Play ${name}, a dice-rolling roguelike, from your terminal with a robust CLI and unique mechanics.`,
  GAME_CLI_DESCRIPTION_LONG: (name: string) => `Experience ${name}, the dice-rolling roguelike, in your terminal. Enjoy a robust CLI, leprechaun-inspired luck features, and a blend of classic and new dice game mechanics.`,
  GAME_WEB_DESCRIPTION_SHORT: (name: string) => `Dice-rolling roguelike adventure in your browser.`,
  GAME_WEB_DESCRIPTION_MEDIUM: (name: string) => `Play ${name}, a dice-rolling roguelike, with a modern web interface and unique luck-based mechanics.`,
  GAME_WEB_DESCRIPTION_LONG: (name: string) => `${name} brings a fresh roguelike twist to dice games in your browser. Enjoy a modern UI, leprechaun-themed luck mechanics, and a blend of classic and innovative gameplay elements.`
};

function getVariants(newName: string) {
  const base = newName.trim();
  return {
    GAME_NAME: base,
    GAME_NAME_LOWER: base.toLowerCase(),
    GAME_NAME_UPPER: base.toUpperCase(),
    GAME_NAME_EMOJI: `🎲 ${base}`,
    GAME_NAME_EMOJI_UPPER: `🎲 ${base.toUpperCase()}`,
    GAME_SUBTITLE: 'A dice-rolling roguelike',
    GAME_CLI_DESCRIPTION_SHORT: defaultTemplates.GAME_CLI_DESCRIPTION_SHORT(base),
    GAME_CLI_DESCRIPTION_MEDIUM: defaultTemplates.GAME_CLI_DESCRIPTION_MEDIUM(base),
    GAME_CLI_DESCRIPTION_LONG: defaultTemplates.GAME_CLI_DESCRIPTION_LONG(base),
    GAME_WEB_DESCRIPTION_SHORT: defaultTemplates.GAME_WEB_DESCRIPTION_SHORT(base),
    GAME_WEB_DESCRIPTION_MEDIUM: defaultTemplates.GAME_WEB_DESCRIPTION_MEDIUM(base),
    GAME_WEB_DESCRIPTION_LONG: defaultTemplates.GAME_WEB_DESCRIPTION_LONG(base)
  };
}

function updateNameConfig(newName: string) {
  const variants = getVariants(newName);
  let content = `export type GameMeta = {\n`;
  Object.keys(variants).forEach(key => {
    content += `  ${key}: string;\n`;
  });
  content += `};\n\nexport const GAME_META: GameMeta = ${JSON.stringify(variants, null, 2)};\n`;
  fs.writeFileSync(nameConfigPath, content, 'utf8');
  console.log(`Updated src/game/nameConfig.ts with new name: ${newName}`);
  return variants;
}

function walk(dir: string, exts: string[], files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === '.git') continue;
      walk(full, exts, files);
    } else if (exts.some(ext => full.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function replaceInFile(file: string, oldVariants: Record<string, string>, newVariants: Record<string, string>) {
  let content = fs.readFileSync(file, 'utf8');
  let replaced = false;
  for (const key of Object.keys(oldVariants)) {
    const oldVal = oldVariants[key];
    const newVal = newVariants[key];
    if (oldVal && newVal && oldVal !== newVal) {
      const regex = new RegExp(oldVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newVal);
        replaced = true;
      }
    }
  }
  if (replaced) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
}

function getCurrentVariants(): Record<string, string> {
  const content = fs.readFileSync(nameConfigPath, 'utf8');
  const variants: Record<string, string> = {};
  const match = content.match(/export const GAME_META: GameMeta = (\{[\s\S]*?\});/);
  if (match) {
    const obj = JSON.parse(match[1]);
    Object.assign(variants, obj);
  }
  return variants;
}

function appendHistory(newName: string) {
  const variants = getVariants(newName);
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {
      history = [];
    }
  }
  history.push({
    date: new Date().toISOString(),
    ...variants
  });
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
  console.log(`Appended to updateNameHistory.json: ${newName}`);
}

function main() {
  const newName = process.argv[2];
  if (!newName) {
    console.error('Usage: npx ts-node scripts/updateName.ts <NewName>');
    process.exit(1);
  }
  const oldVariants = getCurrentVariants();
  const newVariants = updateNameConfig(newName);
  const files = walk(rootDir, ['.md', '.ts', '.tsx', '.json', '.html']);
  for (const file of files) {
    if (file === nameConfigPath) continue;
    replaceInFile(file, oldVariants, newVariants);
  }
  appendHistory(newName);
  console.log('Done updating game name!');
}

if (require.main === module) {
  main();
} 