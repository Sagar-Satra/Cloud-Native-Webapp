import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME , process.env.DB_PASSWORD, {
  host: '127.0.0.1',
  dialect: 'mysql',
  define : {
    timestamps : false
  }
});

// Method to verify the connection
export const authenticate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default sequelize;