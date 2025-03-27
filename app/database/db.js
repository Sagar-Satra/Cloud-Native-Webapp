import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logging.js';
import { timeDbOperation } from '../utils/metrics.js';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME , process.env.DB_PASSWORD, {
  host: process.env.HOST,
  dialect: 'mysql',
  define : {
    timestamps : false
  },

  logging: (sql) => {
    logger.debug('Executing SQL', { sql });
  }
});

// Method to verify the connection
export const authenticate = async () => {
  try {
    await timeDbOperation('authenticate', 'connection', async () => {
      return await sequelize.authenticate();
    });
    console.log('Connection has been established successfully.');
    logger.info('Database connection established successfully from db.js');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    logger.error('Unable to connect to the database - db.js', {
      error: error.message,
      stack: error.stack
    });
  }
};

export default sequelize;