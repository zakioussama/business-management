// user_seeder.js
// Description: This script populates the users table with default users for testing login.
// Usage: node backend/user_seeder.js

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// --- DATABASE CONNECTION ---
// IMPORTANT: Replace with your actual database credentials from .env file if needed
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hafeez_db'
};

const SALT_ROUNDS = 10;

async function seedUsers() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("✅ Database connection successful.");

        console.log("🌱 Seeding users...");
        const usersToSeed = [];
        const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);

        // Define users
        const users = [
            { username: 'admin', role: 'admin' },
            { username: 'supervisor', role: 'supervisor' },
            { username: 'agent', role: 'agent' },
            { username: 'client', role: 'client' },
        ];

        // Clear existing users to avoid duplicates
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        await connection.query('TRUNCATE TABLE users');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log("   -> Cleared existing users.");

        for (const user of users) {
            usersToSeed.push([user.username, passwordHash, user.role]);
        }

        await connection.query('INSERT INTO users (username, password, role) VALUES ?', [usersToSeed]);

        console.log(`\n✅ Successfully seeded ${users.length} users.`);
        console.log("You can now log in with the following credentials:");
        users.forEach(user => {
            console.log(`- Username: ${user.username}, Password: password123`);
        });

    } catch (error) {
        console.error("\n❌ Seeding failed:", error.message);
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.error(`   Error: Database '${dbConfig.database}' not found.`);
            console.error(`   Please create the database or update the 'database' field in this script.`);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log("\n🔚 Database connection closed.");
        }
    }
}

seedUsers();
