/** Available actuator control types */
export enum ControlType {
  FUEL_PUMP = 'FUEL_PUMP',
  IGNITION_TIMING = 'IGNITION_TIMING',
  VVT = 'VVT',
  EGR_VALVE = 'EGR_VALVE',
  IDLE_SPEED = 'IDLE_SPEED',
  EMISSIONS = 'EMISSIONS',
}

/** Result of an actuator control command */
export interface ControlResult {
  success: boolean;
  type: ControlType;
  value: number | boolean;
  timestamp: Date;
  error?: string;
}

/** Current actuator status */
export interface ActuatorStatus {
  type: ControlType;
  currentValue: number | boolean;
  isActive: boolean;
  lastUpdated: Date;
}

/** In-memory actuator state */
const actuatorState = new Map<string, ActuatorStatus>();

function stateKey(sessionId: string, type: ControlType): string {
  return `${sessionId}:${type}`;
}

function updateState(
  sessionId: string,
  type: ControlType,
  value: number | boolean,
  isActive: boolean,
): void {
  actuatorState.set(stateKey(sessionId, type), {
    type,
    currentValue: value,
    isActive,
    lastUpdated: new Date(),
  });
}

function makeResult(
  type: ControlType,
  value: number | boolean,
  error?: string,
): ControlResult {
  return { success: error === undefined, type, value, timestamp: new Date(), error };
}

export class ActuatorControl {
  async setFuelPump(sessionId: string, enabled: boolean): Promise<ControlResult> {
    await this.simulateDelay();
    updateState(sessionId, ControlType.FUEL_PUMP, enabled, enabled);
    return makeResult(ControlType.FUEL_PUMP, enabled);
  }

  /**
   * Set ignition timing. Safe range: -10 to +20 degrees.
   */
  async setIgnitionTiming(sessionId: string, degrees: number): Promise<ControlResult> {
    if (degrees < -10 || degrees > 20) {
      return makeResult(
        ControlType.IGNITION_TIMING,
        degrees,
        `Timing ${degrees}° outside safe range (-10 to +20°)`,
      );
    }
    await this.simulateDelay();
    updateState(sessionId, ControlType.IGNITION_TIMING, degrees, true);
    return makeResult(ControlType.IGNITION_TIMING, degrees);
  }

  /**
   * Set VVT angle. Valid range: 0 to 50 degrees.
   */
  async setVVT(sessionId: string, angle: number): Promise<ControlResult> {
    if (angle < 0 || angle > 50) {
      return makeResult(ControlType.VVT, angle, `VVT angle ${angle}° outside range (0–50°)`);
    }
    await this.simulateDelay();
    updateState(sessionId, ControlType.VVT, angle, true);
    return makeResult(ControlType.VVT, angle);
  }

  /**
   * Set EGR valve position. Valid range: 0 to 100%.
   */
  async setEGRValve(sessionId: string, position: number): Promise<ControlResult> {
    if (position < 0 || position > 100) {
      return makeResult(ControlType.EGR_VALVE, position, `EGR position ${position}% outside range (0–100%)`);
    }
    await this.simulateDelay();
    updateState(sessionId, ControlType.EGR_VALVE, position, true);
    return makeResult(ControlType.EGR_VALVE, position);
  }

  /**
   * Set idle speed. Valid range: 600 to 1200 RPM.
   */
  async setIdleSpeed(sessionId: string, rpm: number): Promise<ControlResult> {
    if (rpm < 600 || rpm > 1200) {
      return makeResult(ControlType.IDLE_SPEED, rpm, `Idle RPM ${rpm} outside range (600–1200)`);
    }
    await this.simulateDelay();
    updateState(sessionId, ControlType.IDLE_SPEED, rpm, true);
    return makeResult(ControlType.IDLE_SPEED, rpm);
  }

  async setEmissionsControl(sessionId: string, enabled: boolean): Promise<ControlResult> {
    await this.simulateDelay();
    updateState(sessionId, ControlType.EMISSIONS, enabled, enabled);
    return makeResult(ControlType.EMISSIONS, enabled);
  }

  async getActuatorStatus(sessionId: string, type: ControlType): Promise<ActuatorStatus> {
    const key = stateKey(sessionId, type);
    return (
      actuatorState.get(key) ?? {
        type,
        currentValue: false,
        isActive: false,
        lastUpdated: new Date(),
      }
    );
  }

  private simulateDelay(): Promise<void> {
    return new Promise((r) => setTimeout(r, 5));
  }
}
