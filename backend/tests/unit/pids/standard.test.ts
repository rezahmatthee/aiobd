import { ENGINE_PIDS } from '../../../src/pids/standard/engine';
import { FUEL_PIDS } from '../../../src/pids/standard/fuel';
import { EMISSION_PIDS } from '../../../src/pids/standard/emissions';
import { findPID, ALL_STANDARD_PIDS } from '../../../src/pids/standard';

describe('Standard PID definitions', () => {
  describe('Engine PIDs', () => {
    it('should have RPM PID with correct formula', () => {
      const rpmPid = ENGINE_PIDS.find((p) => p.name === 'ENGINE_RPM');
      expect(rpmPid).toBeDefined();
      expect(rpmPid!.formula([0x1A, 0xF8])).toBeCloseTo(1726, 0);
    });

    it('should calculate coolant temp correctly', () => {
      const tempPid = ENGINE_PIDS.find((p) => p.name === 'ENGINE_COOLANT_TEMP');
      expect(tempPid).toBeDefined();
      expect(tempPid!.formula([0x50])).toBe(40);
    });

    it('should calculate vehicle speed correctly', () => {
      const speedPid = ENGINE_PIDS.find((p) => p.name === 'VEHICLE_SPEED');
      expect(speedPid).toBeDefined();
      expect(speedPid!.formula([0x64])).toBe(100);
    });

    it('should calculate engine load correctly', () => {
      const loadPid = ENGINE_PIDS.find((p) => p.name === 'CALC_ENGINE_LOAD');
      expect(loadPid).toBeDefined();
      const value = loadPid!.formula([0x80]);
      expect(value).toBeCloseTo(50.2, 0);
    });
  });

  describe('Fuel PIDs', () => {
    it('should have fuel pressure PID', () => {
      const fp = FUEL_PIDS.find((p) => p.name === 'FUEL_PRESSURE');
      expect(fp).toBeDefined();
      expect(fp!.formula([0x28])).toBe(120);
    });

    it('should calculate fuel tank level', () => {
      const ftl = FUEL_PIDS.find((p) => p.name === 'FUEL_TANK_LEVEL');
      expect(ftl).toBeDefined();
      const value = ftl!.formula([0x80]);
      expect(value).toBeCloseTo(50.2, 0);
    });
  });

  describe('Emission PIDs', () => {
    it('should have O2 sensor PIDs', () => {
      const o2 = EMISSION_PIDS.find((p) => p.name === 'O2_SENSOR_1_VOLTAGE');
      expect(o2).toBeDefined();
    });
  });

  describe('PID lookup', () => {
    it('should find PID by mode and id', () => {
      const pid = findPID(0x01, 0x0C);
      expect(pid).toBeDefined();
      expect(pid!.name).toBe('ENGINE_RPM');
    });

    it('should return undefined for unknown PID', () => {
      const pid = findPID(0x01, 0xFF);
      expect(pid).toBeUndefined();
    });

    it('should have all standard PIDs in combined array', () => {
      expect(ALL_STANDARD_PIDS.length).toBeGreaterThan(0);
    });
  });
});
