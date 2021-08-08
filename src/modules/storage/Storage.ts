import {Request, Response} from "express";
import Joi from "joi";
import GoogleCloud from "../../implementations/GoogleCloud";
import CloudUploadStorage from "../schemas/CloudUploadStorage";
import {StatusCodes} from "http-status-codes";
import {validate} from "../../utils/validate";
import ParseServer from "../../implementations/ParseServer";
import {GetFilesOptions} from "@google-cloud/storage";

export async function createResumableUrl(req: Request, res: Response) {

    const {path, title, total} = req.body;

    const schema = Joi.object({
        path: Joi.string()
            .required(),
        title: Joi.string()
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
        origin: "http://localhost:3001"
    });

    // return res.send(resumeUrl);

    // CREATE CLOUD STORAGE
    const cloudUploadStorage = new CloudUploadStorage();
    cloudUploadStorage.init(path + "/" + title, resumeUrl.toString(), total);

    // SAVE
    let savedCloudUploadStorage = await cloudUploadStorage.save();

    const token = savedCloudUploadStorage.get("token");
    console.log("Saved", req.hostname, savedCloudUploadStorage.toJSON())
    // RETURN
    if (!token)
        return res.status(StatusCodes.NOT_FOUND).json({
            error: "Token Not Found,Check Maybe Object Not Created"
        }).end();

    res.json({
        token,
        url: resumeUrl.toString()
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

export const listBucketFiles = async (req: Request, res: Response) => {

    const {page = 1, folder = ""} = req.query;

    const bucket = await GoogleCloud.bucket();
    let options: GetFilesOptions = {
        includeTrailingDelimiter: true,
        delimiter: "/",
        maxResults: 20
    };
    const [files, nextPageToken] = await bucket.getFiles(options);

    // console.log(files[0])

    console.log(nextPageToken)
    let filesMade = files.map(file => (
        {
            name: file.name,
            url: file.metadata.selfLink,
            contentType: file.metadata.contentType,
            updatedAt: file.metadata.updatedAt,
            size: file.metadata.size
        }
    ));
    res.setHeader("NEXT_PAGE", nextPageToken && nextPageToken.toString());
    res.json(filesMade).end();
}