import {runAsset} from "../resolver/asset";
import {Resolvable, ResolvingModuleInfo} from "../resolver";
import {GitOptions, GitTag, runGit} from "../resolver/git";
import {runUpk} from "../resolver/upk";
import {BaseUpkfileContext, runInContext, UpkfileContext} from "./index";
import {DependencyTree, resolveModuleDir} from "../module";
import {PathResolver} from "../resolver/zip";
import github = require("parse-github-url");
import {ResolverContext} from "./resolver-context";
import {isString} from "util";
import * as path from "path";
const debug = require("debug")("upk:context:run");
export class RunContext extends BaseUpkfileContext implements UpkfileContext {

    constructor(upkfilePath: string, globalDependencies: DependencyTree) {
        super(upkfilePath, globalDependencies);
    }

    context(moduleName): ResolvingModuleInfo {
        return {moduleName, runContext: this};
    }
    async install(name: string, resolver: Promise<string>) {
        const res = await resolver;
        const orgdir = global["__originalDir"] || process.cwd();
        this.globalDependencies.modules[name].installedPath = path.relative(orgdir, res);
        return res;
    }
    async git (gitUrl: string, version?: GitTag, opts?: GitOptions) {
        const {name} = github(gitUrl);
        return this.install(name, this._git(gitUrl, version, opts));
    }
    async _git (gitUrl: string, version?: GitTag, opts?: GitOptions) {
        const {name} = github(gitUrl);
        if (!this.globalDependencies.modules[name].shouldUpdate)
            return resolveModuleDir(name);
        debug(`git ${gitUrl}, ${version}, ${opts}`);
        const {lockedVersion} = this.globalDependencies.modules[name];
        return runGit(this.context(name), gitUrl, lockedVersion || version, opts);
    }
    zip (url: string, pathResolver: PathResolver): Promise<string> {
        throw new Error("zip is not allowed within root context.");
    }
    async upk (name: string, resolver: Resolvable) {
        return this.install(name, this._upk(name, resolver));
    }
    async _upk (name: string, resolver: Resolvable) {
        if (!this.globalDependencies.modules[name].shouldUpdate)
            return resolveModuleDir(name);
        debug(`upk ${name}, ${resolver.toString()}`);
        if (isString(resolver)) {
            return runUpk(name, resolver);
        } else {
            const resolved = await runInContext(new ResolverContext("upk", this.context(name)), resolver);
            return runUpk(name, resolved);
        }
    }
    async asset (name: string, resolver: Resolvable) {
        return this.install(name, this._asset(name, resolver));
    }
    async _asset (name: string, resolver: Resolvable) {
        if (!this.globalDependencies.modules[name].shouldUpdate)
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