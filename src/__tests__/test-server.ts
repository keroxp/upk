import express = require("express");
import contentDisposition = require("content-disposition");
import servStatic = require("serve-static");

import {Server} from "http";
import {resolve} from "path";

export async function start(port: number = 8001) {
    const app = express();
    const http = new Server(app);
    const fixpath = `${__dirname}/../../fixtures`;
    app.use("/fixtures", servStatic(fixpath, {
        "index": false,
        "setHeaders": (res, path) => {
            res.setHeader('Content-Disposition', contentDisposition(path));
        }
    }));
    await new Promise((resolve, reject) => {
        http.listen(port, err => err ? reject(err) : resolve());
    });
    return {app, http}
}
export async function withServer(port, callback: () => Promise<any>) {
    const {app, http} = await start(port);
    try {
        await callback();
    } finally {
        await new Promise((resolve, reject) => {
            http.close(err => err ? reject(resolve): resolve())
        });
    }
}
