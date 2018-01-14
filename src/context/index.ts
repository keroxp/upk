import {GitOptions, GitTag} from "../resolver/git";
import {Resolvable} from "../resolver";
import {PathProvider} from "../resolver/zip";

export type GitResolver = (gitUrl: string, version?: GitTag, otps?: GitOptions) => Promise<string>;
export type AssetResolver = (name: string, resolver: Resolvable) => Promise<string>;
export type ZipResolver = (url: string, pathResolver: PathProvider) => Promise<string>;
export type UpkResolver = (name: string, resolver: Resolvable) => Promise<string>;

export interface UpkfileContext {
    git: GitResolver,
    asset: AssetResolver,
    zip: ZipResolver,
    upk: UpkResolver
}
export async function runInContext<T>(context: UpkfileContext, action: () => Promise<T>): Promise<T> {
    global["git"] = context.git.bind(context);
    global["asset"] = context.asset.bind(context);
    global["zip"] = context.zip.bind(context);
    global["upk"] = context.upk.bind(context);
    return action();
}