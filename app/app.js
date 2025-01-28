import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import initRoutes from '../app/routes/index.js';

const initApp = (app) => {
    app.use(cors());    
    app.use(helmet());          
    app.use(express.json());         
    initRoutes(app);                   
}

export default initApp;