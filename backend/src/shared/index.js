const ApiError = require('./errors/ApiError');
const errorHandler = require('./middleware/errorHandler');
const { auth } = require('./middleware/auth');
const tenantContext = require('./middleware/tenantContext');
const validate = require('./middleware/validate');
const { sendSuccess, sendCreated } = require('./utils/response');
const logger = require('./logger/logger');

module.exports = {
  ApiError,
  errorHandler,
  auth,
  tenantContext,
  validate,
  sendSuccess,
  sendCreated,
  logger,
};
