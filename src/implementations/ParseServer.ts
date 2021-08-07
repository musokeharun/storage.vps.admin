import Parse from "parse/node";

Parse.initialize("_VSP_APP_ID", "_VSP_JS_KEY");
Parse.serverURL = process.env.SERVER_URL || "http://35.237.175.80:3000/parse";
export default Parse;