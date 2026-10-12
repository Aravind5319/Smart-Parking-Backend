const appwriteService = require('../services/appwriteService');

// GET /api/advisories
async function getAdvisories(req, res) {
  try {
    const advisories = await appwriteService.getAllAdvisories();
    res.json({
      success: true,
      count: advisories.length,
      data: advisories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/advisories (Police Dispatcher)
async function postAdvisory(req, res) {
  try {
    const newAdv = await appwriteService.createAdvisory(req.body);
    res.status(201).json({
      success: true,
      message: 'Traffic advisory broadcasted',
      data: newAdv,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAdvisories,
  postAdvisory,
};
