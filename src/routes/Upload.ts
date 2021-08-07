import {Router} from 'express';
import {createResumableUrl, updateResumable} from "../modules/storage/Storage";

const Upload = Router();
Upload.post("/resume/get", createResumableUrl)
Upload.post("/resume/update", updateResumable)


export default Upload;