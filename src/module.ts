import p = require("path");
import {Version, VersionRange} from "./version";
import {GitTag} from "./resolver/git";

const moduleDir = "UpkModules";
export function resolveModuleDir(path: string = ".") {
    return p.resolve(moduleDir, path);
}
export type ResolverType = "git" | "asset" | "upk" | "zip";
export type DependencyInfo = {
    name: string,
    type: ResolverType
    version?: GitTag | VersionRange,
    lockedVersion?: GitTag | Version
    dependencies?: DependencyTree
}
export const DependencyTreeFormatVersion = "1.0.0";
export type DependencyTree = {
    formatVersion: string,
    modules: {[name: string]: DependencyInfo }
}
export function createDependencyTree(modules: {[name: string]: DependencyInfo} = {}): DependencyTree {
    return {formatVersion: DependencyTreeFormatVersion, modules}
}