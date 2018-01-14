import {createReadStream, createWriteStream} from "fs";
import unzip = require("unzip-stream");
import {download} from "../download";
import * as path from "path";
import {ensureDir, remove} from "fs-extra";
import {dirname} from "path";
import {resolveModuleDir} from "../module";
import {isFunction} from "util";
import {ResolvingContext} from "./index";
import Debug = require("debug");
const debug = Debug("upk:zip");
export type ZipOpts = {}
export type PathProvider = () => string;

function isPathProvider(a): a is PathProvider {
    return isFunction(a);
}

export function resolveZip(url, opts?: PathProvider | ZipOpts): () => Promise<string> {
    return async function () {
        const ctx = this as ResolvingContext;
        return zip(ctx.moduleName, url, opts);
    }
}

export async function zip(name, url, opts?: PathProvider | ZipOpts): Promise<string> {
    const downloadedPath = await
        download(url, resolveModuleDir(name), {
            "content-type": "application/zip"
        });
    const dest = resolveModuleDir(name);
    debug(`[${name}] zip file has been dwnloaded: ${downloadedPath}`);
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