import express from 'express';
import multer from 'multer';
import { uploadFile, getFileById, deleteFile, methodsNotAllowed } from '../controllers/fileUploadController.js';

export const fileRouter = express.Router();

// Configure multer for file uploads - store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

// Handle file uploads - POST /v1/file
fileRouter.route('/file')
    .post(upload.single('file'), uploadFile)
    .all(methodsNotAllowed);

// Handle file retrieval and deletion - GET & DELETE /v1/file/:id
fileRouter.route('/file/:id')
    .get(getFileById)
    .delete(deleteFile)
    .head(methodsNotAllowed)
    .all(methodsNotAllowed);