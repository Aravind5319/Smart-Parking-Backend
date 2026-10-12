const appwriteService = require('../services/appwriteService');

// POST /api/parking/sessions/start
async function startSession(req, res) {
  try {
    const { zoneId, vehicleNumber, vehicleType, userId } = req.body;
    if (!zoneId || !vehicleNumber) {
      return res.status(400).json({ success: false, message: 'zoneId and vehicleNumber are required' });
    }

    const session = await appwriteService.startParkingSession({
      zoneId,
      vehicleNumber,
      vehicleType,
      userId,
    });

    res.status(201).json({
      success: true,
      message: 'Parking session started. Bay reserved.',
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/parking/sessions/:id/end
async function endSession(req, res) {
  try {
    const session = await appwriteService.endParkingSession(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Active session not found' });
    }

    // Calculate duration in minutes
    const start = new Date(session.startTime).getTime();
    const end = new Date(session.endTime).getTime();
    const durationMins = Math.max(1, Math.round((end - start) / 60000));

    // Tariff calculation: Free first 2 hours for civic bays, or ₹20/hr
    const isFreeCivic = session.zoneId.includes('free') || session.zoneId.includes('mission');
    let tariff = 0;
    if (!isFreeCivic) {
      const hours = Math.ceil(durationMins / 60);
      tariff = hours * 20;
    }

    session.durationMins = durationMins;
    session.tariffAmount = tariff;

    res.json({
      success: true,
      message: 'Parking session ended. Bay released.',
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  startSession,
  endSession,
};
