const routes = require('./dashboards.routes');
const controller = require('./dashboards.controller');
const service = require('./dashboards.service');
const repository = require('./dashboards.repository');
const validation = require('./dashboards.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
