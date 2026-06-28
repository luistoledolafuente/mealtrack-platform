const routes = require('./notifications.routes');
const controller = require('./notifications.controller');
const service = require('./notifications.service');
const repository = require('./notifications.repository');
const validation = require('./notifications.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
