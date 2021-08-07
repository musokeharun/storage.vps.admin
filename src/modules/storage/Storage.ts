import {Request, Response} from "express";
import Joi from "joi";
import GoogleCloud from "../../implementations/GoogleCloud";
import CloudUploadStorage from "../schemas/CloudUploadStorage";
import {StatusCodes} from "http-status-codes";
import {validate} from "../../utils/validate";
import ParseServer from "../../implementations/ParseServer";

export async function createResumableUrl(req: Request, res: Response) {

    const {path, title, total} = req.body;

    const schema = Joi.object({
        path: Joi.string()
            .alphanum()
            .required(),
        title: Joi.string()
            .alphanum()
            .required(),
        total: Joi.number()
            .required()
    })

    let errors = await validate(schema, {path, title, total});
    if (errors) {
        return res.status(StatusCodes.FORBIDDEN).json({
            error: "Details Not Found",
            ...errors
        });
    }

    // GET URL FROM GCS
    const googleBucket = await GoogleCloud.bucket();
    let file = googleBucket.file(path + "/" + title);
    let resumeUrl = await file.createResumableUpload({
        origin: "127.0.0.1:3000"
    });


    // return res.send(resumeUrl);

    // CREATE CLOUD STORAGE
    const cloudUploadStorage = new CloudUploadStorage();
    cloudUploadStorage.init(path + "/" + title, resumeUrl.toString(), total);

    // SAVE
    let savedCloudUploadStorage = await cloudUploadStorage.save();

    const token = savedCloudUploadStorage.get("token");
    console.log("Saved", savedCloudUploadStorage.toJSON())
    // RETURN
    if (!token)
        return res.status(StatusCodes.NOT_FOUND).json({
            error: "Token Not Found,Check Maybe Object Not Created"
        }).end();

    res.json({
        token
    })
}

export const updateResumable = async (req: Request, res: Response) => {

    const {token, loaded, completed} = req.body;
    const schema = Joi.object({
        token: Joi.string().required(),
        loaded: Joi.number().required(),
    })
    let errors = await validate(schema, {token, loaded});
    if (errors) {
        return res.status(StatusCodes.NOT_FOUND).json({
            error: "Could not validate object details",
            ...errors
        })
    }

    // GET STORAGE OBJECT OF THIS TOKEN
    let query = new ParseServer.Query(CloudUploadStorage);
    query.equalTo("token", token);
    let cloudStorageObject = await query.first();
    if (!cloudStorageObject) {
        return res.status(StatusCodes.NOT_FOUND).json({
            error: "Could locate the object supplied",
        })
    }

    // UPDATE THE LOADED BYTES
    if (completed && completed == 1) {
        cloudStorageObject.completed();
    } else {
        cloudStorageObject.set("loaded", parseInt(loaded));
        cloudStorageObject.save();
    }

    return res.json({
        msg: token + " object completely loaded."
    })
}

export const download = async (req: Request, res: Response) => {

    const {title} = req.body;
    if (!title) {
        return res.status(StatusCodes.NOT_FOUND).json({
            error: "Details not supplied"
        })
    }


    const bucket = await GoogleCloud.bucket();
    let file = bucket.file(title);
    if (!await file.exists()) {
        return res.status(StatusCodes.NOT_FOUND).json({
            error: "Object not supplied"
        })
    }


}