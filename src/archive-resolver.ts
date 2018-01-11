import {basename, dirname, resolve} from "path";
import {download} from "./download";
import {copy, ensureDir, stat} from "fs-extra";
import {isString} from "util";

export async function isRemoteFile(urlLike: string) {
    return isString(urlLike) && urlLike.match(/^https?:\/\//);
}

export async function ensureModuleDir(module: string) {
    const dir = `${process.cwd()}/upi-modules/${module}`;
    await ensureDir(dir);
    return resolve(dir);
}
export async function resolveArchive(name: string, urlLike: string, opts?): Promise<string> {
    let out = await ensureModuleDir(name);
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