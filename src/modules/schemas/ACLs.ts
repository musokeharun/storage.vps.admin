import ParseServer from "../../implementations/ParseServer";

// PUBLIC ROLE
const publicAcl = new ParseServer.ACL();
publicAcl.setPublicReadAccess(true);
publicAcl.setPublicWriteAccess(true);
const PUBLIC_ACL = "Public";
const role = new ParseServer.Role(PUBLIC_ACL, publicAcl);

export default {
    PUBLIC_ACL: publicAcl
}
