import winston from 'winston';
import { v4 as uuidv4 } from 'uuid'; 
import fs from 'fs'; 
import path from 'path'; 

const LOG_DIR = process.env.LOG_DIR || '/var/log/webapp';

// Make sure the log directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch (error) {
  console.warn(`Warning: Could not create log directory: ${error.message}`);
}

// Set up transports array for winston logger
const transports = [
  new winston.transports.Console({
    format: winston.format.simple()
  })
];

// Only add file transport if write to directory
try {
  // Create a proper log file path
  const logFilePath = path.join(LOG_DIR, 'application.log');
  
  transports.push(
    new winston.transports.File({
      filename: logFilePath,
      level: 'info'
    })
  );
} catch (error) {
  console.warn(`Warning: File logging disabled: ${error.message}`);
}

// creating the logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'webapp' },
    transports: transports
});

// created a request logger middleware
const requestLogger = (req, res, next) => {
    // generating a unique request ID
    const requestId = uuidv4();
    // attaching it to the request object 
    req.requestId = requestId; 

    logger.info(`Request received: ${requestId} - ${req.method} ${req.originalUrl}`, {
        requestId,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
    });

    req._startTime = Date.now(); // store the start time for response time calculation

    res.on('finish', () => {
        logger.info(`Response sent: ${requestId} - ${res.statusCode}`, {
            requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${Date.now() - req._startTime}ms`, // calculating the response time
            timestamp: new Date().toISOString()
        });
    });

    next();
};

const errorLogger = (err, req, res, next) => {
    logger.error(`Application Error occurred: ${req.requestId} - ${err.message}`, {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        error: err.message,
        stack: err.stack, // logging the stack trace for debugging
        responseTime: `${Date.now() - req._startTime}ms`, // calculating the response time
        timestamp: new Date().toISOString()
    });
    next(err);
};  

export { logger, requestLogger, errorLogger }; // exporting the logger and middleware

