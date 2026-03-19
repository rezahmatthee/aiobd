'use strict';

const Joi = require('joi');
const securityConfig = require('../config/security');

const { minLength, maxLength, strengthRegex } = securityConfig.password;

// ── Reusable field validators ──────────────────────────────────────────────

const emailSchema = Joi.string().email({ tlds: { allow: false } }).max(254).lowercase().trim();
const passwordSchema = Joi.string()
  .min(minLength)
  .max(maxLength)
  .pattern(strengthRegex)
  .messages({
    'string.pattern.base':
      'Password must be at least 12 characters and contain uppercase, lowercase, digit, and special character',
    'string.min': `Password must be at least ${minLength} characters`,
    'string.max': `Password must not exceed ${maxLength} characters`,
  });

// ── Request schemas ────────────────────────────────────────────────────────

const schemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    email: emailSchema.required(),
    password: passwordSchema.required(),
  }),

  login: Joi.object({
    email: emailSchema.required(),
    password: Joi.string().max(maxLength).required(),
    totpToken: Joi.string().length(6).pattern(/^\d+$/).optional(),
  }),

  refreshToken: Joi.object({
    // randomToken(64) generates 64 bytes = 128 hex characters
    refreshToken: Joi.string().hex().length(128).required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().max(maxLength).required(),
    newPassword: passwordSchema.required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().trim().min(2).max(120),
    phone: Joi.string().pattern(/^\+?[\d\s\-()]{7,20}$/).optional().allow(''),
  }).min(1),

  addVehicle: Joi.object({
    vin: Joi.string().alphanum().length(17).uppercase().required(),
    make: Joi.string().trim().min(1).max(80).required(),
    model: Joi.string().trim().min(1).max(80).required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    licensePlate: Joi.string().trim().min(1).max(20).optional().allow(''),
  }),
};

/**
 * Middleware factory: validates `req.body` against a named Joi schema.
 * Returns 400 with structured validation errors on failure.
 */
function validate(schemaName) {
  const schema = schemas[schemaName];
  if (!schema) throw new Error(`Unknown validation schema: ${schemaName}`);

  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }

    req.body = value; // replace with sanitised / converted value
    next();
  };
}

module.exports = { validate, schemas };
