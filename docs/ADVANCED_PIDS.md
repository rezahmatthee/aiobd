# Advanced PID Documentation

This document covers the advanced OBD2 diagnostic modes implemented in Phase 2.

## Mode $06 — On-board Monitor Test Results

Mode $06 allows reading the results of on-board diagnostic monitor tests. Each test has a Test ID, Component ID, measured value, and min/max thresholds.

### Request Format
```
06 <TestID>
```
- `TestID = 0x00` requests all supported test IDs

### Response Format
```
46 <TestID> <ComponentID> <Value_Hi> <Value_Lo> <Min_Hi> <Min_Lo> <Max_Hi> <Max_Lo>
```

### Test IDs

| Test ID | Monitor Type | Description |
|---------|-------------|-------------|
| 0x01    | Oxygen Sensor | Rich-to-Lean Threshold Voltage |
| 0x02    | Oxygen Sensor | Lean-to-Rich Threshold Voltage |
| 0x03    | Oxygen Sensor | Low Sensor Voltage Threshold |
| 0x04    | Oxygen Sensor | High Sensor Voltage Threshold |
| 0x05    | Oxygen Sensor | Low Sensor Response Time Threshold |
| 0x06    | Oxygen Sensor | High Sensor Response Time Threshold |
| 0x0B    | Catalyst | Efficiency Below Threshold |
| 0x0C    | EGR | Pressure Sensor Low Flow |
| 0x0D    | EGR | Pressure Sensor High Flow |
| 0x0E    | EVAP | Purge Flow Low Threshold |
| 0x0F    | EVAP | Purge Flow High Threshold |

### Monitor Types

- `OXYGEN_SENSOR` — O2 sensor switching characteristics
- `FUEL_SYSTEM` — Fuel delivery system
- `EVAP_SYSTEM` — Evaporative emission control
- `EGR_SYSTEM` — Exhaust gas recirculation
- `CATALYST` — Catalytic converter efficiency
- `HEATED_CATALYST` — Heated catalyst monitoring
- `SECONDARY_AIR` — Secondary air injection
- `MISFIRE` — Engine misfire detection
- `COMPREHENSIVE` — Component monitoring

---

## Mode $09 — Vehicle Information

Mode $09 retrieves static vehicle identification data stored in the ECU.

### Request Format
```
09 <InfoType>
```

### Response Format
```
49 <InfoType> <MessageCount> <Data...>
```

### Info Types

| Info Type | Description | Format |
|-----------|-------------|--------|
| 0x01 | VIN Message Count | Number of messages |
| 0x02 | VIN | 17-char ASCII string |
| 0x03 | Calibration ID Message Count | Number of messages |
| 0x04 | Calibration ID | ASCII string |
| 0x05 | CVN Message Count | Number of messages |
| 0x06 | CVN | 4-byte hex value |
| 0x09 | ECU Name Message Count | Number of messages |
| 0x0A | ECU Name | ASCII string |

### VIN Format
The Vehicle Identification Number follows ISO 3779:
- Positions 1-3: World Manufacturer Identifier (WMI)
- Positions 4-8: Vehicle Descriptor Section (VDS)
- Positions 9-17: Vehicle Identifier Section (VIS)

---

## Freeze Frames

A freeze frame is a snapshot of sensor data captured at the moment a DTC (Diagnostic Trouble Code) is stored.

### Standard PIDs in Freeze Frames

| PID  | Name | Unit | Formula |
|------|------|------|---------|
| 0x04 | Engine Load | % | A×100/255 |
| 0x05 | Coolant Temperature | °C | A-40 |
| 0x0B | MAP | kPa | A |
| 0x0C | RPM | RPM | (A×256+B)/4 |
| 0x0D | Vehicle Speed | km/h | A |
| 0x0E | Timing Advance | ° | A/2-64 |
| 0x0F | Intake Air Temp | °C | A-40 |
| 0x10 | MAF | g/s | (A×256+B)/100 |
| 0x11 | Throttle Position | % | A×100/255 |

### Reading Freeze Frames
Mode $02 is used to read freeze frame data:
```
02 <PID> <FrameNumber>
```
- `FrameNumber` is typically `0x00`

---

## API Usage Examples

### Request Mode $06 Monitor Tests
```bash
POST /api/diagnostics/{vehicleId}/advanced/monitors
Content-Type: application/json

{ "testId": 0 }
```

### Get Mode $09 Vehicle Info
```bash
GET /api/diagnostics/{vehicleId}/advanced/info
```

### List Freeze Frames
```bash
GET /api/diagnostics/{vehicleId}/advanced/freeze-frames
```

### Get Specific Freeze Frame
```bash
GET /api/diagnostics/{vehicleId}/advanced/freeze-frames/{frameId}
```

### Clear Freeze Frame
```bash
DELETE /api/diagnostics/{vehicleId}/advanced/freeze-frames/{frameId}
```
