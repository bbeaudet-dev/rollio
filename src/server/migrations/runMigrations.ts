import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { query } from '../db';

export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    // Read all .sql files from migrations directory and sort them
    const migrationsDir = __dirname;
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically to ensure order
    
    console.log(`  Found ${migrationFiles.length} migration files`);
    
    for (const migrationFile of migrationFiles) {
      console.log(`  Running migration: ${migrationFile}`);
      const migrationPath = join(migrationsDir, migrationFile);
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      await query(migrationSQL);
    }
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

