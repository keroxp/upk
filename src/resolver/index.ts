import p = require("path");
import {download} from "../download";
import {copy, ensureDir, stat} from "fs-extra";
import {resolveModuleDir} from "../module";
import {UpkfileContext} from "../context";
//import copy = require("copy");
//const copyAsync = promisify(copy).bind(copy);
const debug = require("debug")("upk:resolver");
const glob = require("glob-promise");
export type Resolvable = string | (() => Promise<string>);
export type AssetInstllationOptions = {
    include: { src: string, dest: string }[],
    exclude: string[]
}

export async function installAssets(downloadedDir: string, opts?: AssetInstllationOptions) {
    const orgdir = global["__originalDir"];
    const include = opts ? opts.include : [{src: "Assets/*", dest: "Assets"}];
    const exclude = opts ? opts.exclude : [];
    for (const incl of include) {
        const pat = p.resolve(downloadedDir, incl.src);
        const files = await glob(pat, {ignore: exclude});
        debug(files);
        const destdir = p.resolve(orgdir, incl.dest);
        debug(destdir);
        for (const file of files) {
            debug(`copied: ${file}`);
            const dir = p.dirname(file);
            const rpath = p.relative(p.resolve(downloadedDir, dir), file);
            const dest = p.resolve(destdir, rpath);
            await copy(file, dest);
            debug(` -> ${dest}`);
        }
    }
    return "";
}

async function resolveRemoteFile(url: string, out: string) {
    return await download(url, out);
}

async function resolveLocalFile(path: string, outdir: string) {
    // local
    if ((await stat(path)).isDirectory()) {
        debug(`try to copy dir ${path} -> ${outdir}`);
        await copy(p.resolve(path), outdir);
        return outdir;
    } else {
        debug(`try to copy file ${path} -> ${outdir}`);
        const dest = `${outdir}/${p.basename(path)}`;
        await copy(path, dest);
        return dest;
    }
}

async function resolveUrl(url: string, out: string) {
    if (url.match(/^https?:\/\//)) {
        debug(`resolve remote url: ${url}`);
        // remote
        return resolveRemoteFile(url, out);
    } else {
        debug(`resolve local file: ${url}`);
        // local
        return resolveLocalFile(url, out);
    }
}

export async function resolveArchive(name: string, resolvable: Resolvable, opts: { dryRun } = {dryRun: false}): Promise<string> {
    let out = await resolveModuleDir(name);
    await ensureDir(out);
    if (resolvable instanceof Function) {
        // promise func
        return await resolvable();
    } else {
        // url
        return await resolveUrl(resolvable, out);
    }
}

export type ResolvingModuleInfo = {
    runContext: UpkfileContext,
    moduleName: string,
};