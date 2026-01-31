const express = require('express');
const router = express.Router();
const { getLeads, getLeadById, createLead, updateLead } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

const activityRoutes = require('./activityRoutes');

router.use('/:leadId/activities', activityRoutes);

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);

module.exports = router;
