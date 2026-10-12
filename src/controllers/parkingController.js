const appwriteService = require('../services/appwriteService');
const { getDistanceKm, estimateWalkingTimeMin } = require('../services/geoService');

// GET /api/parking/zones
async function getZones(req, res) {
  try {
    const { vehicleType, category, search } = req.query;
    let zones = await appwriteService.getAllParkingZones();

    // Filter by vehicle type
    if (vehicleType) {
      const typeStr = vehicleType.toUpperCase() === 'BIKE' ? '2-Wheeler' : '4-Wheeler';
      zones = zones.filter((z) => {
        const allowedTypes = z.vehicleTypes || (z.name && z.name.toLowerCase().includes('bike') ? ['2-Wheeler'] : ['4-Wheeler', '2-Wheeler']);
        return allowedTypes.includes(typeStr);
      });
    }

    // Filter by category
    if (category) {
      zones = zones.filter((z) => z.category === category.toUpperCase());
    }

    // Filter by search keyword
    if (search) {
      const q = search.toLowerCase();
      zones = zones.filter(
        (z) =>
          (z.name && z.name.toLowerCase().includes(q)) ||
          (z.streetName && z.streetName.toLowerCase().includes(q)) ||
          (z.area && z.area.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: zones.length,
      data: zones,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/parking/zones/:id
async function getZoneById(req, res) {
  try {
    const zone = await appwriteService.getZoneById(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Parking zone not found' });
    }
    res.json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/parking/nearest
async function getNearestParking(req, res) {
  try {
    const lat = parseFloat(req.query.lat || req.query.latitude || 11.9338);
    const lng = parseFloat(req.query.lng || req.query.longitude || 79.8310);
    const vehicleType = (req.query.vehicleType || 'CAR').toUpperCase();

    const zones = await appwriteService.getAllParkingZones();
    const typeStr = vehicleType === 'BIKE' ? '2-Wheeler' : '4-Wheeler';

    // Filter authorized and available zones
    const candidateZones = zones.filter((z) => {
      const allowedTypes = z.vehicleTypes || (z.name && z.name.toLowerCase().includes('bike') ? ['2-Wheeler'] : ['4-Wheeler', '2-Wheeler']);
      return (
        z.type === 'PARKING_GREEN' &&
        allowedTypes.includes(typeStr) &&
        (z.occupiedSlots || 0) < (z.totalSlots || 20)
      );
    });

    if (candidateZones.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All nearby authorized zones are currently full',
        data: null,
      });
    }

    // Calculate distance and sort
    const ranked = candidateZones.map((zone) => {
      const distanceKm = getDistanceKm(lat, lng, zone.latitude, zone.longitude);
      const walkingTimeMin = estimateWalkingTimeMin(distanceKm);
      return {
        ...zone,
        distanceKm,
        walkingTimeMin,
      };
    });

    ranked.sort((a, b) => a.distanceKm - b.distanceKm);

    const nearest = ranked[0];

    res.json({
      success: true,
      origin: { latitude: lat, longitude: lng },
      vehicleType,
      data: nearest,
      alternatives: ranked.slice(1, 4),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/parking/zones
async function createZone(req, res) {
  try {
    const newZone = await appwriteService.createParkingZone(req.body);
    res.status(201).json({ success: true, data: newZone });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// PUT /api/parking/zones/:id/occupancy
async function updateOccupancy(req, res) {
  try {
    const { occupiedSlots } = req.body;
    if (occupiedSlots === undefined) {
      return res.status(400).json({ success: false, message: 'occupiedSlots is required' });
    }

    const updated = await appwriteService.updateZoneOccupancy(req.params.id, occupiedSlots);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/parking/zones/:id/sensor-ping (IoT Simulation)
async function simulateIoTPing(req, res) {
  try {
    const zone = await appwriteService.getZoneById(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    // Delta: +1, -1, or 0
    const delta = Math.floor(Math.random() * 3) - 1;
    const newOccupied = Math.max(0, Math.min(zone.totalSlots || 30, (zone.occupiedSlots || 10) + delta));

    const updated = await appwriteService.updateZoneOccupancy(req.params.id, newOccupied);

    res.json({
      success: true,
      message: 'IoT sensor heartbeat processed',
      sensorPing: {
        timestamp: new Date().toISOString(),
        delta,
        newOccupied,
        vacantSlots: (zone.totalSlots || 30) - newOccupied,
      },
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getZones,
  getZoneById,
  getNearestParking,
  createZone,
  updateOccupancy,
  simulateIoTPing,
};
