import { VehicleInfo } from '../types';

export interface CreateVehicleInput {
  userId: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  transmission: string;
  notes?: string;
}

export interface UpdateVehicleInput {
  make?: string;
  model?: string;
  year?: number;
  engine?: string;
  transmission?: string;
  notes?: string;
}

export interface VehicleRecord extends VehicleInfo {
  id: string;
  userId: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListVehiclesOptions {
  page?: number;
  limit?: number;
  search?: string;
}

/** In-memory store (replaced by Mongoose in production) */
const vehicles = new Map<string, VehicleRecord>();

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export class VehicleService {
  async createVehicle(input: CreateVehicleInput): Promise<VehicleRecord> {
    const record: VehicleRecord = {
      id: makeId(),
      userId: input.userId,
      vin: input.vin,
      make: input.make,
      model: input.model,
      year: input.year,
      engine: input.engine,
      transmission: input.transmission,
      notes: input.notes,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vehicles.set(record.id, record);
    return record;
  }

  async getVehicle(id: string): Promise<VehicleRecord | null> {
    return vehicles.get(id) ?? null;
  }

  async updateVehicle(id: string, updates: UpdateVehicleInput): Promise<VehicleRecord | null> {
    const vehicle = vehicles.get(id);
    if (!vehicle) return null;
    Object.assign(vehicle, updates, { updatedAt: new Date() });
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const vehicle = vehicles.get(id);
    if (!vehicle) return false;
    vehicle.isActive = false;
    vehicle.updatedAt = new Date();
    return true;
  }

  async listVehicles(
    userId: string,
    options: ListVehiclesOptions = {},
  ): Promise<{ data: VehicleRecord[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    let all = Array.from(vehicles.values()).filter(
      (v) => v.userId === userId && v.isActive,
    );

    if (options.search) {
      const q = options.search.toLowerCase();
      all = all.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q),
      );
    }

    const total = all.length;
    const start = (page - 1) * limit;
    return { data: all.slice(start, start + limit), total };
  }

  async searchVehicles(
    query: string,
    options: ListVehiclesOptions = {},
  ): Promise<{ data: VehicleRecord[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    const q = query.toLowerCase();
    const all = Array.from(vehicles.values()).filter(
      (v) =>
        v.isActive &&
        (v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q)),
    );
    const total = all.length;
    const start = (page - 1) * limit;
    return { data: all.slice(start, start + limit), total };
  }
}
