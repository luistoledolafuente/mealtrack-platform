const routes = require('./meal-plans.routes');
const controller = require('./meal-plans.controller');
const service = require('./meal-plans.service');
const repository = require('./meal-plans.repository');
const validation = require('./meal-plans.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
