const express = require('express');
const router = express.Router();
const advisoryController = require('../controllers/advisoryController');

// Get all traffic bulletins & advisories
router.get('/', advisoryController.getAdvisories);

// Post a new traffic bulletin (Police dispatch)
router.post('/', advisoryController.postAdvisory);

module.exports = router;
