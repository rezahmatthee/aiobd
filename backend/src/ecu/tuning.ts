import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';

/** A single tuning map (2D or 3D lookup table) */
export interface TuningMap {
  id: string;
  name: string;
  type: 'fuel' | 'ignition' | 'boost' | 'afr' | 'vtec';
  xAxis: number[];
  yAxis: number[];
  data: number[][];
  unit: string;
}

/** Change record for version history */
export interface TuneHistory {
  version: number;
  timestamp: Date;
  changes: string[];
  author: string;
}

/** Complete tune file */
export interface TuneFile {
  id: string;
  version: number;
  vehicleId: string;
  createdAt: Date;
  modifiedAt: Date;
  maps: TuningMap[];
  checksum: number;
  history: TuneHistory[];
}

/** Result of map validation */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** In-memory tune store (sessionId → TuneFile) */
const activeTunes = new Map<string, TuneFile>();

export class TuningEngine {
  async loadTuneFile(filePath: string): Promise<TuneFile> {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as TuneFile;
    // Hydrate dates
    parsed.createdAt = new Date(parsed.createdAt);
    parsed.modifiedAt = new Date(parsed.modifiedAt);
    parsed.history = parsed.history.map((h) => ({ ...h, timestamp: new Date(h.timestamp) }));
    activeTunes.set(parsed.id, parsed);
    return parsed;
  }

  async saveTuneFile(tune: TuneFile, filePath: string): Promise<void> {
    const updated = this.recalculateChecksum(tune);
    updated.modifiedAt = new Date();
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    activeTunes.set(updated.id, updated);
  }

  async editMap(
    tuneId: string,
    mapType: string,
    x: number,
    y: number,
    value: number,
  ): Promise<void> {
    const tune = activeTunes.get(tuneId);
    if (!tune) throw new Error(`Tune ${tuneId} not loaded`);

    const map = tune.maps.find((m) => m.type === mapType);
    if (!map) throw new Error(`Map type '${mapType}' not found in tune ${tuneId}`);

    const xi = map.xAxis.indexOf(x);
    const yi = map.yAxis.indexOf(y);
    if (xi === -1 || yi === -1) throw new Error(`Axis value not found: x=${x}, y=${y}`);

    const prevValue = map.data[yi][xi];
    map.data[yi][xi] = value;
    tune.modifiedAt = new Date();

    tune.history.push({
      version: tune.version,
      timestamp: new Date(),
      changes: [`${mapType}[${y},${x}]: ${prevValue} → ${value}`],
      author: 'system',
    });
    tune.version += 1;
    this.recalculateChecksum(tune);
  }

  validateMap(map: TuningMap): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (map.xAxis.length === 0) errors.push('xAxis is empty');
    if (map.yAxis.length === 0) errors.push('yAxis is empty');

    for (let row = 0; row < map.data.length; row++) {
      if (map.data[row].length !== map.xAxis.length) {
        errors.push(`Row ${row} length (${map.data[row].length}) != xAxis length (${map.xAxis.length})`);
      }
    }
    if (map.data.length !== map.yAxis.length) {
      errors.push(`Data rows (${map.data.length}) != yAxis length (${map.yAxis.length})`);
    }

    // Type-specific range warnings
    if (map.type === 'ignition') {
      for (let r = 0; r < map.data.length; r++) {
        for (let c = 0; c < (map.data[r]?.length ?? 0); c++) {
          const v = map.data[r][c];
          if (v !== undefined && (v < -15 || v > 60)) {
            warnings.push(`Ignition timing ${v}° at [${r},${c}] outside safe range (-15 to 60°)`);
          }
        }
      }
    }
    if (map.type === 'afr') {
      for (let r = 0; r < map.data.length; r++) {
        for (let c = 0; c < (map.data[r]?.length ?? 0); c++) {
          const v = map.data[r][c];
          if (v !== undefined && (v < 10 || v > 20)) {
            warnings.push(`AFR ${v} at [${r},${c}] outside typical range (10–20)`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  recalculateChecksum(tune: TuneFile): TuneFile {
    let sum = 0;
    for (const map of tune.maps) {
      for (const row of map.data) {
        for (const v of row) {
          sum = (sum + Math.round(v * 1000)) & 0xFFFFFFFF;
        }
      }
    }
    tune.checksum = sum;
    return tune;
  }

  async rollbackToFactory(vehicleId: string): Promise<TuneFile> {
    // Build a default factory tune with identity maps
    const factory: TuneFile = {
      id: this.randomId(),
      version: 1,
      vehicleId,
      createdAt: new Date(),
      modifiedAt: new Date(),
      checksum: 0,
      history: [{
        version: 1,
        timestamp: new Date(),
        changes: ['Restored factory defaults'],
        author: 'system',
      }],
      maps: [
        this.buildDefaultMap('fuel'),
        this.buildDefaultMap('ignition'),
        this.buildDefaultMap('boost'),
        this.buildDefaultMap('afr'),
      ],
    };
    this.recalculateChecksum(factory);
    activeTunes.set(factory.id, factory);
    return factory;
  }

  async applyRealTimeAdjustment(param: string, value: number): Promise<void> {
    // Simulate real-time ECU parameter write
    await new Promise((r) => setTimeout(r, 5));
    void param;
    void value;
  }

  private buildDefaultMap(type: TuningMap['type']): TuningMap {
    const xAxis = [500, 1000, 2000, 3000, 4000, 5000, 6000, 7000];
    const yAxis = [0, 25, 50, 75, 100];

    const defaults: Record<TuningMap['type'], number> = {
      fuel: 14.7,
      ignition: 10,
      boost: 0,
      afr: 14.7,
      vtec: 5800,
    };

    const fillVal = defaults[type];
    const data = yAxis.map(() => xAxis.map(() => fillVal));

    return {
      id: this.randomId(),
      name: `Default ${type.charAt(0).toUpperCase() + type.slice(1)} Map`,
      type,
      xAxis,
      yAxis,
      data,
      unit: type === 'ignition' ? '°BTDC' : type === 'boost' ? 'kPa' : type === 'afr' || type === 'fuel' ? ':1' : 'RPM',
    };
  }

  private randomId(): string {
    return randomBytes(8).toString('hex');
  }
}
