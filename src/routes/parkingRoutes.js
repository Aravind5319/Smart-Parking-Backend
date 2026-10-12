const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

// Find nearest available parking bay by GPS coordinates & vehicle
router.get('/nearest', parkingController.getNearestParking);

// Get list of all parking zones (supports ?vehicleType=CAR|BIKE&category=FREE|GOVT&search=...)
router.get('/zones', parkingController.getZones);

// Get single zone details
router.get('/zones/:id', parkingController.getZoneById);

// Create a new parking facility (Admin/Police)
router.post('/zones', parkingController.createZone);

// Update bay occupancy count (IoT Gate / Barrier / ANPR node)
router.put('/zones/:id/occupancy', parkingController.updateOccupancy);

// Simulate IoT sensor heartbeat for live testing
router.post('/zones/:id/sensor-ping', parkingController.simulateIoTPing);

module.exports = router;
