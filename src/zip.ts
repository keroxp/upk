import {createReadStream, createWriteStream} from "fs";
import unzip = require("unzip-stream");
import {download} from "./download";
import * as path from "path";
import {ensureDir, remove} from "fs-extra";
import {dirname} from "path";
import {resolveModuleDir} from "./module";

export async function zip(name, url, opts?): Promise<string> {
    const downloadedPath = await download(url, resolveModuleDir(name), {
        "content-type": "application/zip"
    });
    const dest = resolveModuleDir(name);
    console.log(`$[{name}] zip file has been dwnloaded: ${downloadedPath}`);
    await new Promise((resolve, reject) => {
        createReadStream(downloadedPath)
            .pipe(unzip.Parse({path: dest}))
            .on("entry", async entry => {
                console.log(`[${name}]: inflated: ${entry.path}`);
                if (entry.path.match(/^__macos/i)) {
                    entry.autodrain();
                } else {
                    const {type} = entry;
                    const out = path.resolve(dest, entry.path);
                    if (type === "Directory") {
                        await ensureDir(out);
                    } else if (type === "File") {
                        await ensureDir(dirname(out));
                        const w = createWriteStream(out);
                        entry.pipe(w);
                    }
                }
            })
            .on("error", reject)
            .on("close", resolve);
    });
    //await remove(downloadedPath);
    return dest;
}