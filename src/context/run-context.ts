import {runAsset} from "../resolver/asset";
import {Resolvable, ResolvingModuleInfo} from "../resolver";
import {GitOptions, GitTag, runGit} from "../resolver/git";
import {runUpk} from "../resolver/upk";
import {runInContext, UpkfileContext} from "./index";
import {DependencyTree} from "../module";
import {PathProvider} from "../resolver/zip";
import github = require("parse-github-url");
import {ResolverContext} from "./resolver-context";
export class RunContext implements UpkfileContext {
    constructor(private upkfilePath: string, private globalDependencies: DependencyTree) {
    }
    context(moduleName): ResolvingModuleInfo {
        return {moduleName, runContext: this};
    }
    async git (gitUrl: string, version?: GitTag, opts?: GitOptions) {
        const {name} = github(gitUrl);
        return runGit(this.context(name), gitUrl, version, opts);
    }
    zip (url: string, pathResolver: PathProvider): Promise<string> {
        throw new Error("zip is not allowed within root context.");
    }
    async upk (name: string, resolver: Resolvable) {
        if (resolver instanceof String) {
            return runUpk(name, resolver);
        } else {
            return runInContext(new ResolverContext("upk", this.context(name)), resolver);
        }
    }
    async asset (name: string, resolver: Resolvable) {
        if (resolver instanceof String) {
            return runAsset(name, resolver)
        } else {
            return runInContext(new ResolverContext("asset", this.context(name)), resolver);
        }
    }
}