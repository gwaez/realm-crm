const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seed = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log(`Creating database ${process.env.DB_NAME} if not exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        await connection.query(`USE \`${process.env.DB_NAME}\``);

        // Run Schema
        const fs = require('fs');
        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema migration...');
        await connection.query(schema);

        // Seed Tenant
        const tenantId = uuidv4(); // Generate a UUID
        console.log(`Seeding Tenant: Demo Real Estate (ID: ${tenantId})`);

        // Check if tenant exists (optional, but for clean run we just insert)
        // Clean tables?
        // await connection.query('DELETE FROM users');
        // await connection.query('DELETE FROM tenants');

        await connection.execute(
            'INSERT INTO tenants (id, name, subscription_status) VALUES (?, ?, ?)',
            [tenantId, 'Demo Real Estate', 'active']
        );

        // Seed Admin User
        const adminPassword = await bcrypt.hash('password123', 10);
        console.log('Seeding Admin User: admin@demo.com / password123');

        await connection.execute(
            'INSERT INTO users (tenant_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [tenantId, 'Admin User', 'admin@demo.com', adminPassword, 'admin', 'active']
        );

        // Seed Employee User
        const empPassword = await bcrypt.hash('password123', 10);
        console.log('Seeding Employee User: agent@demo.com / password123');

        await connection.execute(
            'INSERT INTO users (tenant_id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [tenantId, 'Agent One', 'agent@demo.com', empPassword, 'employee', 'active']
        );

        console.log('Seeding completed successfully.');

    } catch (error) {
        console.error('Seeding failed:', error.message);
        console.error('Ensure MySQL is running and credentials in .env are correct.');
    } finally {
        if (connection) await connection.end();
    }
};

seed();
