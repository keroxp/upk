import {start} from "./test-server";
import {Server} from "http";
import {zip} from "../zip";
import {exists} from "mz/fs";
import {clearModuels} from "./utils";
import {resolveModuleDir} from "../module";

describe("zip", () => {
    let http: Server;
    beforeAll(async () => {
        await clearModuels();
        http = (await start()).http;
    });
    test("zipダウンロードしてみる", async () => {
       await zip("UniCommon", "http://localhost:8001/fixtures/unicommon.zip");
       expect(await exists(resolveModuleDir("unicommon"))).toBe(true);
    });
    afterAll((cb) => {
        http.close(cb);
    });
});