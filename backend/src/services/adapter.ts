import { ConnectionState } from '../types';

export interface AdapterInfo {
  id: string;
  name: string;
  type: 'ELM327' | 'J2534' | 'STN' | 'OBDLINK';
  port: string;
  connected: boolean;
  firmwareVersion?: string;
  protocol?: string;
}

export interface AdapterStatus {
  id: string;
  state: ConnectionState;
  lastSeen: Date;
  signalStrength?: number;
  voltage?: number;
  error?: string;
}

export interface ConnectOptions {
  port?: string;
  baudRate?: number;
  timeout?: number;
}

export interface ConnectionResult {
  success: boolean;
  adapterId: string;
  error?: string;
}

const adapters = new Map<string, AdapterInfo>();
const adapterStatus = new Map<string, AdapterStatus>();

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export class AdapterService {
  async connectAdapter(options: ConnectOptions = {}): Promise<ConnectionResult> {
    const id = makeId();
    const adapter: AdapterInfo = {
      id,
      name: 'ELM327 v2.2',
      type: 'ELM327',
      port: options.port ?? 'auto',
      connected: true,
      firmwareVersion: '2.2',
      protocol: 'AUTO',
    };

    // Simulate connection attempt
    await new Promise((r) => setTimeout(r, 100));

    adapters.set(id, adapter);
    adapterStatus.set(id, {
      id,
      state: ConnectionState.CONNECTED,
      lastSeen: new Date(),
      signalStrength: 90,
      voltage: 12.4,
    });

    return { success: true, adapterId: id };
  }

  async disconnectAdapter(adapterId: string): Promise<void> {
    const adapter = adapters.get(adapterId);
    if (!adapter) throw new Error(`Adapter ${adapterId} not found`);

    await new Promise((r) => setTimeout(r, 20));
    adapter.connected = false;
    const status = adapterStatus.get(adapterId);
    if (status) {
      status.state = ConnectionState.DISCONNECTED;
      status.lastSeen = new Date();
    }
    adapters.delete(adapterId);
  }

  async getAdapterStatus(adapterId: string): Promise<AdapterStatus> {
    const status = adapterStatus.get(adapterId);
    if (!status) throw new Error(`Adapter ${adapterId} not found`);
    // Refresh last-seen
    status.lastSeen = new Date();
    return status;
  }

  async listAdapters(): Promise<AdapterInfo[]> {
    return Array.from(adapters.values());
  }

  async testConnection(adapterId: string): Promise<boolean> {
    const adapter = adapters.get(adapterId);
    if (!adapter || !adapter.connected) return false;
    await new Promise((r) => setTimeout(r, 30));
    return true;
  }

  async detectAdapters(): Promise<AdapterInfo[]> {
    // Simulate detecting available adapters on common ports
    const detected: AdapterInfo[] = [
      {
        id: makeId(),
        name: 'ELM327 USB',
        type: 'ELM327',
        port: '/dev/ttyUSB0',
        connected: false,
        firmwareVersion: '1.5',
      },
      {
        id: makeId(),
        name: 'OBDLink MX+',
        type: 'OBDLINK',
        port: 'BT:00:1A:7D:DA:71:13',
        connected: false,
        firmwareVersion: '4.1.8',
      },
    ];
    return detected;
  }
}
