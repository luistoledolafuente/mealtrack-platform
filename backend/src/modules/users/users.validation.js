const Joi = require('joi');

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  phone: Joi.string().max(20),
});

module.exports = { updateProfileSchema };
