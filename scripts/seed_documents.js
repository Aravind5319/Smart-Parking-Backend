const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '6ac891a8002a7a9efbf8')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.APPWRITE_DATABASE_ID || '6ac8ad70001ee5f1f58d';

const REAL_PUDUCHERRY_ZONES = [
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
    hourlyRate: 'Rs 20/hr (Municipal Receipt)',
    walkingTimeMin: 2,
    distanceKm: 0.4,
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
    hourlyRate: 'Rs 20/hr',
    walkingTimeMin: 2,
    distanceKm: 0.6,
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
    hourlyRate: 'Rs 30/day (High Capacity Lot)',
    walkingTimeMin: 7,
    distanceKm: 1.1,
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
    sensorType: 'Kerb Magnetometer Sensor Array',
    sensorStatus: 'Active (12 bike slots available)',
    trafficLevel: 'SMOOTH',
    trafficDelayMin: 1,
  },
];

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
  },
];

const INITIAL_ADVISORIES = [
  {
    title: 'Beach Promenade Evening Vehicle Curfew',
    description: 'Goubert Avenue is pedestrian-only between 17:00 and 06:00. Park at Old Port Lot or Saint Gilles Free Bay.',
    severity: 'HIGH',
    activeTime: 'Daily 17:00 - 06:00',
    affectedRoads: 'Goubert Avenue, Promenade Rock Beach',
  },
  {
    title: 'Mission Street Alternate Kerb Parking Rule',
    description: 'Even days West Kerb, Odd days East Kerb. Active crane tow-away on prohibited kerb.',
    severity: 'MEDIUM',
    activeTime: 'Active 24/7',
    affectedRoads: 'Mission Street (Bussy St to Rangapillai St)',
  },
  {
    title: 'Emergency Medical Corridor Clearance',
    description: 'Priority ambulance path to IGMCRI Hospital. Zero curb obstruction tolerated.',
    severity: 'EMERGENCY',
    activeTime: 'Immediate & Continuous',
    affectedRoads: 'Vazhudavur Road, Gorimedu Junction',
  },
];

async function seed() {
  console.log('Seeding rows into Appwrite collections...');

  // 1. Seed Parking Zones
  for (const zone of REAL_PUDUCHERRY_ZONES) {
    try {
      await databases.createDocument(DB_ID, 'parking_zones', zone.zoneId, zone);
      console.log('✔ Seeded parking zone:', zone.name);
    } catch (e) {
      if (e.code === 409) {
        console.log('ℹ Zone already exists:', zone.name);
      } else {
        console.log('Zone seed note:', e.message);
      }
    }
  }

  // 2. Seed Users
  for (const user of INITIAL_USERS) {
    try {
      await databases.createDocument(DB_ID, 'users', user.userId, user);
      console.log('✔ Seeded user:', user.name);
    } catch (e) {
      if (e.code === 409) {
        console.log('ℹ User already exists:', user.name);
      } else {
        console.log('User seed note:', e.message);
      }
    }
  }

  // 3. Seed Advisories
  for (const adv of INITIAL_ADVISORIES) {
    try {
      await databases.createDocument(DB_ID, 'traffic_advisories', ID.unique(), adv);
      console.log('✔ Seeded advisory:', adv.title);
    } catch (e) {
      console.log('Advisory seed note:', e.message);
    }
  }

  console.log('Seeding complete!');
}

seed();
