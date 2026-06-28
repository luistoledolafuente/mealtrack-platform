const routes = require('./auth.routes');
const controller = require('./auth.controller');
const service = require('./auth.service');
const repository = require('./auth.repository');
const validation = require('./auth.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
