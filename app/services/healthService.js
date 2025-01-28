import { healthCheckModel } from '../database/schema/healthCheckModel.js';

export const createHealthCheckService = async () => {
    return await healthCheckModel.create({});
};
