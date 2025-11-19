import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../db';

export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    // Read and execute migration file
    const migrationPath = join(__dirname, '001_create_users_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    await query(migrationSQL);
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

