import {Router} from 'express';
import Upload from "./Upload";
import PlayBack from "./PlayBack";

// Export the base-router
const baseRouter = Router();
baseRouter.use('/upload', Upload);
baseRouter.use('/playback', PlayBack);

export default baseRouter;
