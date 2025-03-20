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
    
    // Upload to S3
    const params = {
      Bucket: bucketName,
      Key: `${fileId}-${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType
    };

    const uploadResult = await s3.upload(params).promise();
    
    const concat_url = `${bucketName}/${fileId}/${fileName}`;
    // Save metadata to database
    const file = await fileModel.create({
      id: fileId,
      file_name: fileName,
      url: concat_url,
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
    
    // Delete from S3
    const params = {
      Bucket: bucketName,
      Key: file.url
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