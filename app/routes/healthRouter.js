import express from 'express';
import { getHealthController, methodsNotAllowed } from '../controllers/healthCheckController.js';

export const healthRouter = express.Router();

healthRouter.route('/')
    .get(getHealthController)
    .all(methodsNotAllowed);
