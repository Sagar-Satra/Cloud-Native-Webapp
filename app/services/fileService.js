// app/services/fileService.js
import { fileModel } from '../database/schema/fileModel.js';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Upload a file to S3 and store metadata in the database
export const uploadFileToS3 = async (fileBuffer, fileName, mimeType, fileSize) => {
  try {
    const s3 = new AWS.S3();
    const bucketName = process.env.S3_BUCKET;
    
    // Generate a unique ID for the file
    const fileId = uuidv4();
    
    const s3Key = `${fileId}-${fileName}`;

    // Upload to S3
    const params = {
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType
    };

    const uploadResult = await s3.upload(params).promise();
    
    const formattedUrl = `${bucketName}/${fileId}/${fileName}`;
    // Save metadata to database
    const file = await fileModel.create({
      id: fileId,
      file_name: fileName,
      url: formattedUrl,      
    //   s3_key: s3Key,          // Actual S3 key for operations
      upload_date: new Date().toISOString().split('T')[0],
      file_size: fileSize,
      mime_type: mimeType
    });
    
    return file;
  } catch (error) {
    console.error('Error in uploadFileToS3 service:', error);
    throw error;
  }
};

// Get file metadata by ID
export const getFileMetadataById = async (fileId) => {
  try {
    const file = await fileModel.findByPk(fileId);
    if (!file) {
      throw new Error('File not found');
    }
    
    return file;
  } catch (error) {
    console.error('Error in getFileMetadataById service:', error);
    throw error;
  }
};

// Delete file from S3 and database
export const deleteFileById = async (fileId) => {
  try {
    const s3 = new AWS.S3();
    const bucketName = process.env.S3_BUCKET;
    
    // Get file details from database
    const file = await fileModel.findByPk(fileId);
    if (!file) {
      throw new Error('File not found');
    }
    
    // Use the actual S3 key if available, otherwise try to derive it
    let key = `${fileId}-${file.file_name}`;

    // Delete from S3
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    
    // Delete from database
    await file.destroy();
    
    return true;
  } catch (error) {
    console.error('Error in deleteFileById service:', error);
    throw error;
  }
};