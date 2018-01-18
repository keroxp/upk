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
        const result = await runGit(this.context, gitUrl, version, opts);
        const module = this.globalDependencies.modules[this.context.moduleName];
        module.integrity = result.fileIntegrity;
        module.resolvedUri = gitUrl;
        return result.extractedPath;
    }
    async zip (url: string, pathResolver: PathResolver) {
        debug(`zip ${url}, ${(pathResolver || "").toString()}`);
        const result = await runZip(this.context.moduleName, url, pathResolver);
        const module = this.globalDependencies.modules[this.context.moduleName];
        const {integrity, resolvedUri} = module;
        if (integrity && integrity !== result.fileIntegrity) {
            throw new Error(`[${this.context.moduleName}] Subresource Integrity Violation found.
                resolved URI: ${resolvedUri}\n
                locked integrity: ${integrity}\n
                resolved integrity: ${integrity}
            `);
        }
        module.resolvedUri = url;
        module.integrity = integrity;
        return result.extractedPath;
    }
    upk (name: string, resolver: Resolvable): Promise<string> {
        throw new Error(`upk is not allowed within "${this.type}"`);
    }
    asset (name: string, resolver: Resolvable): Promise<string> {
        throw new Error(`asset is not allowed within "${this.type}"`);
    }
}