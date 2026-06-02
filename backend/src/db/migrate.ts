import pool from '../config/db';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  try {
    console.log('🔄 Running migrations...');
    const sql = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );
    await pool.query(sql);
    console.log('✅ Tables created successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();