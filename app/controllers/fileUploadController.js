import { uploadFileToS3, getFileMetadataById, deleteFileById } from '../services/fileService.js';
import { setNoCacheHeaders } from "../utils/headers.js";
import { logger } from '../utils/logging.js';

// Method not allowed handler
export const methodsNotAllowed = (req, res) => {
    logger.warn(`Method not allowed: ${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      requestId: req.requestId
    });
    setNoCacheHeaders(res);
    res.status(405).send();
};

// Upload a file
export const uploadFile = async (req, res) => {
  try {
    logger.info('Processing file upload request from controller', {
      requestId: req.requestId,
      contentType: req.get('Content-Type')
    });
    setNoCacheHeaders(res);
    if (!req.file) {
      logger.warn('No file in upload request', { requestId: req.requestId });
      return res.status(400).send();
    }
    
    const { buffer, originalname, mimetype, size } = req.file;
    
    logger.info('File details received from request in controller', {
      requestId: req.requestId,
      filename: originalname,
      mimetype,
      size
    });
    // Call service function to upload file
    const file = await uploadFileToS3(buffer, originalname, mimetype, size);
    
    logger.info('File uploaded successfully - status check in controller', {
      requestId: req.requestId,
      fileId: file.id,
      filename: file.file_name
    });

    // Return response matching the schema
    return res.status(201).json({
      file_name: file.file_name,
      id: file.id,
      url: file.url,
      upload_date: file.upload_date,
      file_size: file.file_size,
      mime_type: file.mime_type
    });
  } catch (error) {
    logger.error('Error uploading file - status check from controller', {
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });
    console.error('Error uploading file - status check from controller:', error);
    return res.status(503).send();
  }
};

// Get file metadata by ID
export const getFileById = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    logger.info('Getting file ID from request in controller', {
        requestId: req.requestId,
        fileId
    });
    
    setNoCacheHeaders(res);
    
    // Call service function to get file metadata
    const file = await getFileMetadataById(fileId);
    
    logger.info('File metadata retrieved successfully - controller', {
        requestId: req.requestId,
        fileId,
        filename: file.file_name
    });

    return res.status(200).json({
      file_name: file.file_name,
      id: file.id,
      url: file.url,
      upload_date: file.upload_date,
      file_size: file.file_size,
      mime_type: file.mime_type
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    if (error.message === 'File not found') {
      logger.warn('File not found for retrieval - status check from controller', {
        requestId: req.requestId,
        fileId: req.params.id
      });
      return res.status(404).send();
    }

    logger.error('Error retrieving file - status check from controller', {
      requestId: req.requestId,
      fileId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    return res.status(503).send();
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    logger.info('Deleting file request received in controller', {
        requestId: req.requestId,
        fileId
    });
    
    setNoCacheHeaders(res);
    
    // Call service function to delete file
    await deleteFileById(fileId);
    
    logger.info('File deleted successfully - status check controller', {
      requestId: req.requestId,
      fileId
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting file:', error);
    if (error.message === 'File not found') {
      logger.warn('File not found for deletion - status check from controller', {
        requestId: req.requestId,
        fileId: req.params.id
      });

      return res.status(404).send();
    }
    logger.error('Error deleting file - status check from controller', {
      requestId: req.requestId,
      fileId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    return res.status(503).send();
  }
};