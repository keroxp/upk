import * as http from "http";
import {RequestOptions} from "http";
import {parse} from "url";
import {createWriteStream} from "fs";
import {ensureDir} from "fs-extra";
import contentDisposition = require("content-disposition");
const debug = require("debug")("upk:download");
export async function download(urlLike: string, dest: string, headers = {}): Promise<string> {
    debug(`download: ${urlLike} -> ${dest}`);
    return new Promise<string>((resolve, reject) => {
        const parsed = parse(urlLike);
        let req: RequestOptions;
        req = Object.assign({}, parsed, {headers});
        http.get(req, async res => {
            if (res.statusCode === 200) {
                let filename = "downloaded";
                const condis = res.headers["content-disposition"];
                if (condis) {
                    filename = contentDisposition.parse(condis).parameters.filename;
                }
                const outpath = `${dest}/${filename}`;
                await ensureDir(dest);
                const out = createWriteStream(outpath);
                res.pipe(out);
                out.on("finish", () => {
                    debug("completed.");
                    resolve(outpath)
                });
                out.on("error", reject);
            } else {
                reject(new Error(`status code: ${res.statusCode}`));
            }
        }).on("error", reject);
    });
}