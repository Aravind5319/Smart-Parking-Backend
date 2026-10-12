const { Client, Databases, Users, Storage } = require('node-appwrite');
require('dotenv').config();

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '6ac891a8002a7a9efbf8';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '6ac8ad70001ee5f1f58d';
const API_KEY = process.env.APPWRITE_API_KEY || '';

const client = new Client();
if (ENDPOINT && PROJECT_ID) {
  client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
  if (API_KEY) {
    client.setKey(API_KEY);
  }
}

const databases = new Databases(client);
const users = new Users(client);
const storage = new Storage(client);

const COLLECTIONS = {
  PARKING_ZONES: process.env.COLL_PARKING_ZONES || 'parking_zones',
  USERS: process.env.COLL_USERS || 'users',
  VIOLATIONS: process.env.COLL_VIOLATIONS || 'violation_reports',
  ADVISORIES: process.env.COLL_ADVISORIES || 'traffic_advisories',
  SESSIONS: process.env.COLL_SESSIONS || 'parking_sessions',
};

module.exports = {
  client,
  databases,
  users,
  storage,
  DATABASE_ID,
  COLLECTIONS,
  ENDPOINT,
  PROJECT_ID,
};
