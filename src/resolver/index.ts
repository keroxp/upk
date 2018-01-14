import {basename, resolve} from "path";
import {download} from "../download";
import {copy, stat} from "fs-extra";
import {DependencyTree, resolveModuleDir} from "../module";
import Global = NodeJS.Global;

export type Resolvable = string | (() => Promise<string>);

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

export async function resolveArchive(name: string, resolvable: Resolvable, opts: {dryRun} = {dryRun: false}): Promise<string> {
    let out = await resolveModuleDir(name);
    if (resolvable instanceof Function) {
        const ctx = resolvingContext({name, dryRun: opts.dryRun});
        return await resolvable.call(ctx);
    } else {
        // url
        return await resolveUrl(resolvable, out);
    }
}

export type ResolvableProvider = (context: ResolvingContext) => (...args) => Resolvable;

export type ResolvingContext = {
    moduleName: string,
    dependencies: DependencyTree,
    dryRun: boolean
} & Global;

export function resolvingContext({name, dryRun}): ResolvingContext {
    return Object.assign(this, {
        moduleName: name, dryRun
    });
}