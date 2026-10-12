const { databases, DATABASE_ID, COLLECTIONS } = require('../config/appwrite');
const { Query, ID } = require('node-appwrite');

// Standard verified Puducherry Parking Locations
const INITIAL_PARKING_ZONES = [
  {
    zoneId: 'zone-mission-st',
    name: 'Mission Street Authorized Kerb Parking',
    streetName: 'Mission Street',
    area: 'Heritage Commercial Corridor',
    latitude: 11.9348,
    longitude: 79.8295,
    type: 'PARKING_GREEN',
    category: 'FREE_CIVIC',
    totalSlots: 35,
    occupiedSlots: 14,
    hourlyRate: 'FREE (2h Civic Limit)',
    walkingTimeMin: 3,
    distanceKm: 0.8,
    vehicleTypes: ['2-Wheeler', '4-Wheeler'],
    sensorType: 'ANPR Pole Camera 02 & Magnetic In-Ground Sensors',
    sensorStatus: 'Active (99.8% precision)',
    trafficLevel: 'MODERATE',
    trafficDelayMin: 2,
  },
  {
    zoneId: 'zone-white-town',
    name: 'White Town Kerb Parking',
    streetName: 'Rue Romain Rolland',
    area: 'French Quarter Heritage Zone',
    latitude: 11.9325,
    longitude: 79.8338,
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 20,
    occupiedSlots: 17,
    hourlyRate: '₹20/hr (Municipal Receipt)',
    walkingTimeMin: 2,
    distanceKm: 0.4,
    vehicleTypes: ['4-Wheeler', '2-Wheeler'],
    sensorType: 'ANPR Cam 07 + Ultrasonic Kerb Node',
    sensorStatus: 'Active (3 spots remaining)',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 0,
  },
  {
    zoneId: 'zone-rock-beach-north',
    name: 'Rock Beach North Bay Parking',
    streetName: 'Rue Saint Gilles / Goubert Ave Ext.',
    area: 'Promenade Waterfront North',
    latitude: 11.9360,
    longitude: 79.8355,
    type: 'PARKING_GREEN',
    category: 'FREE_CIVIC',
    totalSlots: 25,
    occupiedSlots: 19,
    hourlyRate: 'FREE (Beach Access Bay)',
    walkingTimeMin: 1,
    distanceKm: 0.5,
    vehicleTypes: ['2-Wheeler', '4-Wheeler'],
    sensorType: 'ANPR Cam 01 (Waterfront Pole)',
    sensorStatus: 'Live Video Feed Active',
    trafficLevel: 'CONGESTED',
    trafficDelayMin: 5,
  },
  {
    zoneId: 'zone-bharathi-park',
    name: 'Bharathi Park Peripheral Lot',
    streetName: 'Rue Suffren',
    area: 'Government & Cultural Enclave',
    latitude: 11.9315,
    longitude: 79.8340,
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 30,
    occupiedSlots: 8,
    hourlyRate: '₹20/hr',
    walkingTimeMin: 2,
    distanceKm: 0.6,
    vehicleTypes: ['4-Wheeler', '2-Wheeler'],
    sensorType: 'Automated Boom Barrier + Ground Loop Sensors',
    sensorStatus: 'Sensors Online (22 vacant)',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 0,
  },
  {
    zoneId: 'zone-old-port',
    name: 'Old Port High-Capacity Facility',
    streetName: 'Goubert Avenue South',
    area: 'South Promenade Port Gate',
    latitude: 11.9265,
    longitude: 79.8345,
    type: 'PARKING_GREEN',
    category: 'GOVT_MUNICIPAL',
    totalSlots: 60,
    occupiedSlots: 18,
    hourlyRate: '₹30/day (High Capacity Lot)',
    walkingTimeMin: 7,
    distanceKm: 1.1,
    vehicleTypes: ['Tourist Buses', '4-Wheeler', '2-Wheeler'],
    sensorType: 'Smart Gate ANPR Barcode Scanner',
    sensorStatus: 'High Availability (42 spots vacant)',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 1,
  },
  {
    zoneId: 'zone-bussy-st',
    name: 'Bussy Street Municipal Bike Bay',
    streetName: 'Bussy Street',
    area: 'Boulevard Town West',
    latitude: 11.9310,
    longitude: 79.8275,
    type: 'PARKING_GREEN',
    category: 'FREE_CIVIC',
    totalSlots: 28,
    occupiedSlots: 16,
    hourlyRate: 'FREE (Two-Wheeler Priority)',
    walkingTimeMin: 5,
    distanceKm: 0.9,
    vehicleTypes: ['2-Wheeler'],
    sensorType: 'Kerb Magnetometer Sensor Array',
    sensorStatus: 'Active (12 bike slots available)',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 1,
  },
];

// Initial mock users
const INITIAL_USERS = [
  {
    userId: 'usr_001',
    name: 'Aravind K',
    phone: '+91 98401 23456',
    email: 'aravind@example.com',
    vehicleNumber: 'PY-01-BX-4321',
    vehicleType: 'CAR',
    karmaPoints: 200,
    role: 'CITIZEN',
    createdAt: new Date().toISOString(),
  },
  {
    userId: 'usr_police_admin',
    name: 'Puducherry Traffic Sentinel',
    phone: '103',
    email: 'traffic.police@py.gov.in',
    vehicleNumber: 'PY-01-POLICE-01',
    vehicleType: 'CAR',
    karmaPoints: 1000,
    role: 'POLICE_ADMIN',
    createdAt: new Date().toISOString(),
  },
];

// Initial advisories
const INITIAL_ADVISORIES = [
  {
    id: 'adv-01',
    title: 'Beach Promenade Evening Vehicle Curfew',
    description: 'Goubert Avenue is pedestrian-only between 17:00 and 06:00. Park at Old Port Lot or Saint Gilles Free Bay.',
    severity: 'HIGH',
    activeTime: 'Daily 17:00 - 06:00',
    affectedRoads: 'Goubert Avenue, Promenade Rock Beach',
  },
  {
    id: 'adv-02',
    title: 'Mission Street Alternate Kerb Parking Rule',
    description: 'Single-side alternate parking active on West kerb only. East kerb is strict tow-away corridor.',
    severity: 'MEDIUM',
    activeTime: 'Active 24/7',
    affectedRoads: 'Mission Street (Bussy St to Rangapillai St)',
  },
  {
    id: 'adv-03',
    title: 'Emergency Medical Corridor Clearance',
    description: 'Priority ambulance path to IGMCRI Hospital. Zero curb obstruction tolerated.',
    severity: 'EMERGENCY',
    activeTime: 'Immediate & Continuous',
    affectedRoads: 'Vazhudavur Road, Gorimedu Junction',
  },
];

// In-Memory Fallback State (Ensures zero downtime)
let memoryZones = [...INITIAL_PARKING_ZONES];
let memoryUsers = [...INITIAL_USERS];
let memoryViolations = [];
let memoryAdvisories = [...INITIAL_ADVISORIES];
let memorySessions = [];

// ============================================================================
// PARKING SERVICE METHODS
// ============================================================================

async function getAllParkingZones() {
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PARKING_ZONES);
    if (res.documents && res.documents.length > 0) {
      return res.documents;
    }
  } catch (err) {
    // Graceful fallback
  }
  return memoryZones;
}

async function getZoneById(zoneId) {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.PARKING_ZONES, zoneId);
    if (doc) return doc;
  } catch (err) {}
  return memoryZones.find((z) => z.zoneId === zoneId || z.id === zoneId) || null;
}

async function updateZoneOccupancy(zoneId, occupiedSlots) {
  const zone = memoryZones.find((z) => z.zoneId === zoneId || z.id === zoneId);
  if (zone) {
    zone.occupiedSlots = parseInt(occupiedSlots);
    zone.isFull = zone.occupiedSlots >= (zone.totalSlots || 0);
  }

  try {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PARKING_ZONES, zoneId, {
      occupiedSlots: parseInt(occupiedSlots),
    });
  } catch (err) {}

  return zone;
}

async function createParkingZone(zoneData) {
  const newZone = {
    zoneId: zoneData.zoneId || 'zone-' + Date.now().toString(36),
    name: zoneData.name,
    streetName: zoneData.streetName,
    area: zoneData.area,
    latitude: parseFloat(zoneData.latitude),
    longitude: parseFloat(zoneData.longitude),
    type: zoneData.type || 'PARKING_GREEN',
    category: zoneData.category || 'FREE_CIVIC',
    totalSlots: parseInt(zoneData.totalSlots) || 20,
    occupiedSlots: parseInt(zoneData.occupiedSlots) || 0,
    hourlyRate: zoneData.hourlyRate || 'FREE',
    walkingTimeMin: parseInt(zoneData.walkingTimeMin) || 3,
    distanceKm: parseFloat(zoneData.distanceKm) || 0.5,
    vehicleTypes: zoneData.vehicleTypes || ['2-Wheeler', '4-Wheeler'],
    sensorType: zoneData.sensorType || 'Manual Bay',
    sensorStatus: zoneData.sensorStatus || 'Active',
    trafficLevel: zoneData.trafficLevel || 'SMOOTH',
    trafficDelayMin: parseInt(zoneData.trafficDelayMin) || 0,
  };

  memoryZones.push(newZone);

  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PARKING_ZONES,
      newZone.zoneId,
      newZone
    );
    return doc;
  } catch (err) {}

  return newZone;
}

// ============================================================================
// USER SERVICE METHODS
// ============================================================================

async function getUserById(userId) {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId);
    if (doc) return doc;
  } catch (err) {}
  return memoryUsers.find((u) => u.userId === userId) || null;
}

async function createOrUpdateUser(userData) {
  const userId = userData.userId || 'usr_' + Date.now().toString(36);
  const existing = memoryUsers.find((u) => u.userId === userId || u.phone === userData.phone);

  const record = {
    userId,
    name: userData.name || 'Citizen User',
    phone: userData.phone || '',
    email: userData.email || '',
    vehicleNumber: userData.vehicleNumber || '',
    vehicleType: userData.vehicleType || 'CAR',
    karmaPoints: userData.karmaPoints !== undefined ? userData.karmaPoints : (existing ? existing.karmaPoints : 150),
    role: userData.role || 'CITIZEN',
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    Object.assign(existing, record);
  } else {
    record.createdAt = new Date().toISOString();
    memoryUsers.push(record);
  }

  try {
    if (existing) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, userId, record);
    } else {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.USERS, userId, record);
    }
  } catch (err) {}

  return record;
}

// ============================================================================
// VIOLATIONS / COMPLAINTS
// ============================================================================

async function createViolationReport(reportData) {
  const report = {
    id: 'rep_' + Date.now().toString(36),
    referenceNo: 'PTP-' + Math.floor(10000 + Math.random() * 90000),
    photoUri: reportData.photoUri || null,
    latitude: parseFloat(reportData.latitude || reportData.location?.latitude || 11.9338),
    longitude: parseFloat(reportData.longitude || reportData.location?.longitude || 79.8310),
    landmark: reportData.landmark || reportData.location?.landmark || 'Puducherry Town',
    vehicleNumber: (reportData.vehicleNumber || 'PY-01-UNKNOWN').toUpperCase(),
    violationType: reportData.violationType || 'NO_PARKING_ZONE',
    otherDescription: reportData.otherDescription || '',
    timestamp: reportData.timestamp || new Date().toLocaleString(),
    status: 'SUBMITTED',
    karmaPoints: 50,
    policeNote: 'Received at Puducherry Traffic Control Room. Assigned for verification.',
    challanNumber: null,
    createdAt: new Date().toISOString(),
  };

  memoryViolations.unshift(report);

  try {
    await databases.createDocument(DATABASE_ID, COLLECTIONS.VIOLATIONS, report.id, report);
  } catch (err) {}

  return report;
}

async function getAllViolations() {
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.VIOLATIONS);
    if (res.documents && res.documents.length > 0) {
      return res.documents;
    }
  } catch (err) {}
  return memoryViolations;
}

async function updateViolationStatus(reportId, updateData) {
  const report = memoryViolations.find((v) => v.id === reportId || v.referenceNo === reportId);
  if (report) {
    if (updateData.status) report.status = updateData.status;
    if (updateData.policeNote) report.policeNote = updateData.policeNote;
    if (updateData.challanNumber) report.challanNumber = updateData.challanNumber;
  }

  try {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.VIOLATIONS, reportId, updateData);
  } catch (err) {}

  return report;
}

// ============================================================================
// TRAFFIC ADVISORIES
// ============================================================================

async function getAllAdvisories() {
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ADVISORIES);
    if (res.documents && res.documents.length > 0) {
      return res.documents;
    }
  } catch (err) {}
  return memoryAdvisories;
}

async function createAdvisory(advisoryData) {
  const advisory = {
    id: 'adv_' + Date.now().toString(36),
    title: advisoryData.title,
    description: advisoryData.description,
    severity: advisoryData.severity || 'HIGH',
    activeTime: advisoryData.activeTime || 'Active Now',
    affectedRoads: advisoryData.affectedRoads || 'Boulevard Corridor',
    createdAt: new Date().toISOString(),
  };

  memoryAdvisories.unshift(advisory);

  try {
    await databases.createDocument(DATABASE_ID, COLLECTIONS.ADVISORIES, advisory.id, advisory);
  } catch (err) {}

  return advisory;
}

// ============================================================================
// PARKING SESSIONS (Check-in / Check-out)
// ============================================================================

async function startParkingSession(sessionData) {
  const session = {
    sessionId: 'ses_' + Date.now().toString(36),
    zoneId: sessionData.zoneId,
    userId: sessionData.userId || 'guest',
    vehicleNumber: sessionData.vehicleNumber,
    vehicleType: sessionData.vehicleType || 'CAR',
    startTime: new Date().toISOString(),
    status: 'ACTIVE',
    amountPaid: 0,
  };

  memorySessions.unshift(session);

  // Increment occupied slot in the corresponding zone
  const zone = memoryZones.find((z) => z.zoneId === session.zoneId);
  if (zone) {
    await updateZoneOccupancy(zone.zoneId, (zone.occupiedSlots || 0) + 1);
  }

  return session;
}

async function endParkingSession(sessionId) {
  const session = memorySessions.find((s) => s.sessionId === sessionId);
  if (!session) return null;

  session.endTime = new Date().toISOString();
  session.status = 'COMPLETED';

  // Decrement occupied slot
  const zone = memoryZones.find((z) => z.zoneId === session.zoneId);
  if (zone && zone.occupiedSlots > 0) {
    await updateZoneOccupancy(zone.zoneId, zone.occupiedSlots - 1);
  }

  return session;
}

module.exports = {
  getAllParkingZones,
  getZoneById,
  updateZoneOccupancy,
  createParkingZone,
  getUserById,
  createOrUpdateUser,
  createViolationReport,
  getAllViolations,
  updateViolationStatus,
  getAllAdvisories,
  createAdvisory,
  startParkingSession,
  endParkingSession,
};
