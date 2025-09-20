const { Sequelize } = require('sequelize');
const config = require('./env');
const logger = require('./logger');

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool,
    logging: config.nodeEnv === 'development' ? 
      (sql) => logger.debug(sql) : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    timezone: '+00:00' // Store dates in UTC
  }
);

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    if (config.nodeEnv === 'development') {
      // Sync models in development (be careful in production)
      await sequelize.sync({ alter: false });
      logger.info('Database models synchronized');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Close database connection
const closeDB = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB,
  Sequelize
};