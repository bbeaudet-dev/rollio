import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../db';

const MIGRATIONS = [
  '001_create_users_table.sql',
  '002_create_game_saves_table.sql',
];

export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    for (const migrationFile of MIGRATIONS) {
      console.log(`  Running migration: ${migrationFile}`);
      const migrationPath = join(__dirname, migrationFile);
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      await query(migrationSQL);
    }
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

