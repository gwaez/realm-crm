const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (id, tenant_id, role) => {
    return jwt.sign({ id, tenant_id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    console.log('🔐 Login attempt received');
    const { email, password } = req.body;
    console.log('Email:', email);

    try {
        // 1. Find user by email
        console.log('Querying database for user...');
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        console.log('Users found:', users.length);

        if (users.length === 0) {
            console.log('❌ No user found with this email');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];
        console.log('✅ User found:', user.name);

        // 2. Check password
        console.log('Comparing password...');
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Password match:', isMatch);

        if (isMatch) {
            console.log('✅ Login successful, generating token...');
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                tenant_id: user.tenant_id,
                role: user.role,
                token: generateToken(user.id, user.tenant_id, user.role),
            });
        } else {
            console.log('❌ Password mismatch');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('❌ Login Error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // req.user is populated by protect middleware
    const [users] = await pool.execute('SELECT id, name, email, role, tenant_id FROM users WHERE id = ?', [req.user.id]);

    if (users.length > 0) {
        res.json(users[0]);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { loginUser, getMe };
