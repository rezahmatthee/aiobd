# Advanced Extensions Guide

This guide explains how to extend the Phase 2 advanced diagnostic features.

## Adding Custom Monitor Types (Mode $06)

### 1. Add to MonitorType Enum
In `backend/src/pids/advanced/mode_06.ts`:

```typescript
export enum MonitorType {
  // ... existing types
  MY_CUSTOM_MONITOR = 'MY_CUSTOM_MONITOR',
}
```

### 2. Update Test ID Mapping
```typescript
function getMonitorTypeForTestId(testId: number): MonitorType {
  // ... existing mappings
  if (testId >= 0x20 && testId <= 0x2F) return MonitorType.MY_CUSTOM_MONITOR;
  return MonitorType.COMPREHENSIVE;
}
```

### 3. Add to Monitor Test ID Descriptions
```typescript
export const MONITOR_TEST_IDS: Record<number, string> = {
  // ... existing entries
  0x20: 'Custom Monitor - My Test Description',
};
```

---

## Extending Vehicle Info Codes (Mode $09)

### 1. Add to VehicleInfoType Enum
In `backend/src/pids/advanced/mode_09.ts`:

```typescript
export enum VehicleInfoType {
  // ... existing types
  MY_CUSTOM_INFO = 0x0B,
}
```

### 2. Add Parser Function
```typescript
export function parseMyCustomInfo(bytes: number[]): string {
  // Custom parsing logic
  return bytes.slice(1).map(b => String.fromCharCode(b)).join('');
}
```

### 3. Register in assembleVehicleInfo
```typescript
export function assembleVehicleInfo(responses: Map<number, number[]>): VehicleInfo {
  // ...
  case VehicleInfoType.MY_CUSTOM_INFO:
    info.myCustomField = parseMyCustomInfo(bytes);
    break;
}
```

---

## Building Custom Freeze Frame Handlers

### 1. Add PID to FREEZE_FRAME_PIDS
In `backend/src/pids/advanced/freeze_frames.ts`:

```typescript
export const FREEZE_FRAME_PIDS = {
  // ... existing PIDs
  0x5C: {
    name: 'Oil Temperature',
    unit: '°C',
    formula: (bytes: number[]) => bytes[0] - 40,
  },
};
```

### 2. Handle Variable-Length PIDs
```typescript
function getPIDDataLength(pid: number): number {
  // ... existing rules
  if (pid === 0x5C) return 1; // Oil temp is 1 byte
  return 1;
}
```

---

## Adding Manufacturer-Specific Extensions

Phase 3 will add OEM-specific PID packs. To prepare:

1. Create a new file in `backend/src/pids/manufacturer/your_brand.ts`
2. Export a PID registry extending the base FREEZE_FRAME_PIDS
3. Register with the advanced diagnostic service

```typescript
// backend/src/pids/manufacturer/your_brand.ts
export const YOUR_BRAND_PIDS = {
  0x2000: { name: 'Proprietary Sensor', unit: 'raw', formula: (b: number[]) => b[0] },
};
```
