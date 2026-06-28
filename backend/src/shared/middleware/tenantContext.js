/**
 * Multi-tenant middleware.
 * Extracts restaurant_id from authenticated user or request header
 * and attaches it to req.tenantId for downstream filtering.
 *
 * TODO: Once auth is implemented, derive tenantId from req.user.restaurantId
 * instead of (or in addition to) the x-tenant-id header.
 */

function tenantContext(req, res, next) {
  // Priority: authenticated user > header > none
  if (req.user && req.user.restaurantId) {
    req.tenantId = req.user.restaurantId;
  } else {
    req.tenantId = req.headers['x-tenant-id'] || null;
  }

  next();
}

module.exports = tenantContext;
