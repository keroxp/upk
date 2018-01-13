import {basename, resolve} from "path";
import {download} from "./download";
import {copy, stat} from "fs-extra";
import {isString} from "util";
import {resolveModuleDir} from "./module";

export async function isRemoteFile(urlLike: string) {
    return isString(urlLike) && urlLike.match(/^https?:\/\//);
}

export async function resolveArchive(name: string, urlLike: string, opts?): Promise<string> {
    let out = await resolveModuleDir(name);
    if (urlLike.match(/^https?:\/\//)) {
        // remote
        await download(urlLike, out);
        return out;
    } else {
        // local
        if ((await stat(urlLike)).isDirectory()) {
            await copy(resolve(urlLike), out);
            return out;
        } else {
            const filename = basename(urlLike);
            out += `/${filename}`;
            await copy(resolve(urlLike), out);
            return out;
        }
    }
}