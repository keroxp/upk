import * as tar from "tar"
import {createReadStream} from "fs";
import {RemoteFileResolveResult, Resolvable, resolveArchive} from "./index";
import {exists} from "mz/fs";
import {ensureDir, move, readFile, remove, stat} from "fs-extra";
import * as path from "path";
import {resolveModuleDir} from "../module";
import {createHash} from "crypto";
import {isString} from "util";
import glob = require("glob-promise");
import Debug = require("debug");

const debug = Debug("upk:upk");


export type UpkOptions = {}
export const upk = runUpk;

export async function runUpk(name: string, urlOrResolver: Resolvable, opts?: UpkOptions): Promise<RemoteFileResolveResult> {
    let extractedPath = await resolveArchive(name, urlOrResolver);
    if (!(isString(extractedPath))) {
        extractedPath = extractedPath.extractedPath;
    }
    if (await !exists(extractedPath)) {
        throw new Error(`no file: ${extractedPath}`);
    }
    debug(`[${name}] unitypackage has been extracted: ${extractedPath}`);
    let pkgPath = extractedPath;
    if ((await stat(extractedPath)).isDirectory()) {
        // glob resolved module root and depth1
        const pkgs = await glob(`${extractedPath}/{,*/}*.unitypackage`);
        if (pkgs.length == 0) {
            throw new Error(`no .unitypackage within ${extractedPath}`);
        } else if (pkgs.length > 1) {
            throw new Error(`multiple .unitypackage files found. choose one. ${pkgs}`);
        }
        pkgPath = pkgs[0];
    }
    const integrity = await extractUpk(pkgPath);
    return {
        fileIntegrity: integrity,
        extractedPath: resolveModuleDir(name)
    }
}

async function extractUpk(file): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
        const {dir} = path.parse(file);
        const out = `${dir}/extracted`;
        await ensureDir(out);
        const hasher = createHash("sha512");
        createReadStream(file)
            .on("data", hasher.update)
            .pipe(tar.x({
                strip: 1,
                C: out
            }))
            .on("error", reject)
            .on("end", async () => {
                const assets = await glob(`${out}/*`);
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
                await remove(out);
                resolve("sha512-"+hasher.digest("hex"));
            });
    });
}