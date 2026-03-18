# Creating OEM Packs

OEM packs allow the community to contribute manufacturer-specific PID definitions for vehicles not yet covered by AIOBD.

## Structure

An OEM pack is a TypeScript file that exports an array of `PIDDefinition` objects:

```typescript
import { PIDDefinition } from '../../types/pid';

export const MY_BRAND_PIDS: PIDDefinition[] = [
  {
    mode: 0x22,         // UDS ReadDataByIdentifier
    pid: 0xXXXX,        // 2-byte identifier
    name: 'BRAND_PID_NAME',
    description: 'Human-readable description',
    minValue: 0,
    maxValue: 100,
    unit: '%',
    bytes: 2,
    formula: (bytes) => ((bytes[0] * 256) + bytes[1]) / 100,
  },
];
```

## Adding a New OEM Pack

1. Create a new file: `backend/src/pids/manufacturer/<brand>.ts`
2. Export your PID array
3. Register it in `backend/src/pids/manufacturer/index.ts`
4. Add tests in `backend/tests/unit/pids/`
5. Document in `docs/PIDS.md`
6. Submit a pull request

## PID Formula Guide

Common formula patterns:

| Type | Formula | Example |
|------|---------|---------|
| 1-byte percentage | `bytes[0] / 255 * 100` | Throttle position |
| 2-byte RPM | `(bytes[0] * 256 + bytes[1]) / 4` | Engine RPM |
| Temperature | `bytes[0] - 40` | Coolant temp |
| Voltage | `(bytes[0] * 256 + bytes[1]) / 1000` | Battery voltage |
| Pressure (kPa) | `bytes[0] * 3` | Fuel pressure |

## Validation Requirements

- Formula must handle edge cases (empty arrays, zeroes)
- Min/max values must be realistic
- Units must use standard abbreviations
- Name must be UPPER_SNAKE_CASE with brand prefix

## Community Registry

Submitted OEM packs go through:
1. **Review** - Technical accuracy check
2. **Testing** - Validation against real vehicle data
3. **Merge** - Added to official distribution
4. **Registry** - Listed in community marketplace (Phase 6)
