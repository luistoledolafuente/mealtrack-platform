const info = (...args) => console.log('[INFO]', ...args);
const error = (...args) => console.error('[ERROR]', ...args);
const warn = (...args) => console.warn('[WARN]', ...args);

module.exports = { info, error, warn };
