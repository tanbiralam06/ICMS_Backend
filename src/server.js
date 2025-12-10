import app from './app.js';
import config from './config/index.js';
import connectDB from './db/db.js';
import logger from './utils/logger.js';

// Connect to Database
connectDB();

app.listen(config.port, () => {
  logger.info(`Server running in ${config.env} mode on port ${config.port}`);
});
