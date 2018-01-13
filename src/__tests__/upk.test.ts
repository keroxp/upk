import {upk} from "../upk";
import {clearModuels} from "./utils";
import {Server} from "http";
import {start} from "./test-server";
import {zip} from "../zip";
import {exists} from "mz/fs";
import {resolveModuleDir} from "../module";

describe("upk", () => {
    let http: Server;
    beforeAll(async () => {
        http = (await start()).http;
        await clearModuels();
    });
    test("tar読み込むとどうなるの", async () => {
        await upk("UniCommon", "./fixtures/UniCommon.unitypackage");
    });
    test("zipからのupk", async () => {
        await upk("UniCommon", zip("UniCommon", "http://localhost:8001/fixtures/unicommon.unitypackage.zip"));
        expect(await exists(resolveModuleDir("unicommon/unicommon.unitypackage"))).toBe(true);
        expect(await exists(resolveModuleDir("unicommon"))).toBe(true);
    });
    test("unitypackageを含んだフォルダzipからのupk", async () => {
        await upk("UniCommonDir", zip("UniCommonDir", "http://localhost:8001/fixtures/unicommondir.zip"));
        expect(await exists(resolveModuleDir("unicommondir"))).toBe(true);
        expect(await exists(resolveModuleDir("unicommondir/unicommon.unitypackage"))).toBe(true);
    });

    afterAll((cb) => http.close(cb));
});