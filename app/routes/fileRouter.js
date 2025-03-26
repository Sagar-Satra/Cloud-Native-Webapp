import express from 'express';
import multer from 'multer';
import { uploadFile, getFileById, deleteFile, methodsNotAllowed } from '../controllers/fileUploadController.js';
import sequelize from '../database/db.js';

import { logger } from '../utils/logging.js';
import { timeDbOperation } from '../utils/metrics.js';

export const fileRouter = express.Router();

// Configure multer for file uploads - store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Middleware to check database connection
const checkDatabaseConnection = async (req, res, next) => {
    try {
      logger.info('Checking database connection from fileRouter...');
      await timeDbOperation('authenticate', 'connection', async () => {
        return await sequelize.authenticate();
      });
      next();
    } catch (error) {
      logger.error('Database connection error', {
        error: error.message,
        stack: error.stack,
        requestId: req.requestId
      });
      console.error('Database connection error:', error);
      return res.status(503).json({ error: 'Service Unavailable', message: 'Database connection error' });
    }
  };

// Handle file uploads - POST /v1/file
fileRouter.route('/file')
    .post(checkDatabaseConnection, upload.single('file'), uploadFile)
    .head(methodsNotAllowed)
    .all(methodsNotAllowed);

// Handle file retrieval and deletion - GET & DELETE /v1/file/:id
fileRouter.route('/file/:id')
    .get(checkDatabaseConnection, getFileById)
    .delete(checkDatabaseConnection, deleteFile)
    .head(methodsNotAllowed)
    .all(methodsNotAllowed);