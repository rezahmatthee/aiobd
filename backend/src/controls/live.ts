import { EventEmitter } from 'events';

/** Result of a real-time parameter adjustment */
export interface AdjustResult {
  success: boolean;
  param: string;
  value: number;
  appliedAt: Date;
}

/** Result of a sensor feedback validation check */
export interface FeedbackResult {
  valid: boolean;
  sensors: Record<string, number>;
  faults: string[];
}

/** State for an active live-control session */
interface LiveControlState {
  sessionId: string;
  active: boolean;
  adjustmentCount: number;
  windowStart: number;
  lastAdjustment: Record<string, number>;
  faultCount: number;
}

const MAX_ADJUSTMENTS_PER_SECOND = 10;
const MAX_FAULTS_BEFORE_SHUTDOWN = 3;

const liveControlSessions = new Map<string, LiveControlState>();

export class LiveControlService extends EventEmitter {
  async startLiveControl(sessionId: string): Promise<void> {
    if (liveControlSessions.has(sessionId)) {
      throw new Error(`Live control already active for session ${sessionId}`);
    }
    liveControlSessions.set(sessionId, {
      sessionId,
      active: true,
      adjustmentCount: 0,
      windowStart: Date.now(),
      lastAdjustment: {},
      faultCount: 0,
    });
    this.emit('liveControlStarted', { sessionId });
  }

  async stopLiveControl(sessionId: string): Promise<void> {
    const state = liveControlSessions.get(sessionId);
    if (!state) return;
    state.active = false;
    liveControlSessions.delete(sessionId);
    this.emit('liveControlStopped', { sessionId });
  }

  async adjustParameter(
    sessionId: string,
    param: string,
    value: number,
  ): Promise<AdjustResult> {
    const state = this.requireActiveSession(sessionId);

    // Rate limiting: max 10 adjustments / second
    const now = Date.now();
    if (now - state.windowStart > 1000) {
      state.windowStart = now;
      state.adjustmentCount = 0;
    }
    state.adjustmentCount += 1;
    if (state.adjustmentCount > MAX_ADJUSTMENTS_PER_SECOND) {
      return {
        success: false,
        param,
        value,
        appliedAt: new Date(),
      };
    }

    // Hysteresis: skip if value unchanged
    if (state.lastAdjustment[param] === value) {
      return { success: true, param, value, appliedAt: new Date() };
    }

    state.lastAdjustment[param] = value;

    // Simulate applying the adjustment
    await new Promise((r) => setTimeout(r, 2));

    this.emit('parameterAdjusted', { sessionId, param, value });

    return { success: true, param, value, appliedAt: new Date() };
  }

  async validateSensorFeedback(sessionId: string): Promise<FeedbackResult> {
    const state = this.requireActiveSession(sessionId);

    // Simulate reading sensor values
    await new Promise((r) => setTimeout(r, 10));

    const sensors: Record<string, number> = {
      rpm: 800 + Math.random() * 200,
      coolantTemp: 85 + Math.random() * 10,
      throttlePosition: Math.random() * 5,
      mapPressure: 30 + Math.random() * 5,
      o2Voltage: 0.4 + Math.random() * 0.4,
    };

    const faults: string[] = [];

    if (sensors['rpm'] !== undefined && sensors['rpm'] > 900) faults.push('RPM above idle threshold');
    if (sensors['coolantTemp'] !== undefined && sensors['coolantTemp'] > 110) faults.push('Coolant temperature high');
    if (sensors['o2Voltage'] !== undefined && sensors['o2Voltage'] > 0.9) faults.push('O2 sensor voltage saturated');

    if (faults.length > 0) {
      state.faultCount += 1;
      if (state.faultCount >= MAX_FAULTS_BEFORE_SHUTDOWN) {
        await this.stopLiveControl(sessionId);
        this.emit('autoShutdown', { sessionId, reason: 'Repeated sensor faults' });
      }
    } else {
      state.faultCount = 0;
    }

    return { valid: faults.length === 0, sensors, faults };
  }

  private requireActiveSession(sessionId: string): LiveControlState {
    const state = liveControlSessions.get(sessionId);
    if (!state || !state.active) {
      throw new Error(`No active live-control session: ${sessionId}`);
    }
    return state;
  }
}
