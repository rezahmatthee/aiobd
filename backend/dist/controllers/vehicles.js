"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehicles = getVehicles;
exports.createVehicle = createVehicle;
exports.getVehicle = getVehicle;
exports.deleteVehicle = deleteVehicle;
const vehicle_1 = require("../services/vehicle");
const logger_1 = require("../utils/logger");
async function getVehicles(req, res) {
    try {
        const vehicles = await vehicle_1.vehicleService.getVehiclesByUser(req.userId);
        res.json({ vehicles });
    }
    catch (err) {
        logger_1.logger.error('Get vehicles error', err);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
}
async function createVehicle(req, res) {
    try {
        const vehicle = await vehicle_1.vehicleService.createVehicle(req.userId, req.body);
        res.status(201).json({ vehicle });
    }
    catch (err) {
        logger_1.logger.error('Create vehicle error', err);
        res.status(500).json({ error: 'Failed to create vehicle' });
    }
}
async function getVehicle(req, res) {
    try {
        const vehicle = await vehicle_1.vehicleService.getVehicleById(req.params.id, req.userId);
        if (!vehicle) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        res.json({ vehicle });
    }
    catch (err) {
        logger_1.logger.error('Get vehicle error', err);
        res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
}
async function deleteVehicle(req, res) {
    try {
        const deleted = await vehicle_1.vehicleService.deleteVehicle(req.params.id, req.userId);
        if (!deleted) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        res.json({ message: 'Vehicle deleted' });
    }
    catch (err) {
        logger_1.logger.error('Delete vehicle error', err);
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
}
//# sourceMappingURL=vehicles.js.map