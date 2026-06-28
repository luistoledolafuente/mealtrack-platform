const routes = require('./daily-meals.routes');
const controller = require('./daily-meals.controller');
const service = require('./daily-meals.service');
const repository = require('./daily-meals.repository');
const validation = require('./daily-meals.validation');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
};
