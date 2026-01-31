const pool = require('../config/db');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
    try {
        const { status, assigned_to, search } = req.query;

        let query = `
      SELECT l.*, u.name as assigned_name 
      FROM leads l 
      LEFT JOIN users u ON l.assigned_to = u.id 
      WHERE l.tenant_id = ?
    `;
        const params = [req.user.tenant_id];

        if (status) {
            query += ' AND l.status = ?';
            params.push(status);
        }

        if (assigned_to) {
            query += ' AND l.assigned_to = ?';
            params.push(assigned_to);
        }

        // Simple search implementation
        if (search) {
            query += ' AND (l.full_name LIKE ? OR l.phone LIKE ? OR l.email LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += ' ORDER BY l.created_at DESC';

        const [leads] = await pool.execute(query, params);
        res.json(leads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
    try {
        const [leads] = await pool.execute(
            'SELECT * FROM leads WHERE id = ? AND tenant_id = ?',
            [req.params.id, req.user.tenant_id]
        );

        if (leads.length === 0) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json(leads[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
    const { full_name, phone, email, source, interest_type, status, notes } = req.body;

    try {
        const [result] = await pool.execute(
            `INSERT INTO leads (tenant_id, created_by, full_name, phone, email, source, interest_type, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.tenant_id, req.user.id, full_name, phone, email, source, interest_type, status || 'New', notes]
        );

        const newLeadId = result.insertId;
        const [newLead] = await pool.execute('SELECT * FROM leads WHERE id = ?', [newLeadId]);

        res.status(201).json(newLead[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
    const { status, assigned_to, notes, next_followup_at } = req.body;

    try {
        // Check ownership/tenant
        const [leads] = await pool.execute('SELECT * FROM leads WHERE id = ? AND tenant_id = ?', [req.params.id, req.user.tenant_id]);
        if (leads.length === 0) return res.status(404).json({ message: 'Lead not found' });

        const fields = [];
        const params = [];

        if (status) { fields.push('status = ?'); params.push(status); }
        if (assigned_to) { fields.push('assigned_to = ?'); params.push(assigned_to); }
        if (notes) { fields.push('notes = ?'); params.push(notes); }
        if (next_followup_at) { fields.push('next_followup_at = ?'); params.push(next_followup_at); }

        if (fields.length === 0) return res.json(leads[0]);

        params.push(req.params.id);
        params.push(req.user.tenant_id);

        await pool.execute(`UPDATE leads SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`, params);

        const [updatedLead] = await pool.execute('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        res.json(updatedLead[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getLeads, getLeadById, createLead, updateLead };
