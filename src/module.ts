import p = require("path");
import {createVersion, VersionRange} from "./version";
import {GitTag} from "./resolver/git";
const moduleDir = "UpkModules";
export function resolveModuleDir(path: string = ".") {
    return p.resolve(moduleDir, path);
}
export type DependencyInfo = {
    name: string,
    type: "git" | "asset" | "upk" | "zip"
    version?: GitTag | VersionRange,
    lockedVersion?: GitTag | createVersion
    dependencies?: DependencyTree
}
export type DependencyTree = {
    modules: {[name: string]: DependencyInfo }
}