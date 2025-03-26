import { healthCheckModel } from '../database/schema/healthCheckModel.js';

import { logger } from '../utils/logging.js';
import { timeDbOperation } from '../utils/metrics.js';

export const createHealthCheckService = async () => {
    logger.info('Creating health check record');
    
    // Wrap the database operation with timing metrics
    return await timeDbOperation('create', 'healthCheck', async () => {
        const record = await healthCheckModel.create({});
        
        logger.info('Health check record created successfully', {
            checkId: record.check_id,
            datetime: record.datetime
        });
        
        return record;
    });
};