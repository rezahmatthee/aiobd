# PID Reference Guide

## OBD2 Modes

| Mode | Description |
|------|-------------|
| 01 | Show current data |
| 02 | Show freeze frame data |
| 03 | Show stored DTCs |
| 04 | Clear DTCs |
| 05 | O2 sensor monitoring (non-CAN) |
| 06 | On-demand diagnostics |
| 07 | Show pending DTCs |
| 08 | Control operations |
| 09 | Vehicle information |
| 0A | Permanent DTCs |

## Standard PIDs (Mode 01)

### Engine
| PID | Name | Formula | Unit |
|-----|------|---------|------|
| 0x04 | Engine Load | A/255 × 100 | % |
| 0x05 | Coolant Temp | A - 40 | °C |
| 0x0C | Engine RPM | (256A + B) / 4 | RPM |
| 0x0D | Vehicle Speed | A | km/h |
| 0x0E | Timing Advance | A/2 - 64 | ° BTDC |
| 0x0F | Intake Air Temp | A - 40 | °C |
| 0x10 | MAF Flow Rate | (256A + B) / 100 | g/s |
| 0x11 | Throttle Position | A/255 × 100 | % |
| 0x5C | Oil Temperature | A - 40 | °C |

### Fuel
| PID | Name | Formula | Unit |
|-----|------|---------|------|
| 0x06 | Short Term Fuel Trim B1 | A/1.28 - 100 | % |
| 0x07 | Long Term Fuel Trim B1 | A/1.28 - 100 | % |
| 0x0A | Fuel Pressure | A × 3 | kPa |
| 0x2F | Fuel Tank Level | A/255 × 100 | % |
| 0x5E | Fuel Rate | (256A + B) × 0.05 | L/h |

## Advanced PIDs

### Mode 06 - On-Demand Diagnostics
Test results for emissions-related components. Results include test value, min value, max value, and pass/fail status.

### Mode 09 - Vehicle Information
| InfoType | Name | Description |
|---------|------|-------------|
| 0x02 | VIN | 17-character Vehicle Identification Number |
| 0x04 | Calibration ID | ECU calibration identifier |
| 0x06 | CVN | Calibration Verification Number |
| 0x0A | ECU Name | ECU name in ASCII |

## Manufacturer-Specific PIDs (Mode 22)

These use the UDS ReadDataByIdentifier service (0x22) with 2-byte identifiers.

### Ford
- Boost Pressure (0x1002)
- Injector Duty Cycle (0x10A3)
- Transmission Temperature (0x1234)

### GM
- Desired Idle Speed (0x0100)
- Battery Voltage (0x0110)
- Fuel Trim Learn (0x1000)

### Toyota
- Injector Correction (0x0110)
- Hybrid Battery Temperature (0x0111)
- State of Charge (0x0200)

### VW/Audi
- Boost Pressure (0x2000)
- Lambda Value (0x2001)

### BMW
- VANOS Intake (0x4510)
- VANOS Exhaust (0x4511)
- Valvetronic Lift (0x4600)
