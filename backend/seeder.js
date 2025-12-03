// seeder.js
// Description: This script populates the MySQL database with a complete set of realistic fake data.
// Usage: node seeder.js
// Note: Ensure you have installed the required dependencies and updated the database configuration.

// --- DEPENDENCIES ---
// Make sure to install dependencies:
// npm install mysql2 @faker-js/faker bcryptjs

import mysql from 'mysql2/promise';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// --- DATABASE CONNECTION ---
// IMPORTANT: Replace with your actual database credentials
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Your MySQL password, if you have one
    database: 'hafeez_db' // <--- REPLACE THIS with your database name
};

// --- CONFIGURATION ---
const SALT_ROUNDS = 10;
const NUM_CLIENTS = 25;
const NUM_SALES = 100;
const NUM_INVENTORY_ACCOUNTS_PER_PRODUCT = 5;

// --- HELPER FUNCTIONS ---
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const formatDateForMySQL = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

function calculateEndDate(startDate, durationStr) {
    const endDate = new Date(startDate);
    // Default duration if string is invalid
    if (typeof durationStr !== 'string' || durationStr.indexOf(' ') === -1) {
        endDate.setMonth(endDate.getMonth() + 1);
        return endDate;
    }

    const [value, unit] = durationStr.split(' ');
    const intValue = parseInt(value, 10);

    switch (unit.toLowerCase()) {
        case 'month':
        case 'months':
            endDate.setMonth(endDate.getMonth() + intValue);
            break;
        case 'year':
        case 'years':
            endDate.setFullYear(endDate.getFullYear() + intValue);
            break;
        case 'day':
        case 'days':
            endDate.setDate(endDate.getDate() + intValue);
            break;
        default:
            endDate.setMonth(endDate.getMonth() + 1); // Fallback to 1 month
    }
    return endDate;
}

// --- TABLE CLEANUP ---
async function clearTables(connection) {
    console.log("🧹 Clearing existing data...");
    const tables = [
        'logs', 'notifications', 'cashbox', 'agent_performance', 'expenses', 'finance_movements',
        'tickets', 'sales', 'inventory_profiles', 'inventory',
        'products', 'suppliers', 'clients', 'users'
    ];
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    for (const table of tables) {
        try {
            await connection.query(`TRUNCATE TABLE ${table}`);
        } catch (error) {
            // It's okay if a table doesn't exist, we just log it.
            if (error.code === 'ER_NO_SUCH_TABLE') {
            console.warn(`   - Table \`${table}\` not found, skipping.`);
            } else {
                throw error;
            }
        }
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log("   -> All tables cleared.");
}

// --- SEEDER FUNCTIONS ---

async function seedUsers(connection) {
    console.log("🌱 Seeding users...");
    const users = [];
    const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);

    // 1 Admin
    users.push(['admin', passwordHash, 'admin']);
    // 3 Supervisors
    for (let i = 1; i <= 3; i++) {
        users.push([`supervisor${i}`, passwordHash, 'supervisor']);
    }
    // 10 Agents
    for (let i = 1; i <= 10; i++) {
        users.push([`agent${i}`, passwordHash, 'agent']);
    }

    await connection.query('INSERT INTO users (username, password, role) VALUES ?', [users]);

    const [allUsers] = await connection.query('SELECT id, role FROM users');
    const userIds = allUsers.map(u => u.id);
    const agentIds = allUsers.filter(u => u.role === 'agent').map(u => u.id);
    const supervisorIds = allUsers.filter(u => u.role === 'supervisor').map(u => u.id);

    console.log(`   -> ${users.length} users created.`);
    return { userIds, agentIds, supervisorIds };
}

async function seedClients(connection, userIds) {
    console.log("🌱 Seeding clients...");
    const clients = [];
    for (let i = 0; i < NUM_CLIENTS; i++) {
        clients.push([
            faker.person.fullName(),
            faker.phone.number(),
            faker.internet.email(),
            faker.lorem.sentence(),
            randomElement(userIds) // created_by
        ]);
    }
    const [result] = await connection.query('INSERT INTO clients (full_name, phone, email, notes, created_by) VALUES ?', [clients]);
    console.log(`   -> ${clients.length} clients created.`);
    const clientIds = Array.from({ length: result.affectedRows }, (_, i) => result.insertId + i);
    return clientIds;
}

async function seedSuppliers(connection) {
    console.log("🌱 Seeding suppliers...");
    const suppliers = [
        ['Netflix', 'supplies@netflix.com', 'Primary streaming provider'],
        ['HBO', 'accounts@hbo.com', 'Premium content provider'],
        ['Spotify', 'partner@spotify.com', 'Music streaming services'],
        ['Disney+', 'support@disneyplus.com', 'Family-friendly content'],
        ['Amazon Prime', 'prime@amazon.com', 'Multiple services included']
    ];
    const [result] = await connection.query('INSERT INTO suppliers (name, contact, notes) VALUES ?', [suppliers]);
    console.log(`   -> ${suppliers.length} suppliers created.`);
    const supplierIds = Array.from({ length: result.affectedRows }, (_, i) => result.insertId + i);
    return supplierIds;
}

async function seedProducts(connection, supplierIds) {
    console.log("🌱 Seeding products...");
    const products = [
        // Netflix
        [supplierIds[0], 'Netflix Basic', 'Streaming', 15.99, 5.00, '1 month', true, 1, 200],
        [supplierIds[0], 'Netflix Premium', 'Streaming', 21.99, 7.50, '1 month', true, 4, 250],
        // HBO
        [supplierIds[1], 'HBO Max Standard', 'Streaming', 18.99, 6.50, '1 month', true, 2, 220],
        // Spotify
        [supplierIds[2], 'Spotify Personal', 'Music', 10.99, 3.00, '1 month', false, 1, 300],
        [supplierIds[2], 'Spotify Family', 'Music', 16.99, 5.50, '3 months', true, 6, 280],
        // Disney+
        [supplierIds[3], 'Disney+ Yearly', 'Streaming', 139.99, 40.00, '1 year', true, 4, 300],
        // Amazon
        [supplierIds[4], 'Amazon Prime Video', 'Streaming', 8.99, 2.50, '1 month', false, 3, 310]
    ];

    const [result] = await connection.query(
        'INSERT INTO products (supplier_id, product_name, type, price, cost, duration, renewable, capacity, roi_target) VALUES ?',
        [products]
    );

    const productData = [];
    const [insertedProducts] = await connection.query('SELECT id, capacity, duration, price, cost FROM products');
    for (const p of insertedProducts) {
        productData.push({
            id: p.id,
            capacity: p.capacity,
            duration: p.duration,
            price: p.price,
            cost: p.cost
        });
    }

    console.log(`   -> ${products.length} products created.`);
    return productData;
}

async function seedInventory(connection, productData) {
    console.log("🌱 Seeding inventory accounts and profiles...");
    let totalProfiles = 0;
    const profileData = [];
    const accountIds = [];

    for (const product of productData) {
        const accounts = [];
        for (let i = 0; i < NUM_INVENTORY_ACCOUNTS_PER_PRODUCT; i++) {
            accounts.push([
                product.id,
                faker.internet.email({ provider: `fake-${product.id}.net` }),
                faker.internet.password()
            ]);
        }
        const [result] = await connection.query(
            'INSERT INTO inventory (product_id, email, password) VALUES ?',
            [accounts]
        );

        const firstAccountId = result.insertId;
        for (let i = 0; i < result.affectedRows; i++) {
            const inventoryId = firstAccountId + i;
            accountIds.push(inventoryId);
            const profiles = [];
            for (let j = 1; j <= product.capacity; j++) {
                profiles.push([inventoryId, `Profile ${j}`]);
            }
            const [profileResult] = await connection.query(
                'INSERT INTO inventory_profiles (inventory_id, profile_name) VALUES ?',
                [profiles]
            );
            totalProfiles += profileResult.affectedRows;

            for (let k = 0; k < profileResult.affectedRows; k++) {
                profileData.push({
                    profileId: profileResult.insertId + k,
                    productId: product.id,
                    duration: product.duration,
                    price: product.price,
                    cost: product.cost
                });
            }
        }
    }

    console.log(`   -> ${accountIds.length} inventory accounts created.`);
    console.log(`   -> ${totalProfiles} inventory profiles created.`);
    return { accountIds, profileData };
}

async function seedSalesAndRenewals(connection, clientIds, profileData, agentIds) {
    console.log("🌱 Seeding sales, renewals, and expirations...");
    const sales = [];
    let usedProfileIds = new Set();
    const availableProfiles = faker.helpers.shuffle([...profileData]);
    let salesCreated = 0;

    for (let i = 0; i < Math.min(NUM_SALES, availableProfiles.length); i++) {
        const profile = availableProfiles[i];
        const saleDate = faker.date.past({ years: 1 });
        const endDate = calculateEndDate(saleDate, profile.duration);
        const now = new Date();

        let status = 'active';
        if (endDate < now) {
            status = 'expired';
        }
        // 10% chance of being cancelled
        if (status === 'active' && Math.random() < 0.1) {
            status = 'cancelled';
        }


        sales.push([
            randomElement(clientIds),
            profile.profileId,
            randomElement(agentIds),
            profile.price,
            profile.cost,
            formatDateForMySQL(saleDate),
            formatDateForMySQL(endDate),
            status
        ]);
        usedProfileIds.add(profile.profileId);
        salesCreated++;
    }

    if (sales.length > 0) {
        await connection.query(
            'INSERT INTO sales (client_id, profile_id, agent_id, price, cost, start_date, end_date, status) VALUES ?',
            [sales]
        );
        const usedProfileIdsArray = Array.from(usedProfileIds);
        await connection.query('UPDATE inventory_profiles SET status = ? WHERE id IN (?)', ['assigned', usedProfileIdsArray]);
    }

    // Fake renewals on some active sales
    const [activeSales] = await connection.query("SELECT id, end_date, profile_id FROM sales WHERE status = 'active' LIMIT 5");

    for (const sale of activeSales) {
        const profile = profileData.find(p => p.profileId === sale.profile_id);
        if (profile) {
            const newEndDate = calculateEndDate(new Date(sale.end_date), profile.duration);
            await connection.query('UPDATE sales SET end_date = ?, status = ? WHERE id = ?', [formatDateForMySQL(newEndDate), 'active', sale.id]);
        }
    }

    console.log(`   -> ${salesCreated} sales created (active, expired, cancelled).`);
    console.log(`   -> ${activeSales.length} active sales had their end dates extended (renewed).`);
}

async function seedTickets(connection, clientIds, agentIds, supervisorIds) {
    console.log("🌱 Seeding tickets...");
    const tickets = [];
    const creators = [...agentIds, ...supervisorIds];
    const types = ['request_account', 'issue', 'other'];
    const priorities = ['low', 'medium', 'high'];
    const statuses = ['open', 'pending', 'assigned', 'closed'];
    const assignees = [...agentIds, ...supervisorIds, null]; // Some tickets can be unassigned

    for (let i = 0; i < clientIds.length * 1.5; i++) {
        const status = randomElement(statuses);
        // Only assign a user if the status is 'assigned'
        const assignedTo = status === 'assigned' ? randomElement(assignees.filter(a => a !== null)) : null;

        tickets.push([
            randomElement(creators), // user_id (creator)
            randomElement(clientIds),
            assignedTo, // assigned_to
            randomElement(types),
            randomElement(priorities),
            faker.lorem.sentence({ min: 5, max: 10 }),
            status,
            faker.date.past({ years: 1 })
        ]);
    }

    await connection.query(
        'INSERT INTO tickets (user_id, client_id, assigned_to, type, priority, description, status, created_at) VALUES ?',
        [tickets]
    );

    console.log(`   -> ${tickets.length} tickets created.`);
}

async function seedPerformance(connection, agentIds) {
    console.log("🌱 Seeding agent performance...");
    const performances = [];
    const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE'];

    for (const agentId of agentIds) {
        const today = new Date();
        for (let i = 0; i < 30; i++) { // 30 unique past days of performance data
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            const salesCount = faker.number.int({ min: 0, max: 8 });
            performances.push([
                agentId,
                formatDateForMySQL(date).split(' ')[0], // Just the date part
                salesCount,
                salesCount * faker.number.float({ min: 10, max: 50 }),
                randomElement(attendanceStatuses),
                faker.lorem.slug()
            ]);
        }
    }
    await connection.query(
        'INSERT INTO agent_performance (agent_id, date, sales_count, revenue_generated, attendance, notes) VALUES ?',
        [performances]
    );
    console.log(`   -> ${performances.length} performance records created.`);
}

async function seedExpenses(connection, userIds) {
    console.log("🌱 Seeding expenses...");
    const expenses = [];
    const categories = ['SUPPLIER', 'OPERATIONS', 'TEAM_PAYMENT', 'OTHER'];

    for (let i = 0; i < 50; i++) {
        expenses.push([
            randomElement(categories),
            faker.finance.amount({ min: 20, max: 1500 }),
            faker.lorem.words(3),
            randomElement(userIds), // created_by
            faker.date.past({ years: 1 }) // created_at
        ]);
    }
    await connection.query(
        'INSERT INTO expenses (category, amount, description, created_by, created_at) VALUES ?',
        [expenses]
    );
    console.log(`   -> ${expenses.length} expense records created.`);
}

async function seedCashbox(connection, userIds) {
    console.log("🌱 Seeding cashbox transactions...");
    const entries = [];
    const types = ['ADD', 'REMOVE'];
    for (let i = 0; i < 100; i++) {
        const type = randomElement(types);
        let amount = type === 'ADD' ?
            faker.finance.amount({ min: 50, max: 500 }) :
            faker.finance.amount({ min: 20, max: 200 });
        entries.push([
            amount,
            type,
            faker.finance.transactionDescription(),
            randomElement(userIds), // created_by
            faker.date.recent({ days: 90 })
        ]);
    }
    await connection.query(
        'INSERT INTO cashbox (amount, movement_type, description, created_by, created_at) VALUES ?',
        [entries]
    );
    console.log(`   -> ${entries.length} cashbox transactions created.`);
}

async function seedNotifications(connection, userIds) {
    console.log("🌱 Seeding notifications...");
    const notifications = [];
    const titles = [
        'New Ticket Assignment',
        'System Maintenance',
        'Performance Reminder',
        'Expiring Sale Alert'
    ];
    const messages = [
        'A new high-priority ticket has been assigned to your team.',
        'Reminder: Weekly performance review is tomorrow.',
        'System update scheduled for tonight at 2 AM.',
        'A sale you manage is expiring in 3 days.',
    ];
    for (let i = 0; i < userIds.length * 5; i++) {
        notifications.push([
            randomElement(userIds),
            randomElement(titles),
            randomElement(messages),
            Math.random() > 0.5, // read_status
            faker.date.recent({ days: 10 })
        ]);
    }
    await connection.query(
        'INSERT INTO notifications (user_id, title, message, read_status, created_at) VALUES ?',
        [notifications]
    );
    console.log(`   -> ${notifications.length} notifications created.`);
}

async function seedLogs(connection, userIds) {
    console.log("🌱 Seeding logs...");
    const logs = [];
    const actions = [
        'USER_LOGIN_SUCCESS', 'CLIENT_CREATED', 'SALE_ADDED',
        'TICKET_STATUS_UPDATED', 'INVENTORY_LOW_STOCK', 'USER_LOGOUT'
    ];
    for (let i = 0; i < 300; i++) {
        logs.push([
            randomElement(userIds),
            randomElement(actions),
            JSON.stringify({ ip: faker.internet.ip() }),
            faker.date.past({ years: 1 })
        ]);
    }
    await connection.query(
        'INSERT INTO logs (user_id, action, details, created_at) VALUES ?',
        [logs]
    );
    console.log(`   -> ${logs.length} log entries created.`);
}

// --- MAIN SEEDER EXECUTION ---
async function seedDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("✅ Database connection successful.");

        await clearTables(connection);

        // Seed data in logical, dependent order
        const { userIds, agentIds, supervisorIds } = await seedUsers(connection);
        const clientIds = await seedClients(connection, userIds);
        const supplierIds = await seedSuppliers(connection);
        const productData = await seedProducts(connection, supplierIds);
        const { profileData } = await seedInventory(connection, productData);
        await seedSalesAndRenewals(connection, clientIds, profileData, agentIds);
        await seedTickets(connection, clientIds, agentIds, supervisorIds);
        await seedPerformance(connection, agentIds);
        await seedExpenses(connection, userIds);
        await seedCashbox(connection, userIds);
        await seedNotifications(connection, userIds);
        await seedLogs(connection, userIds);

        console.log("\n🎉 --- All tables seeded successfully! --- 🎉");

    } catch (error) {
        console.error("\n❌ Seeding failed:", error.message);
        if (error.sql) {
            console.error("   SQL:", error.sql);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log("🔚 Database connection closed.");
        }
    }
}

seedDatabase();
