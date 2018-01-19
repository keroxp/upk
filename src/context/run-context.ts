import {runAsset} from "../resolver/asset";
import {AssetInstllationOptions, Resolvable, ResolvingModuleInfo} from "../resolver";
import {currentCommit, git, GitOptions, GitTag, runGit} from "../resolver/git";
import {runUpk} from "../resolver/upk";
import {BaseUpkfileContext, runInContext, UpkfileContext} from "./index";
import {DependencyTree, resolveModuleDir} from "../module";
import {PathResolver} from "../resolver/zip";
import github = require("parse-github-url");
import {ResolverContext} from "./resolver-context";
import {isString} from "util";
import * as path from "path";
import {calculateFileIntegrity} from "../integrity";
const debug = require("debug")("upk:context:run");
export class RunContext extends BaseUpkfileContext {

    constructor(upkfilePath: string, globalDependencies: DependencyTree) {
        super(upkfilePath, globalDependencies);
    }

    context(moduleName): ResolvingModuleInfo {
        return {moduleName, runContext: this};
    }
    async install(name: string, resolver: Promise<string>) {
        const res = await resolver;
        const orgdir = global["__originalDir"] || process.cwd();
        this.globalDependencies.modules[name].extractedPath = path.relative(orgdir, res);
        return res;
    }
    git (gitUrl: string, version?: GitTag, opts?: AssetInstllationOptions) {
        return async () => {
            const {name} = github(gitUrl);
            return this.install(name, this._git(gitUrl, version, opts));
        }
    }
    async _git (gitUrl: string, version?: GitTag, opts?: AssetInstllationOptions) {
        const {name} = github(gitUrl);
        if (!this.globalDependencies.updateFlags[name])
            return resolveModuleDir(name);
        debug(`git ${gitUrl}, ${version}, ${opts}`);
        const {lockedVersion} = this.globalDependencies.modules[name];
        const module = this.globalDependencies.modules[name];
        module.integrity = "git-"+await currentCommit(resolveModuleDir(name));
        return runGit(this.context(name), gitUrl, lockedVersion || version);
    }
    zip (url: string, pathResolver: PathResolver): () => Promise<string> {
        throw new Error("zip is not allowed within root context.");
    }
    upk (name: string, resolver: Resolvable) {
        return () => this.install(name, this._upk(name, resolver));
    }
    async _upk (name: string, resolver: Resolvable) {
        if (!this.globalDependencies.updateFlags[name])
            return resolveModuleDir(name);
        debug(`upk ${name}, ${resolver.toString()}`);
        if (isString(resolver)) {
            return runUpk(name, resolver);
        } else {
            const resolved = await runInContext(new ResolverContext("upk", this.context(name)), resolver);
            return runUpk(name, resolved);
        }
    }
    asset (name: string, resolver: Resolvable) {
        return () => this.install(name, this._asset(name, resolver));
    }
    async _asset (name: string, resolver: Resolvable) {
        if (!this.globalDependencies.updateFlags[name])
            return resolveModuleDir(name);
        debug(`asset ${name}, ${resolver.toString()}`);
        if (isString(resolver)) {
            return runAsset(name, resolver)
        } else {
            const resolved = await runInContext(new ResolverContext("asset", this.context(name)), resolver);
            return runAsset(name, resolved);
        }
    }
}