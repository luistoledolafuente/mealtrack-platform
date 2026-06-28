function tenantContext(req, res, next) {
  // TODO: Extract and attach restaurant_id to req
  // From authenticated user or request context
  req.tenantId = req.headers['x-tenant-id'] || null;
  next();
}

module.exports = tenantContext;
