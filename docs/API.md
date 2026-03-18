# AIOBD API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

#### POST /auth/login
Login with credentials.

**Body:**
```json
{ "email": "user@example.com", "password": "securepassword" }
```

### Vehicles (Protected)

#### GET /vehicles
Get all vehicles for the authenticated user.

#### POST /vehicles
Add a new vehicle.

**Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "vin": "JT2BF22K3W0108950"
}
```

#### GET /vehicles/:id
Get a specific vehicle.

#### DELETE /vehicles/:id
Remove a vehicle.

### Diagnostics (Protected)

#### POST /diagnostics/connect
Connect to a vehicle via OBD2 adapter.

**Body:**
```json
{
  "vehicleId": "vehicle_id",
  "port": "/dev/ttyUSB0",
  "protocol": "ISO_15765"
}
```

**Response:**
```json
{ "sessionId": "session_...", "protocol": "ISO_15765" }
```

#### GET /diagnostics/live/:vehicleId
Read live PID data.

**Query params:** `sessionId`, `mode` (hex), `pid` (hex)

#### GET /diagnostics/codes/:vehicleId
Read stored DTC codes.

**Query params:** `sessionId`

#### POST /diagnostics/clear/:vehicleId
Clear stored DTC codes.

### Health Check

#### GET /health
Returns API health status.

```json
{ "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```
