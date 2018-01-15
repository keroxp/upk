import {dryRun, run} from "../../command/install";
import {createDependencyTree, DependencyTree} from "../../module";

describe("command/install", () => {
    let dependencies: DependencyTree;
    beforeEach(() => {
        dependencies = createDependencyTree();
    });
    describe("dryrun", () => {
        it("git without version", async () => {
            const s = `git "keroxp/unicommon"`;
            await dryRun(s,"dummy", dependencies);
        });
    });
});