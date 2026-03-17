# aiobd - OBD2 Diagnostic SaaS Platform

A comprehensive web-based OBD2 (On-Board Diagnostics) diagnostic platform that mimics professional devices like Autel. Connect vehicles via OBD2 adapters, read diagnostic codes, monitor real-time vehicle data, and analyze diagnostics.

## Features

### Core Functionality
- 🔗 **OBD2 Adapter Connection** - Support for ELM327 and compatible adapters
- 📊 **Real-time Vehicle Data** - Live streaming of engine parameters
- ⚠️ **Diagnostic Codes** - Read and clear DTC (Diagnostic Trouble Codes)
- 📈 **Analytics Dashboard** - Historical data analysis and reporting
- 🔐 **Multi-tenant SaaS** - User management and vehicle fleet support

### Frontend
- React.js responsive web dashboard
- Real-time WebSocket updates
- Interactive vehicle diagnostics interface
- Data visualization & analytics charts

### Backend
- Node.js/Express RESTful API
- MongoDB database for data persistence
- WebSocket support for real-time data
- OBD2 protocol handler
- JWT authentication

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Zustand, Socket.io-client, Chart.js |
| Backend | Node.js, Express, MongoDB, Socket.io |
| Protocols | OBD2, WebSocket, HTTP/REST |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```
aiobd/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── server.js
├── frontend/                # React application
│   ├── public/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   ├── store/          # Zustand store
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── styles/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- MongoDB 5.0+
- Docker & Docker Compose (optional)
- OBD2 adapter (ELM327 compatible)

### Quick Start

1. **Clone repository**
   ```bash
   git clone https://github.com/rezahmatthee/aiobd.git
   cd aiobd
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   npm start
   ```

4. **Using Docker**
   ```bash
   docker-compose up -d
   ```

## API Documentation

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Vehicles
- `GET /api/vehicles` - List user vehicles
- `POST /api/vehicles` - Add new vehicle
- `GET /api/vehicles/:id` - Get vehicle details
- `DELETE /api/vehicles/:id` - Remove vehicle

### Diagnostics
- `POST /api/diagnostics/connect` - Connect to vehicle via OBD2
- `GET /api/diagnostics/live/:vehicleId` - Stream real-time data
- `GET /api/diagnostics/codes/:vehicleId` - Read DTCs
- `POST /api/diagnostics/clear/:vehicleId` - Clear DTCs
- `GET /api/diagnostics/history/:vehicleId` - Historical data

### Analytics
- `GET /api/analytics/dashboard/:vehicleId` - Dashboard metrics
- `GET /api/analytics/trends/:vehicleId` - Data trends
- `GET /api/analytics/export/:vehicleId` - Export diagnostics report

## Database Schema

### Users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicles
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  vin: String,
  make: String,
  model: String,
  year: Number,
  licensePlate: String,
  addedAt: Date
}
```

### Diagnostics
```javascript
{
  _id: ObjectId,
  vehicleId: ObjectId (ref: Vehicle),
  timestamp: Date,
  engine: {
    rpm: Number,
    load: Number,
    temperature: Number,
    speed: Number
  },
  fuelSystem: {
    pressure: Number,
    consumptionRate: Number
  },
  emissionSystem: {
    o2Levels: Number,
    catalyticConverter: String
  }
}
```

## Configuration

Create `.env` files in both backend and frontend directories:

### Backend .env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aiobd
JWT_SECRET=your_jwt_secret_key
OBD_ADAPTER_PORT=/dev/ttyUSB0
NODE_ENV=development
```

### Frontend .env
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WEBSOCKET_URL=ws://localhost:5000
```

## OBD2 Protocol Support

Supported parameters:
- Engine RPM
- Engine Load
- Engine Temperature
- Vehicle Speed
- Fuel Pressure
- O2 Sensor Data
- Diagnostic Trouble Codes (DTCs)
- Freeze Frame Data

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
- GitHub Issues: [Create an issue](https://github.com/rezahmatthee/aiobd/issues)
- Email: contact@aiobd.co

## Roadmap

- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced diagnostics AI
- [ ] Fleet management features
- [ ] Integration with third-party services
- [ ] Cloud-based storage

---

**aiobd** - Professional OBD2 Diagnostics for Everyone