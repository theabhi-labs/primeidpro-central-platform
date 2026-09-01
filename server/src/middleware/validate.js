const Joi = require('joi');
const ApiResponse = require('../utils/apiResponse');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message.replace(/['"]/g, ''));
      return ApiResponse.error(res, 'Validation Error', 400, errorMessages);
    }
    req.body = value;
    next();
  };
};

module.exports = { validateBody, Joi };
