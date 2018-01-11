import {isFunction, isString} from "util"
import * as tar from "tar"
import {createReadStream} from "fs";
import * as _glob from "glob";
import {resolveArchive} from "./archive-resolver";
import {exists} from "mz/fs";
import {ensureDir, move, readFile, remove, stat} from "fs-extra";
import * as path from "path";

export interface UpkHolder  {
    upkFile(): string;
}

export type UpkResolver = () => Promise<string>;
async function glob(pattern, opts?): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        _glob(pattern, opts, (err, files) => {
            err ? reject(err) : resolve(files);
        });
    });
}
export async function upk(name: string, urlOrResolver: string | UpkResolver, opts?) {
    let extractedPath: string;
    if (isString(urlOrResolver)) {
        extractedPath = await resolveArchive(name, urlOrResolver);
    } else if (isFunction(urlOrResolver)) {
        extractedPath = await resolveArchive(name, await urlOrResolver());
    }
    if (await !exists(extractedPath)) {
        throw new Error(`no file: ${extractedPath}`);
    }
    if ((await stat(extractedPath)).isDirectory()) {
        // directyry path that contains at least 1 .unitypackage file
        const pkgs = await glob(`${extractedPath}/*.unitypackage`);
        if (pkgs.length == 0) {
            throw new Error("no .unitypackage");
        } else if (pkgs.length > 1) {
            throw new Error(`there are ${pkgs.length} .unitypackage files. chose one`);
        }
        const pkg = pkgs[0];
        await extractUpk(pkg)
    } else {
        // .unitypackage file
        await extractUpk(extractedPath);
    }
}

async function extractUpk(file) {
    return new Promise(async (resolve, reject) => {
        const {dir} = path.parse(file);
        const out = `${dir}/extracted`;
        await ensureDir(out);
        createReadStream(file)
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
                    const assetDest = path.resolve(dir, assetPath);
                    console.log(`Extracted: ${assetPath}`);
                    if ((await exists(asset))) {
                        // asset
                        await ensureDir(path.parse(assetDest).dir);
                        await move(asset, assetDest);
                        await move(assetMeta, assetDest+".meta");
                    } else if (await exists(path.resolve(guid,"asset.meta"))) {
                        // directory
                        await ensureDir(assetPath);
                        await move(assetMeta, assetDest+".meta");
                    } else if (await exists(assetPath)){
                        // root
                        await ensureDir(assetDest);
                    }
                }
                await remove(out);
                resolve();
            });
    });
}