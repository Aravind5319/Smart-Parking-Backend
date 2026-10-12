# ParkPuduvai - Smart Parking & Enforcement REST API Backend
> **Official Civic Tech & Traffic Management Engine for Puducherry Traffic Police**

An intelligent Node.js & Express REST API powering the ParkPuduvai mobile application. Built with **Appwrite Cloud** database integration, real-time IoT sensor telemetry, Haversine GPS proximity routing, and citizen enforcement ticket tracking.

---

## Key Features

1. **Smart Parking Guidance & GPS Geolocation**:
   - `GET /api/parking/nearest`: Calculates nearest vacant parking bay using Haversine formula based on citizen GPS coordinates (`lat`, `lng`) and vehicle type (`CAR` vs `BIKE`).
   - `GET /api/parking/zones`: Filterable by category (`FREE_CIVIC` vs `GOVT_MUNICIPAL`) and search terms.
   - Real-time slot availability, walking time estimation, and tariffs.

2. **IoT Sensor & Barrier Gate Telemetry**:
   - `PUT /api/parking/zones/:id/occupancy`: Real-time webhook for ANPR cameras and magnetic loop sensors to update slot count.
   - `POST /api/parking/zones/:id/sensor-ping`: Automated heartbeat simulator for live demos.

3. **Citizen Profiles & Civic Karma Points**:
   - `POST /api/users`: Citizen vehicle registration (plate number, vehicle type, phone).
   - `GET /api/users/:id/karma`: Sentinel badges and karma point calculation.

4. **Traffic Violation Reporting & Enforcement (C.A.T.C.H.)**:
   - `POST /api/violations/report`: Citizen camera evidence upload with GPS coordinates, license plate, and violation classification.
   - `GET /api/violations`: Track complaints live from submission to review and e-challan issuance.
   - `PATCH /api/violations/:id/status`: Police dashboard action to issue challans or mark resolved.

5. **Live Traffic Bulletins & Corridor Advisories**:
   - `GET /api/advisories`: Real-time announcements (e.g. Goubert Avenue Beach Curfew, VVIP diversions, ambulance corridors).

6. **Parking Sessions (Check-In / Check-Out)**:
   - `POST /api/sessions/start`: Citizen check-in at a parking bay.
   - `POST /api/sessions/:id/end`: Automated checkout with duration calculation and municipal fee calculation.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=5000
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=6ac891a8002a7a9efbf8
APPWRITE_DATABASE_ID=6ac8ad70001ee5f1f58d
APPWRITE_API_KEY=your_appwrite_api_key_here
```

### 3. Run the Server
```bash
# Production mode
npm start

# Development mode (auto-reload)
npm run dev
```

Server will run at: `http://localhost:5000`

---

## REST API Reference

### Health Check
- `GET /api/health` -> System status and Appwrite database connection status.

### Parking Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/parking/nearest?lat=11.9338&lng=79.8310&vehicleType=CAR` | Nearest available bay with walking time |
| `GET` | `/api/parking/zones?vehicleType=CAR&category=FREE_CIVIC` | List parking bays with filters |
| `GET` | `/api/parking/zones/:id` | Single facility details |
| `POST` | `/api/parking/zones` | Add a new parking zone (Police Admin) |
| `PUT` | `/api/parking/zones/:id/occupancy` | Update occupied slots count |
| `POST` | `/api/parking/zones/:id/sensor-ping` | Trigger IoT heartbeat simulation |

### User Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/:id` | Get user details and vehicle registration |
| `POST` | `/api/users` | Register or update citizen user profile |
| `GET` | `/api/users/:id/karma` | Get civic karma score and sentinel privileges |

### Violation Enforcement Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/violations/report` | Submit citizen illegal parking evidence |
| `GET` | `/api/violations` | List all reported complaints |
| `PATCH` | `/api/violations/:id/status` | Update status (Police e-challan action) |

### Traffic Advisories Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/advisories` | List live traffic bulletins & road closures |
| `POST` | `/api/advisories` | Broadcast new bulletin (Police Dispatch) |

### Parking Sessions Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sessions/start` | Check-in vehicle at a bay |
| `POST` | `/api/sessions/:id/end` | Check-out vehicle and calculate fee |

---

## Appwrite Cloud Integration

The backend is pre-configured with Appwrite Cloud (`fra.cloud.appwrite.io`).

### Collections:
- **`parking_zones`**: GPS coordinates, total slots, occupied slots, sensor status, tariffs.
- **`users`**: Citizen details, vehicle numbers, karma scores.
- **`violation_reports`**: Photo evidence URIs, license plates, locations, e-challans.
- **`traffic_advisories`**: Live police alerts and affected corridors.
- **`parking_sessions`**: Check-in timestamps, check-out timestamps, amounts.

To provision or update collections in Appwrite, run:
```bash
npm run setup:db
```

---

## License
Government of Puducherry • Smart City Traffic Division • 2026
