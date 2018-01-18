import {basename, resolve} from "path";
import {download} from "../download";
import {copy, stat} from "fs-extra";
import {resolveModuleDir} from "../module";
import {UpkfileContext} from "../context";

export type Resolvable = string | (() => Promise<string|RemoteFileResolveResult>);
export type RemoteFileResolveResult = {
    extractedPath: string,
    fileIntegrity: string
}
async function resolveRemoteFile(url: string, out: string) {
    return await download(url, out);
}

async function resolveLocalFile(path: string, outdir: string) {
    // local
    if ((await stat(path)).isDirectory()) {
        await copy(resolve(path), outdir);
        return outdir;
    } else {
        const filename = basename(path);
        outdir += `/${filename}`;
        await copy(resolve(path), outdir);
        return outdir;
    }
}

async function resolveUrl(url: string, out: string) {
    if (url.match(/^https?:\/\//)) {
        // remote
        return resolveRemoteFile(url, out);
    } else {
        // local
        return resolveLocalFile(url, out);
    }
}

export async function resolveArchive(name: string, resolvable: Resolvable, opts: {dryRun} = {dryRun: false}): Promise<string|RemoteFileResolveResult> {
    let out = await resolveModuleDir(name);
    if (resolvable instanceof Function) {
        // promise func
        return await resolvable();
    } else {
        // url
        return await resolveUrl(resolvable, out);
    }
}

export type Submodule = {
    modulePath: string,
    upkPath: string
}


export type ResolvingModuleInfo = {
    runContext: UpkfileContext,
    moduleName: string,
};