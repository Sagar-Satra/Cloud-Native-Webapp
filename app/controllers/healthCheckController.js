import { createHealthCheckService } from "../services/healthService.js";
import { setNoCacheHeaders } from "../utils/headers.js";

export const getHealthController = async (req, res) => {
    try {
        setNoCacheHeaders(res);
        if (Object.keys(req.query).length > 0) {
            return res.status(400).send();
        }
        if(req.body && Object.keys(req.body).length > 0 ){
            return res.status(400).send();
        }
        await createHealthCheckService();
        return res.status(200).send();
    } catch (error) {
        return res.status(503).send();
    }
};

export const methodsNotAllowed = (req, res) => {
    try{
        setNoCacheHeaders(res);
        return res.status(405).send();
    } catch (error) {
        return res.status(503).send();
    }
};

