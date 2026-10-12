const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get user profile by ID
router.get('/:id', userController.getUser);

// Register or update user profile
router.post('/', userController.saveUser);

// Get user Civic Karma points and Sentinel status
router.get('/:id/karma', userController.getUserKarma);

module.exports = router;
