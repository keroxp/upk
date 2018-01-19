import {createReadStream, createWriteStream} from "fs";
import {download} from "../download";
import * as path from "path";
import {dirname} from "path";
import {ensureDir, remove} from "fs-extra";
import {resolveModuleDir} from "../module";
import {isFunction} from "util";
import unzip = require("unzip-stream");
import Debug = require("debug");
import {resolveArchive} from "./index";

const debug = Debug("upk:zip");
const crypto = require("crypto");
export type ZipOpts = {}
export type PathResolver = () => string;

function isPathProvider(a): a is PathResolver {
    return isFunction(a);
}

export const zip = runZip;

export async function runZip(name: string, urlLike: string, pather?: PathResolver): Promise<{
    downloadedFile: string,
    extractedPath: string
}> {
    debug(`runZip: ${name} from ${urlLike}`);
    //await remove(downloadedPath);
    const file = await resolveArchive(name, urlLike);
    await extractZip(name, file);
    return {
        downloadedFile: file,
        extractedPath: pather ? path.resolve(path.dirname(file), pather()) : path.dirname(file)
    };
}

export async function extractZip(name: string, file: string) {
    const dest = resolveModuleDir(name);
    debug(`[${name}] zip dowload complete:-> ${file}`);
    await new Promise((resolve, reject) => {
        createReadStream(file)
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
}