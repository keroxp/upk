import {createReadStream, createWriteStream} from "fs";
import {download} from "../download";
import * as path from "path";
import {dirname} from "path";
import {ensureDir, remove} from "fs-extra";
import {resolveModuleDir} from "../module";
import {isFunction} from "util";
import unzip = require("unzip-stream");
import Debug = require("debug");

const debug = Debug("upk:zip");
export type ZipOpts = {}
export type PathResolver = () => string;

function isPathProvider(a): a is PathResolver {
    return isFunction(a);
}

export const zip = runZip;

export async function runZip(name: string, url: string, opts?: PathResolver | ZipOpts): Promise<string> {
    debug(`runZip: ${name} from ${url}`);
    const downloadedPath = await download(url, resolveModuleDir(name), {
        "content-type": "application/zip"
    });
    const dest = resolveModuleDir(name);
    debug(`[${name}] zip dowload complete:-> ${downloadedPath}`);
    await new Promise((resolve, reject) => {
        createReadStream(downloadedPath)
            .pipe(unzip.Parse({path: dest}))
            .on("entry", async entry => {
                debug(`[${name}]: inflated: ${entry.path}`);
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
    await remove(downloadedPath);
    let result = dest;
    if (isPathProvider(opts)) {
        result = path.resolve(dest, opts());
    }
    return result;
}