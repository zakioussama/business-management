import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lundi_evening_db',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully.');
    connection.release();
  } catch (error) {
    console.error('Error connecting to MySQL:');
    console.error(error);
    // Exit process with failure
    process.exit(1);
  }
};

// Export the pool to be used in models
export default pool;
