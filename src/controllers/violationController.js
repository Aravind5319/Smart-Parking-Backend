const appwriteService = require('../services/appwriteService');

// POST /api/violations/report
async function submitViolation(req, res) {
  try {
    const report = await appwriteService.createViolationReport(req.body);
    res.status(201).json({
      success: true,
      message: 'Violation report filed successfully',
      data: report,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// GET /api/violations
async function getViolations(req, res) {
  try {
    const violations = await appwriteService.getAllViolations();
    res.json({
      success: true,
      count: violations.length,
      data: violations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// PATCH /api/violations/:id/status (Police Admin Action)
async function updateStatus(req, res) {
  try {
    const { status, policeNote, challanNumber } = req.body;
    const updated = await appwriteService.updateViolationStatus(req.params.id, {
      status,
      policeNote,
      challanNumber,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({
      success: true,
      message: 'Complaint status updated',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  submitViolation,
  getViolations,
  updateStatus,
};
