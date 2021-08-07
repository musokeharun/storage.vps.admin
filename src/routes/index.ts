import {Router} from 'express';
import Upload from "./Upload";

// Export the base-router
const baseRouter = Router();
baseRouter.use('/upload', Upload);

export default baseRouter;
