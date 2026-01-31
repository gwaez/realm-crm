const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Realm CRM API Running' });
});

// Login
app.post('/api/auth/login', async (req, res) => {
    console.log('🔐 Login:', req.body.email);
    try {
        const { email, password } = req.body;
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [users] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
        await conn.end();

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, tenant_id: user.tenant_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        console.log('✅ Login successful:', user.name);
        res.json({ id: user.id, name: user.name, email: user.email, tenant_id: user.tenant_id, role: user.role, token });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [users] = await conn.execute('SELECT id, name, email, role, tenant_id FROM users WHERE id = ?', [decoded.id]);
        await conn.end();

        if (users.length > 0) {
            res.json(users[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Get leads
app.get('/api/leads', async (req, res) => {
    console.log('📋 Get leads');
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [leads] = await conn.execute('SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC', [decoded.tenant_id]);
        await conn.end();

        console.log(`✅ Found ${leads.length} leads`);
        res.json(leads);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create lead
app.post('/api/leads', async (req, res) => {
    console.log('➕ Create lead:', req.body);
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name, email, phone, source, status, budget } = req.body;

        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [result] = await conn.execute(
            'INSERT INTO leads (tenant_id, created_by, assigned_to, full_name, email, phone, source, status, budget_min, budget_max) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [decoded.tenant_id, decoded.id, decoded.id, name, email, phone, source || 'Manual', status || 'New', budget || 0, budget || 0]
        );

        const [newLead] = await conn.execute('SELECT * FROM leads WHERE id = ?', [result.insertId]);
        await conn.end();

        console.log('✅ Lead created:', newLead[0].full_name);
        res.status(201).json(newLead[0]);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single lead by ID
app.get('/api/leads/:id', async (req, res) => {
    console.log('📋 Get lead:', req.params.id);
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [leads] = await conn.execute(
            'SELECT * FROM leads WHERE id = ? AND tenant_id = ?',
            [req.params.id, decoded.tenant_id]
        );

        if (leads.length === 0) {
            await conn.end();
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Get activities for this lead
        const [activities] = await conn.execute(
            'SELECT a.*, u.name as user_name FROM activities a LEFT JOIN users u ON a.user_id = u.id WHERE a.lead_id = ? ORDER BY a.created_at DESC',
            [req.params.id]
        );

        await conn.end();

        const lead = { ...leads[0], activities };
        console.log(`✅ Found lead: ${lead.full_name}`);
        res.json(lead);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update lead
app.put('/api/leads/:id', async (req, res) => {
    console.log('✏️ Update lead:', req.params.id);
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name, email, phone, status, budget, location, notes } = req.body;

        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        await conn.execute(
            'UPDATE leads SET full_name = ?, email = ?, phone = ?, status = ?, budget_min = ?, budget_max = ?, preferred_location = ?, notes = ? WHERE id = ? AND tenant_id = ?',
            [name, email, phone, status, budget, budget, location, notes, req.params.id, decoded.tenant_id]
        );

        const [updated] = await conn.execute('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        await conn.end();

        console.log('✅ Lead updated');
        res.json(updated[0]);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get activities for a lead
app.get('/api/leads/:leadId/activities', async (req, res) => {
    console.log('📋 Get activities for lead:', req.params.leadId);
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [activities] = await conn.execute(
            'SELECT a.*, u.name as user_name FROM activities a LEFT JOIN users u ON a.user_id = u.id WHERE a.lead_id = ? AND a.tenant_id = ? ORDER BY a.created_at DESC',
            [req.params.leadId, decoded.tenant_id]
        );

        await conn.end();
        console.log(`✅ Found ${activities.length} activities`);
        res.json(activities);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create activity
app.post('/api/leads/:leadId/activities', async (req, res) => {
    console.log('➕ Create activity for lead:', req.params.leadId);
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { type, result, comment } = req.body;

        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [activityResult] = await conn.execute(
            'INSERT INTO activities (tenant_id, lead_id, user_id, type, result, comment) VALUES (?, ?, ?, ?, ?, ?)',
            [decoded.tenant_id, req.params.leadId, decoded.id, type, result, comment]
        );

        const [newActivity] = await conn.execute(
            'SELECT a.*, u.name as user_name FROM activities a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?',
            [activityResult.insertId]
        );

        await conn.end();
        console.log('✅ Activity created');
        res.status(201).json(newActivity[0]);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
    console.log('📊 Get dashboard stats');
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Total leads
        const [totalLeads] = await conn.execute(
            'SELECT COUNT(*) as count FROM leads WHERE tenant_id = ?',
            [decoded.tenant_id]
        );

        // New leads this week
        const [newLeadsWeek] = await conn.execute(
            'SELECT COUNT(*) as count FROM leads WHERE tenant_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
            [decoded.tenant_id]
        );

        // Won deals this month
        const [wonDeals] = await conn.execute(
            'SELECT COUNT(*) as count FROM leads WHERE tenant_id = ? AND status = "Won" AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
            [decoded.tenant_id]
        );

        // Overdue follow-ups
        const [overdue] = await conn.execute(
            'SELECT COUNT(*) as count FROM leads WHERE tenant_id = ? AND next_followup_at < NOW() AND status NOT IN ("Won", "Lost", "Disqualified")',
            [decoded.tenant_id]
        );

        await conn.end();

        const stats = {
            totalLeads: totalLeads[0].count,
            newLeadsWeek: newLeadsWeek[0].count,
            wonDeals: wonDeals[0].count,
            overdueFollowups: overdue[0].count
        };

        console.log('✅ Stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});
