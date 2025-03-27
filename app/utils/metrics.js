import { StatsD } from "hot-shots";

const client = new StatsD({
    host: 'localhost',
    port: 8125,
    prefix: 'webapp.',
    errorHandler: (error) => {
        console.error(`StatsD error: ${error.message}`);
    }
});

// API metrics middleware
const apiMetrics = (req, res, next) => {
    const startTime = Date.now();
    
    // Count this API call for metrics
    client.increment(`api.${req.method}.${req.path}.count`);
    
    // Track API response time
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        client.timing(`api.${req.method}.${req.path}.response_time`, duration);
    });
    
    next();
};

// Helper function to time database operations
const timeDbOperation = async (operation, queryName, func) => {
    const startTime = Date.now();
    
    try {
        // Execute the database operation
        const result = await func();
        
        // Calculate and record the duration
        const duration = Date.now() - startTime;
        client.timing(`database.${operation}.${queryName}.time`, duration);
        
        return result;
    } catch (error) {
        // Even on error, record the timing
        const duration = Date.now() - startTime;
        client.timing(`database.${operation}.${queryName}.error.time`, duration);
        
        // Re-throw the error
        throw error;
    }
};

// Helper function to time S3 operations
const timeS3Operation = async (operation, func) => {
    const startTime = Date.now();
    
    try {
        // Execute the S3 operation
        const result = await func();
        
        // Calculate and record the duration
        const duration = Date.now() - startTime;
        client.timing(`s3.${operation}.time`, duration);
        
        return result;
    } catch (error) {
        // Even on error, record the timing
        const duration = Date.now() - startTime;
        client.timing(`s3.${operation}.error.time`, duration);
        
        // Re-throw the error
        throw error;
    }
};

export { client, apiMetrics, timeDbOperation, timeS3Operation };
