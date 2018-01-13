import * as http from "http";
import {RequestOptions} from "http";
import {parse} from "url";
import {createWriteStream} from "fs";
import {ensureDir} from "fs-extra";

export async function download(urlLike: string, dest: string, headers = {}): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const parsed = parse(urlLike);
        let req: RequestOptions;
        req = Object.assign({}, parsed, {headers});
        http.get(req, async res => {
            const regex = /filename="(.*)"/gi;
            if (res.statusCode === 200) {
                const contentDisposition = res.headers["content-disposition"];
                const fileName = regex.exec(contentDisposition)[1];
                const outpath = `${dest}/${fileName}`;
                await ensureDir(dest);
                const out = createWriteStream(outpath);
                res.pipe(out);
                out.on("finish", () => resolve(outpath));
                out.on("error", reject);
            } else {
                reject(new Error(`status code: ${res.statusCode}`));
            }
        }).on("error", reject);
    });
}