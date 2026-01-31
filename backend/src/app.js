const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - BEFORE routes
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
});

// Simple health check
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Realm CRM API is running' });
});

// Import Routes (Placeholders for now)
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
});

module.exports = app;
