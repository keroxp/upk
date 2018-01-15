import {git, isGitDir} from "../resolver/git";
import {exists} from "mz/fs";

describe("git", () => {
    test("git cloneしたらどうなるの", async () => {
        await git("keroxp/unicommon");
        expect(await exists("./upi-modules/unicommon")).toBe(true);
    });
    describe("isGitDir", () => {
        test(".", async () => {
            expect(await isGitDir(".")).toBe(true);
            expect(await isGitDir("src")).toBe(false);
            expect(await isGitDir("nothing")).toBe(false);
        });
    })
});