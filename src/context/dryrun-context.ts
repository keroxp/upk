import {currentRef, GitOptions, GitTag} from "../resolver/git";
import {Resolvable} from "../resolver";
import {
    createDependencyTree, DependencyTree, resolveModuleDir,
    ResolverType
} from "../module";
import {UpkfileContext} from "./index";
import {PathProvider} from "../resolver/zip";
import github = require("parse-github-url");
import {exists} from "mz/fs";
import {isVersionRange, isVersionString, parseVersion, resolveVersionRange} from "../version";
const debug = require("debug")("upk:context:dryrun");
export class DryRunContext implements UpkfileContext {
    dependencies: DependencyTree;
    constructor(private upkfilePath: string, private globalDependencies: DependencyTree) {
        this.dependencies = createDependencyTree();
    }
    checkDuplication(type: ResolverType, name: string, version?: GitTag) {
        if (this.dependencies.modules[name]) {
            throw new Error(`duplicated ${type} dependency for ${name} in ${this.upkfilePath}`);
        }
        this.globalDependencies.modules[name] = this.dependencies.modules[name] = {
            name, type, version
        };
        return resolveModuleDir(name);
    }
    async git (gitUrl: string, version?: GitTag, opts?: GitOptions) {
        const {name} = github(gitUrl);
        const gitdir = resolveModuleDir(name);
        if (await exists(gitdir)) {
            debug(`git module "${name} already installed. checking version change."`);
            const ref = await currentRef(gitdir);
            const lockedRange = this.globalDependencies[name].version;
            const lockedVersion = this.globalDependencies[name].lockedVersion;
            if (ref !== lockedVersion) {
                throw new Error(`unlocked git reference: locked: ${lockedVersion}, actual: ${ref}`);
            }
            if (isVersionRange(lockedRange) && isVersionString(version)) {
                const nextRange = resolveVersionRange(version);
                const intersection = lockedRange.intersection(nextRange);
                if (intersection) {
                    // update version
                    this.globalDependencies.modules[name].version = intersection;
                } else {
                    throw new Error("cannot resolve")
                }
            } else if (lockedVersion) {
                // checkout

            } else {
                // no version
            }
        }
        return this.checkDuplication("git", name);
    }
    async zip (url: string, pathResolver: PathProvider) {
        return void 0;
    }
    async upk (name: string, resolver: Resolvable) {
        return this.checkDuplication("upk", name);
    }
    async asset (name: string, resolver: Resolvable) {
        return this.checkDuplication("asset", name);
    }
}