import {Router} from 'express';
import {createResumableUrl, listBucketFiles, updateResumable} from "../modules/storage/Storage";

const Upload = Router();
Upload.post("/resume/get", createResumableUrl)
Upload.post("/resume/update", updateResumable)
Upload.post("/resume/list", listBucketFiles)


export default Upload;