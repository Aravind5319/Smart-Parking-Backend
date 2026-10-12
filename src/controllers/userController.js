const appwriteService = require('../services/appwriteService');

// GET /api/users/:id
async function getUser(req, res) {
  try {
    const user = await appwriteService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/users
async function saveUser(req, res) {
  try {
    const user = await appwriteService.createOrUpdateUser(req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// GET /api/users/:id/karma
async function getUserKarma(req, res) {
  try {
    const user = await appwriteService.getUserById(req.params.id);
    const points = user ? user.karmaPoints || 150 : 150;

    let tier = 'Civic Driver';
    if (points >= 500) tier = 'Traffic Guardian';
    else if (points >= 200) tier = 'Traffic Sentinel';

    res.json({
      success: true,
      userId: req.params.id,
      karmaPoints: points,
      tier,
      privileges: [
        'Priority Free Kerb Parking Allocation',
        'Discounted Municipal Barrier Tariffs',
        'Direct Traffic Control Room Reporting Line',
      ],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getUser,
  saveUser,
  getUserKarma,
};
