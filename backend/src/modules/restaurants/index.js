const routes = require('./restaurants.routes');
const controller = require('./restaurants.controller');
const service = require('./restaurants.service');
const repository = require('./restaurants.repository');
const validation = require('./restaurants.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
