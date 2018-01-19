import {searchUpk, upk} from "../resolver/upk";
import {clearModuels} from "./utils";
import {Server} from "http";
import {start} from "./test-server";
import {zip} from "../resolver/zip";
import {exists} from "mz/fs";
import {resolveModuleDir} from "../module";

describe("upk", () => {
    let http: Server;
    beforeAll(async () => {
        http = (await start()).http;
    });
    beforeEach(async () => {
        await clearModuels();
    });
    it("tar読み込むとどうなるの", async () => {
        await upk("UniCommon", "./fixtures/UniCommon.unitypackage");
    });
    it("zipからのupk", async () => {
        await upk("UniCommon", async () => {
            const r = await zip("UniCommon", "http://localhost:8001/fixtures/unicommon.unitypackage.zip");
            return r.extractedPath;
        });
        expect(await exists(resolveModuleDir("unicommon/unicommon.unitypackage"))).toBe(true);
        expect(await exists(resolveModuleDir("unicommon"))).toBe(true);
    });
    it("unitypackageを含んだフォルダzipからのupk", async () => {
        await upk("UniCommonDir", async () => {
            const r = await zip("UniCommonDir", "http://localhost:8001/fixtures/unicommondir.zip", () => "UniCommon");
            return r.extractedPath;
        });
        expect(await exists(resolveModuleDir("unicommondir"))).toBe(true);
        expect(await exists(resolveModuleDir("unicommondir/unicommon/unicommon.unitypackage"))).toBe(true);
    });
    describe("searchUpk", async () => {
        test("file", async () => {
            await expect(searchUpk("fixtures/UniCommon.unitypackage")).resolves.toBeDefined();
        });
        test("dir", async () => {
            await expect(searchUpk("fixtures")).resolves.toBeDefined();
        });
        test("nested dir", async () => {
            await expect(searchUpk(("fixtures/dir"))).resolves.toBeDefined();
        });
        test("no dir", async () => {
            await expect(searchUpk(("dist"))).rejects.toBeDefined();
        })
    });
    afterAll((cb) => http.close(cb));
});