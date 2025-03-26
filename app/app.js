import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import initRoutes from '../app/routes/index.js';
import { requestLogger, errorLogger } from './utils/logging.js';
import { apiMetrics } from './utils/metrics.js';

const initApp = (app) => {
    app.use(cors());    
    app.use(helmet());          
    app.use(express.json());  
    app.use(requestLogger);
    app.use(apiMetrics);    
    initRoutes(app);    
    app.use(errorLogger);
    app.use((err, req, res, next) => {
        if (!res.headersSent) {
          res.status(503).send();
        }
    });            
}

export default initApp;