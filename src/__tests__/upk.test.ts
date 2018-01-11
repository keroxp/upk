import {upk} from "../upk";

describe("upk", () => {
    test("tar読み込むとどうなるの", async () => {
        await upk("UniCommon", "./fixtures/UniCommon.unitypackage");
    });
});