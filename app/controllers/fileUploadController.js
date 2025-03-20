import { uploadFileToS3, getFileMetadataById, deleteFileById } from '../services/fileService.js';
import { setNoCacheHeaders } from "../utils/headers.js";

// Method not allowed handler
export const methodsNotAllowed = (req, res) => {
    setNoCacheHeaders(res);
    res.status(405).json({ error: 'Method Not Allowed' });
};

// Upload a file
export const uploadFile = async (req, res) => {
  try {
    setNoCacheHeaders(res);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { buffer, originalname, mimetype, size } = req.file;
    
    // Call service function to upload file
    const file = await uploadFileToS3(buffer, originalname, mimetype, size);
    
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
    console.error('Error uploading file:', error);
    return res.status(503).json({ error: 'Failed to upload file', message: error.message });
  }
};

// Get file metadata by ID
export const getFileById = async (req, res) => {
  try {
    setNoCacheHeaders(res);
    const fileId = req.params.id;
    
    // Call service function to get file metadata
    const file = await getFileMetadataById(fileId);
    
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
      return res.status(404).json({ error: 'File not found' });
    }
    return res.status(503).json({ error: 'File could not be retrieved', message: error.message });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    setNoCacheHeaders(res);
    const fileId = req.params.id;
    
    // Call service function to delete file
    await deleteFileById(fileId);
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting file:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({ error: 'File not found' });
    }
    return res.status(503).json({ error: 'Service Unavailable', message: error.message });
  }
};