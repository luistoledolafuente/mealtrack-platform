const app = require('./app');
const config = require('./config');
const logger = require('./shared').logger;

app.listen(config.port, () => {
  logger.info(`MealTrack API running on port ${config.port} (${config.nodeEnv})`);
});
