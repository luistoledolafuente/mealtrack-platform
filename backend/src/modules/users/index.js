const routes = require('./users.routes');
const controller = require('./users.controller');
const service = require('./users.service');
const repository = require('./users.repository');
const validation = require('./users.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
