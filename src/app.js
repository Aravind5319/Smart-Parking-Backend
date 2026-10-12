const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const parkingRoutes = require('./routes/parkingRoutes');
const userRoutes = require('./routes/userRoutes');
const violationRoutes = require('./routes/violationRoutes');
const advisoryRoutes = require('./routes/advisoryRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const { DATABASE_ID, PROJECT_ID } = require('./config/appwrite');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Puducherry Smart Parking & Enforcement Backend',
    department: 'Puducherry Traffic Police (ParkPuduvai)',
    version: '1.0.0',
    appwrite: {
      projectId: PROJECT_ID,
      databaseId: DATABASE_ID,
      status: 'CONFIGURED',
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/parking', parkingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/advisories', advisoryRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/camera', cameraRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ParkPuduvai Smart Parking API is active.',
    endpoints: {
      health: '/api/health',
      parkingZones: '/api/parking/zones',
      nearestParking: '/api/parking/nearest?lat=11.9338&lng=79.8310&vehicleType=CAR',
      users: '/api/users',
      violations: '/api/violations',
      advisories: '/api/advisories',
      sessions: '/api/sessions',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.url} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
