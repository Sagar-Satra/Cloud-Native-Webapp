
import { fileModel } from '../database/schema/fileModel.js';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../utils/logging.js';
import { timeDbOperation, timeS3Operation } from '../utils/metrics.js';

// Upload a file to S3 and store metadata in the database
export const uploadFileToS3 = async (fileBuffer, fileName, mimeType, fileSize) => {
  try {
    const s3 = new AWS.S3();
    const bucketName = process.env.S3_BUCKET;
    
    // Generating a unique ID for the file
    const fileId = uuidv4();
    const s3Key = `${fileId}-${fileName}`;

    logger.info('Starting S3 upload', {
      fileName,
      fileSize,
      mimeType,
      fileId
    });
    
    // uploading to S3 bucket with metrics timing
    const uploadResult = await timeS3Operation('upload', async () => {
      const params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType
      };
      
      return s3.upload(params).promise();
    });
    
    logger.info('S3 upload completed successfully', {
      fileName,
      fileId,
      s3Location: uploadResult.Location
    });
    
    const formattedUrl = `${bucketName}/${fileId}/${fileName}`;
    
    // saving metadata to database with metrics timing
    const file = await timeDbOperation('create', 'fileMetadata', async () => {
      logger.info('Saving file metadata to RDS database...', {
        fileId,
        fileName,
        fileSize
      });
      
      return fileModel.create({
        id: fileId,
        file_name: fileName,
        url: formattedUrl,
        upload_date: new Date().toISOString().split('T')[0],
        file_size: fileSize,
        mime_type: mimeType
      });
    });
    
    return file;
  } catch (error) {
    logger.error('Error in uploadFileToS3 service', {
      error: error.message,
      stack: error.stack,
      fileName
    });
    throw error;
  }
};

// Get file metadata by ID
export const getFileMetadataById = async (fileId) => {
  try {
    logger.info('Fetching file metadata', { fileId });
    
    // Get file data with metrics timing
    const file = await timeDbOperation('findByPk', 'getFileMetadata', async () => {
      return fileModel.findByPk(fileId);
    });
    
    if (!file) {
      logger.warn('File not found', { fileId });
      throw new Error('File not found');
    }
    
    logger.info('File metadata retrieved successfully', { fileId });
    
    return file;
  } catch (error) {
    logger.error('Error in getFileMetadataById service', {
      error: error.message,
      stack: error.stack,
      fileId
    });
    throw error;
  }
};

// Delete file from S3 and database
export const deleteFileById = async (fileId) => {
  try {
    const s3 = new AWS.S3();
    const bucketName = process.env.S3_BUCKET;
    
    logger.info('Starting file deletion process', { fileId });
    
    // Get file details from database with metrics timing
    const file = await timeDbOperation('findByPk', 'deleteFileMetadata', async () => {
      return fileModel.findByPk(fileId);
    });
    
    if (!file) {
      logger.warn('File not found for deletion', { fileId });
      throw new Error('File not found');
    }
    
    // Use the actual S3 key if available, otherwise try to derive it
    let key = `${fileId}-${file.file_name}`;

    logger.info('Deleting file from S3', {
      fileId,
      fileName: file.file_name,
      s3Key: key
    });
    
    // Delete from S3 with metrics timing
    await timeS3Operation('delete', async () => {
      const params = {
        Bucket: bucketName,
        Key: key
      };
      
      return s3.deleteObject(params).promise();
    });
    
    logger.info('File deleted from S3 successfully, now deleting from database', { fileId });
    
    // Delete from database with metrics timing
    await timeDbOperation('destroy', 'deleteFileRecord', async () => {
      return file.destroy();
    });
    
    logger.info('File deletion completed successfully', { fileId });
    
    return true;
  } catch (error) {
    logger.error('Error in deleteFileById service', {
      error: error.message,
      stack: error.stack,
      fileId
    });
    throw error;
  }
};