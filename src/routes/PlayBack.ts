import {Router} from 'express';
import {uploadPlayBack} from "../modules/playback/PlayBack";
import fileUpload from "express-fileupload";
import path from "path";

const PlayBack = Router();

PlayBack.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname + "../../../writable/")
}));
PlayBack.post("/upload", uploadPlayBack)

export default PlayBack;