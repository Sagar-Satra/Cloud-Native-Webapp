import express from 'express';
import multer from 'multer';
import { uploadFile, getFileById, deleteFile, methodsNotAllowed } from '../controllers/fileUploadController.js';
import sequelize from '../database/db.js';

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
      await sequelize.authenticate();
      next();
    } catch (error) {
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