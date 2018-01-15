import {GitOptions, GitTag} from "../resolver/git";
import {Resolvable} from "../resolver";
import {PathResolver} from "../resolver/zip";
import {createDependencyTree, DependencyTree} from "../module";
import {pick, extend} from "lodash";
export type ResolverProvider = Promise<string>
export type GitResolver = (gitUrl: string, version?: GitTag, otps?: GitOptions) => ResolverProvider;
export type AssetResolver = (name: string, resolver: Resolvable) => ResolverProvider;
export type ZipResolver = (url: string, pathResolver: PathResolver) => ResolverProvider;
export type UpkResolver = (name: string, resolver: Resolvable) => ResolverProvider;

const debug = require("debug")("upk:context:index");
export interface UpkfileContext {
    globalDependencies: DependencyTree,
    localDependencies: DependencyTree,
    git: GitResolver,
    asset: AssetResolver,
    zip: ZipResolver,
    upk: UpkResolver,
}
export abstract class BaseUpkfileContext implements UpkfileContext {
    public readonly localDependencies: DependencyTree;
    constructor(public readonly upkfilePath: string, public readonly globalDependencies: DependencyTree) {
        this.localDependencies = createDependencyTree();
    }
    abstract zip(url: string, pathResolver: PathResolver);
    abstract upk(name: string, resolver: Resolvable);
    abstract git(gitUrl: string, version?: GitTag, opts?: GitOptions);
    abstract asset(name:string, resolver: Resolvable);
}
export async function runInContext<T>(context: UpkfileContext, action: () => Promise<T>): Promise<T> {
    const keys = ["git", "asset", "zip", "upk"];
    const tmp = pick(global, keys);
    debug(`push context: ${context}`);
    // make all root async resolver functions sync
    for (const key of keys) {
        global[key] = (...args) => {
            return () => {
                return context[key].call(context, ...args);
            }
        }
    }
    debug(pick(global, keys));
    const result = await action();
    extend(global, tmp);
    debug(`pop context: ${context}`);
    return result;
}