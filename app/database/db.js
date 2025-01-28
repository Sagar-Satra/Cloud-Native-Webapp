import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME , process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  define : {
    timestamps : false
  }
});

export default sequelize;