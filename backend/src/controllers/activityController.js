const pool = require('../config/db');

// @desc    Get activities for a lead
// @route   GET /api/leads/:leadId/activities
const getActivities = async (req, res) => {
    try {
        const [activities] = await pool.execute(
            `SELECT a.*, u.name as user_name 
       FROM activities a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.lead_id = ? AND a.tenant_id = ? 
       ORDER BY a.created_at DESC`,
            [req.params.leadId, req.user.tenant_id]
        );
        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Log an activity
// @route   POST /api/leads/:leadId/activities
const createActivity = async (req, res) => {
    const { type, result, comment } = req.body;

    try {
        // Verify lead exists and belongs to tenant
        const [leads] = await pool.execute('SELECT id FROM leads WHERE id = ? AND tenant_id = ?', [req.params.leadId, req.user.tenant_id]);
        if (leads.length === 0) return res.status(404).json({ message: 'Lead not found' });

        await pool.execute(
            `INSERT INTO activities (tenant_id, lead_id, user_id, type, result, comment) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.tenant_id, req.params.leadId, req.user.id, type, result, comment]
        );

        res.status(201).json({ message: 'Activity logged' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getActivities, createActivity };
