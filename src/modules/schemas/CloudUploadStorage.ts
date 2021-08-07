import ParseServer from "../../implementations/ParseServer";
import {v1} from "uuid";
import ACLs from "./ACLs";
import {DateTime} from "luxon";

class CloudUploadStorage extends ParseServer.Object {

    constructor() {
        super('CloudUploadStorage');
    }

    init(title: string, url: string, total: number) {
        this.set("title", title);
        this.set("token", v1())
        this.set("url", url)
        this.set("total", total)
        this.set("loaded", 0)
        this.set("completed", false)
        this.setACL(ACLs.PUBLIC_ACL)
    }

    completed() {
        return this.save({
            loaded: this.get("total"),
            completed: true,
            completedAt: DateTime.now().toJSDate()
        })
    }
}

ParseServer.Object.registerSubclass('CloudUploadStorage', CloudUploadStorage);
export default CloudUploadStorage;