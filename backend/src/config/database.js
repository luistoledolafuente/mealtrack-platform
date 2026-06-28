const config = require('./index');

module.exports = {
  getClient: () => {
    // TODO: Implement PostgreSQL connection via Supabase
    // Use pg or @supabase/supabase-js
    throw new Error('Database connection not implemented yet');
  },
};
