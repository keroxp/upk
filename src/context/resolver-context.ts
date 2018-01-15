import {GitOptions, GitTag, runGit} from "../resolver/git";
import {Resolvable, ResolvingModuleInfo} from "../resolver";
import {PathResolver, runZip} from "../resolver/zip";
import {BaseUpkfileContext, UpkfileContext} from "./index";
const debug = require("debug")("upk:context:resolver");
export class ResolverContext extends BaseUpkfileContext implements UpkfileContext {
    constructor(private type: string, private context: ResolvingModuleInfo) {
        super(type, context.runContext.globalDependencies);
    }
    async git (gitUrl: string, version?: GitTag, opts?: GitOptions) {
        debug(`git ${gitUrl}, ${version}, ${opts}`);
        return runGit(this.context, gitUrl, version, opts);
    }
    async zip (url: string, pathResolver: PathResolver) {
        debug(`zip ${url}, ${(pathResolver || "").toString()}`);
        return runZip(this.context.moduleName, url, pathResolver);
    }
    upk (name: string, resolver: Resolvable): Promise<string> {
        throw new Error(`upk is not allowed within "${this.type}"`);
    }
    asset (name: string, resolver: Resolvable): Promise<string> {
        throw new Error(`asset is not allowed within "${this.type}"`);
    }
}