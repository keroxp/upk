import {createReadStream} from "fs";
import {createHash} from "crypto";
const debug = require("debug")("upk:integrity");
export async function calculateFileIntegrity(path: string) {
    debug("calc integrity: "+path);
    const sha512 = createHash("sha512");
    return new Promise<string>((resolve, reject) => {
        createReadStream(path)
            .on("data", chunk => sha512.update(chunk))
            .on("error", reject)
            .on("end", () => {
                const intg = sha512.digest("hex");
                debug("\t=> "+intg);
                resolve(intg);
            });
    });
}