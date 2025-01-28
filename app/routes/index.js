import { healthRouter } from "./healthRouter.js";

const initRoutes = (app) => {
    app.use('/healthz', healthRouter);
};

export default initRoutes;