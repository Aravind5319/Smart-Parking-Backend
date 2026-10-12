/**
 * Geo Calculation Utility for Smart Parking Guidance
 */

// Haversine formula to compute great-circle distance between two GPS coordinates
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(2));
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Estimate walking time in minutes (average 4.8 km/h or 80 meters/minute)
function estimateWalkingTimeMin(distanceKm) {
  return Math.max(1, Math.round((distanceKm * 1000) / 80));
}

module.exports = {
  getDistanceKm,
  estimateWalkingTimeMin,
};
