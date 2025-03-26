import { createHealthCheckService } from "../services/healthService.js";
import { setNoCacheHeaders } from "../utils/headers.js";
import { logger } from '../utils/logging.js';

export const getHealthController = async (req, res) => {
    try {
        logger.info('Health check requested', {
            requestId: req.requestId,
            query: req.query,
            hasBody: req.body && Object.keys(req.body).length > 0
        });
        setNoCacheHeaders(res);
        if (Object.keys(req.query).length > 0) {
            logger.warn('Health check request contains query parameters', {
                requestId: req.requestId,
                query: req.query
            });
            return res.status(400).send();
        }
        if(req.body && Object.keys(req.body).length > 0 ){
            logger.warn('Health check request contains body data', {
                requestId: req.requestId
            });
            return res.status(400).send();
        }
        await createHealthCheckService();
        logger.info('Health check successful', {
            requestId: req.requestId
        });
        return res.status(200).send();
    } catch (error) {
        logger.error('Health check failed', {
            requestId: req.requestId,
            error: error.message,
            stack: error.stack
        });
        return res.status(503).send();
    }
};

export const methodsNotAllowed = (req, res) => {
    try{
        logger.warn('Method not allowed for health check', {
            requestId: req.requestId,
            method: req.method,
            path: req.path
        });
        setNoCacheHeaders(res);
        return res.status(405).send();
    } catch (error) {
        logger.error('Error in methods not allowed handler', {
            requestId: req.requestId,
            error: error.message,
            stack: error.stack
        });
        return res.status(503).send();
    }
};

