import {CloudStorage} from "../interfaces/CloudStorage";
import {Bucket, Storage} from "@google-cloud/storage";
import path from "path";

class GoogleCloud implements CloudStorage {
    init(): any {
    }

    storage = async (): Promise<Storage> => {
        return new Storage({
            keyFilename: process.env.CLOUD_KEY_FILE || path.join(__dirname, "vsp.json"),
            projectId: process.env.PROJECT_ID || "vsp-storage",
        });
    }

    bucket = async (): Promise<Bucket> => {
        let storage = await this.storage();
        return storage.bucket(process.env.BUCKET_NAME || "vsp-test-bucket");
    }

}

export default new GoogleCloud();