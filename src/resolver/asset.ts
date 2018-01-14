import {Resolvable, resolveArchive} from "./index";
import {DependencyTree} from "../module";

export async function dryRunAsset(dtree: DependencyTree, name: string, urlOrPromise: Resolvable) {
    if (dtree.modules[name]) {
        throw new Error("duplicated dependencies: "+name);
    }
    dtree.modules[name] = {
        name, type: "asset"
    }
}
export async function asset(name: string, urlOrPromise: Resolvable) {
    return resolveArchive(name, urlOrPromise);
}