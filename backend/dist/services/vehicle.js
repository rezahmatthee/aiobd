"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleService = exports.VehicleService = void 0;
const vehicle_1 = require("../models/vehicle");
const logger_1 = require("../utils/logger");
class VehicleService {
    async createVehicle(userId, data) {
        const vehicle = new vehicle_1.Vehicle({ ...data, userId });
        await vehicle.save();
        logger_1.logger.info(`Created vehicle ${vehicle._id} for user ${userId}`);
        return vehicle;
    }
    async getVehiclesByUser(userId) {
        return vehicle_1.Vehicle.find({ userId }).sort({ createdAt: -1 });
    }
    async getVehicleById(vehicleId, userId) {
        return vehicle_1.Vehicle.findOne({ _id: vehicleId, userId });
    }
    async updateVehicle(vehicleId, userId, data) {
        return vehicle_1.Vehicle.findOneAndUpdate({ _id: vehicleId, userId }, data, { new: true });
    }
    async deleteVehicle(vehicleId, userId) {
        const result = await vehicle_1.Vehicle.deleteOne({ _id: vehicleId, userId });
        return result.deletedCount > 0;
    }
}
exports.VehicleService = VehicleService;
exports.vehicleService = new VehicleService();
//# sourceMappingURL=vehicle.js.map