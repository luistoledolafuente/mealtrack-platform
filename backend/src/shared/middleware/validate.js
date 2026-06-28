const ApiError = require('../errors/ApiError');

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));

      const validationError = new ApiError('Error de validación', 422, 'VALIDATION_ERROR');
      validationError.details = details;
      return next(validationError);
    }

    req.body = value;
    next();
  };
}

module.exports = validate;
