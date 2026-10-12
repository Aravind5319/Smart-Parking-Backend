const express = require('express');
const router = express.Router();
const violationController = require('../controllers/violationController');

// Submit new citizen violation report
router.post('/report', violationController.submitViolation);

// List all reports (Citizen tracking & police feed)
router.get('/', violationController.getViolations);

// Update status of report (Police action)
router.patch('/:id/status', violationController.updateStatus);

module.exports = router;
