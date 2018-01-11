import {get} from "http";
import {createReadStream, createWriteStream} from "fs";
import {basename} from "path";
import * as unzip from "unzip"

async function download(url, dest): Promise<string> {
    const fname = basename(url);
    const destpath = `${dest}/${fname}`;
    return new Promise<string>((resolve, reject) => {
        const dest = createWriteStream(destpath);
        get(url.parse(url), res => {
            res.pipe(dest);
            res.on("error", reject);
            res.on("end", () => resolve(destpath));
        });
    });
}

export async function zip(name, url, opts): Promise<string> {
    const downloadedPath = await download(url, `./upi-modules/${name}`);
    const dest = `./upi-modules/${name}`;
    await new Promise((resolve, reject) => {
        const extr = unzip.Extract({path: dest});
        extr.on("end", resolve);
        extr.on("error", reject);
        createReadStream(downloadedPath).pipe(extr);
    });
    return dest;
}