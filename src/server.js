require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('================================================================');
  console.log('  PARKPUDUVAI SMART PARKING & ENFORCEMENT REST API BACKEND     ');
  console.log('  Puducherry Traffic Police Civic Tech Engine                  ');
  console.log('================================================================');
  console.log(`  Server listening on:  http://localhost:${PORT}`);
  console.log(`  Health Check:         http://localhost:${PORT}/api/health`);
  console.log(`  Parking Zones:        http://localhost:${PORT}/api/parking/zones`);
  console.log(`  Nearest Bay Finder:   http://localhost:${PORT}/api/parking/nearest`);
  console.log(`  Violation Tracking:   http://localhost:${PORT}/api/violations`);
  console.log(`  Traffic Advisories:   http://localhost:${PORT}/api/advisories`);
  console.log('================================================================');
});
