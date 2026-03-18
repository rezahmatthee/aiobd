# AIOBD System Architecture

## Overview

AIOBD is a modular, extensible universal automotive diagnostic platform built with a layered architecture that supports multiple OBD2 protocols, standard and proprietary PID definitions, and advanced diagnostic capabilities.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/TS)                      │
│  Dashboard │ DiagnosticsView │ RealtimeMonitor │ Protocol UI │
├─────────────────────────────────────────────────────────────┤
│                   REST API + WebSocket                        │
│           Express.js with Socket.IO                           │
├─────────────────────────────────────────────────────────────┤
│                    Services Layer                             │
│   DiagnosticService │ VehicleService │ AdapterService        │
├─────────────────────────────────────────────────────────────┤
│                    Protocol Layer                             │
│  SAE J1850 PWM/VPW │ ISO 9141-2 │ ISO 14230 │ ISO 15765/27145│
├─────────────────────────────────────────────────────────────┤
│                  Hardware Abstraction                         │
│              ELM327 Adapter │ Base Adapter                   │
├─────────────────────────────────────────────────────────────┤
│                   PID Management                              │
│   Standard │ Advanced │ Manufacturer-Specific                │
└─────────────────────────────────────────────────────────────┘
```

## Module Descriptions

### Core (`backend/src/core/`)
The protocol abstraction layer providing:
- **BaseProtocol** - Abstract class for all OBD2 protocol implementations
- **Protocol implementations** - 6 concrete protocol classes
- **Hardware adapters** - ELM327 and extensible adapter interface

### PID Management (`backend/src/pids/`)
- **Standard PIDs** - SAE/ISO-defined parameters
- **Advanced PIDs** - Mode $06, $09, freeze frames
- **Manufacturer PIDs** - Ford, GM, Toyota, VW, BMW specific data

### Services (`backend/src/services/`)
- **DiagnosticService** - Session management, PID reading, DTC handling
- **VehicleService** - Vehicle CRUD operations
- **AdapterService** - Hardware adapter lifecycle

### API (`backend/src/routes/`, `backend/src/controllers/`)
RESTful API with JWT authentication for all diagnostic operations.

### Frontend (`frontend/src/`)
- **Zustand store** for global state management
- **Custom hooks** for protocol and diagnostic data
- **Reusable components** for protocol indicators, PID display, DTC codes
