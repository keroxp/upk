import * as http from "http";
import * as url from "url";
import {createWriteStream} from "fs";
import {ensureDir} from "fs-extra";

export async function download(urlLike: string, dest: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        http.get(url.parse(urlLike), async res => {
            const regex = /filename="(.*)"/gi;
            const contentDisposition = res.headers["content-disposition"];
            const fileName = regex.exec(contentDisposition)[1];
            const outpath = `${dest}/${fileName}`;
            await ensureDir(dest);
            const out = createWriteStream(outpath);
            res.pipe(out);
            res.on("end", () => resolve(outpath));
            res.on("error", reject);
        });
    });
}