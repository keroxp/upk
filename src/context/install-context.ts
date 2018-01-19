import {BaseUpkfileContext} from "./index";
import {PathResolver} from "../resolver/zip";
import {AssetInstllationOptions, installAssets, Resolvable} from "../resolver";
import {GitTag, parseGitUrl} from "../resolver/git";
import {extractUpk, searchUpk} from "../resolver/upk";
import {DependencyTree, resolveModuleDir} from "../module";
const debug = require("debug")("upk:context:install");
export class InstallContext extends BaseUpkfileContext {

    constructor(upkfilePath: string, globalDependencies: DependencyTree) {
        super(upkfilePath, globalDependencies);
    }

    zip(url: string, pathResolver: PathResolver) {
        return async () => "";
    }

    upk(name: string, resolver: Resolvable) {
        return async () => {
            let file = this.globalDependencies.modules[name].extractedPath;
            const upk = await searchUpk(file);
            debug(`${name}: upk ${upk}`);
            return await extractUpk(upk);
        };
    }

    git(gitUrl: string, version?: GitTag, opts?: AssetInstllationOptions) {
        return async () => {
            const {name} = parseGitUrl(gitUrl);
            debug(`${name}: git`);
            const dir = this.globalDependencies.modules[name].extractedPath;
            return installAssets(dir, opts);
        };
    }

    asset(name: string, resolver: Resolvable, opts?: AssetInstllationOptions) {
        return async () =>{
            debug(`${name}: asset`);
            const {extractedPath} = this.globalDependencies.modules[name];
            return installAssets(extractedPath, opts);
        };
    }
}