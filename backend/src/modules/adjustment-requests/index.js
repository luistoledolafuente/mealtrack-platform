const routes = require('./adjustment-requests.routes');
const controller = require('./adjustment-requests.controller');
const service = require('./adjustment-requests.service');
const repository = require('./adjustment-requests.repository');
const validation = require('./adjustment-requests.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
