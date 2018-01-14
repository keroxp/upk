import {git} from "../resolver/git";
import {exists} from "mz/fs";

describe("git", () => {
    it("git cloneしたらどうなるの", async () => {
        await git("keroxp/unicommon");
        expect(await exists("./upi-modules/unicommon")).toBe(true);
    });
});