const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Start parking session (Check-in vehicle)
router.post('/start', sessionController.startSession);

// End parking session (Check-out & tariff calculation)
router.post('/:id/end', sessionController.endSession);

module.exports = router;
