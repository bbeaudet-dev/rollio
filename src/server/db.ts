import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse connection string or use individual env vars
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?sslmode=require`;

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Neon, Supabase, and other cloud PostgreSQL providers
  },
  max: 20, // Maximum number of clients in the pool (good for Render)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Wait 5 seconds for connection (Render can be slower)
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Helper function to run queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

