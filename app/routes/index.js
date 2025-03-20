import { healthRouter } from "./healthRouter.js";
import { fileRouter } from "./fileRouter.js";

const initRoutes = (app) => {
    app.use('/healthz', healthRouter);
    app.use('/v1', fileRouter);
};

export default initRoutes;