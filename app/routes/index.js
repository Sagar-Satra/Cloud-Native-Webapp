import { healthRouter } from "./healthRouter.js";
import { fileRouter } from "./fileRouter.js";

const initRoutes = (app) => {
    app.use('/healthz', healthRouter);
    app.use('/v2', fileRouter);
};

export default initRoutes;
