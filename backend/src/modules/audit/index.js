const routes = require('./audit.routes');
const controller = require('./audit.controller');
const service = require('./audit.service');
const repository = require('./audit.repository');
const validation = require('./audit.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
