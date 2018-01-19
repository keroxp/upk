import {currentCommit, GitOptions, GitTag, runGit} from "../resolver/git";
import {AssetInstllationOptions, Resolvable, ResolvingModuleInfo} from "../resolver";
import {PathResolver, runZip} from "../resolver/zip";
import {BaseUpkfileContext, UpkfileContext} from "./index";
import {calculateFileIntegrity} from "../integrity";
const p = require("path");
const debug = require("debug")("upk:context:resolver");

export class ResolverContext extends BaseUpkfileContext {
    constructor(private type: string, private context: ResolvingModuleInfo) {
        super(type, context.runContext.globalDependencies);
    }

    git(gitUrl: string, version?: GitTag, opts?: AssetInstllationOptions) {
        return async () => {
            debug(`git ${gitUrl}, ${version}, ${opts}`);
            const result = await runGit(this.context, gitUrl, version);
            const module = this.globalDependencies.modules[this.context.moduleName];
            module.integrity = "git-" + await currentCommit(result);
            module.resolvedUri = gitUrl;
            return result;
        }
    }

    zip(url: string, pathResolver?: PathResolver) {
        return async () => {
            debug(`zip ${url}, ${(pathResolver || "").toString()}`);
            const result = await runZip(this.context.moduleName, url);
            const newIntegrity = "sha512-"+await calculateFileIntegrity(result.downloadedFile);
            const module = this.globalDependencies.modules[this.context.moduleName];
            const {integrity, resolvedUri} = module;
            if (integrity && integrity !== newIntegrity) {
                throw new Error(`[${this.context.moduleName}] Subresource Integrity Violation found.
                resolved URI: ${resolvedUri}\n
                locked integrity: ${integrity}\n
                resolved integrity: ${newIntegrity}
            `);
            }
            module.resolvedUri = url;
            module.integrity = newIntegrity;
            return result.extractedPath;
        }
    }

    upk(name: string, resolver: Resolvable): () => Promise<string> {
        throw new Error(`upk is not allowed within "${this.type}"`);
    }

    asset(name: string, resolver: Resolvable): () => Promise<string> {
        throw new Error(`asset is not allowed within "${this.type}"`);
    }
}