import express from 'express';
import dotenv from 'dotenv';
import sequelize from './app/database/db.js';

import initApp from './app/app.js';
import { healthCheckModel } from './app/database/schema/healthCheckModel.js';

dotenv.config();
const app = express();
const port = process.env.PORT;
initApp(app)

app.listen(port , async () => {
    console.log("Server running on port" , process.env.PORT)
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await healthCheckModel.sync();
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
})
