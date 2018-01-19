import * as tar from "tar"
import {createReadStream} from "fs";
import {Resolvable, resolveArchive} from "./index";
import {exists} from "mz/fs";
import {ensureDir, move, readFile, remove, stat} from "fs-extra";
import * as path from "path";
import glob = require("glob-promise");
import Debug = require("debug");
const debug = Debug("upk:upk");


export type UpkOptions = {}
export const upk = runUpk;

export async function searchUpk(file: string): Promise<string> {
    // glob resolved module root and depth1
    if ((await stat(file)).isDirectory()) {
        const pkgs = await glob(`${file}/{,*/}*.unitypackage`);
        if (pkgs.length == 0) {
            throw new Error(`no .unitypackage within ${file}`);
        } else if (pkgs.length > 1) {
            throw new Error(`multiple .unitypackage files found. choose one. ${pkgs}`);
        }
        return pkgs[0];
    } else if (path.extname(file) === ".unitypackage"){
        return file;
    }
    throw new Error(`file: ${file} doesn't seem to be .unitypackage.`);
}

export async function runUpk(name: string, urlOrResolver: Resolvable, opts?: UpkOptions): Promise<string> {
    let extractedPath = await resolveArchive(name, urlOrResolver);
    if (await !exists(extractedPath)) {
        throw new Error(`no file: ${extractedPath}`);
    }
    debug(`[${name}] unitypackage has been extracted: ${extractedPath}`);
    let pkgPath = extractedPath;
    if ((await stat(extractedPath)).isDirectory()) {
        pkgPath = await searchUpk(extractedPath);
    }
    return pkgPath;
}

export async function extractUpk(file: string) {
    return new Promise<string>(async (resolve, reject) => {
        const dir = path.dirname(file);
        const out = `${dir}/extracted`;
        await ensureDir(out);
        debug(file, dir);
        createReadStream(file)
            .pipe(tar.x({C: out}))
            .on("error", reject)
            .on("end", async () => {
                const assets = await glob(`${out}/*`);
                debug(assets);
                for (const guid of assets) {
                    if (!(await stat(guid)).isDirectory()) continue;
                    const pathname = path.resolve(guid, "pathname");
                    const assetPath = String(await readFile(pathname));
                    const asset = path.resolve(guid, "asset");
                    const assetMeta = path.resolve(guid, "asset.meta");
                    const assetDest = path.resolve(assetPath);
                    debug(`Extracted: ${assetPath}`);
                    if ((await exists(asset))) {
                        // asset
                        await ensureDir(path.dirname(assetDest));
                        await move(asset, assetDest, {
                            overwrite: true
                        });
                        await move(assetMeta, assetDest + ".meta", {
                            overwrite: true
                        });
                    } else if (await exists(path.resolve(guid, "asset.meta"))) {
                        // directory
                        await ensureDir(path.dirname(assetDest));
                        await move(assetMeta, assetDest + ".meta", {
                            overwrite: true
                        });
                    } else if (await exists(assetPath)) {
                        // root
                        await ensureDir(assetDest);
                    }
                }
                //await remove(out);
                resolve();
            });
    });
}