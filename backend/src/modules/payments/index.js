const routes = require('./payments.routes');
const controller = require('./payments.controller');
const service = require('./payments.service');
const repository = require('./payments.repository');
const validation = require('./payments.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
