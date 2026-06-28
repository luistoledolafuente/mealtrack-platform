const routes = require('./subscriptions.routes');
const controller = require('./subscriptions.controller');
const service = require('./subscriptions.service');
const repository = require('./subscriptions.repository');
const validation = require('./subscriptions.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
