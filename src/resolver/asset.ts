import {Resolvable, resolveArchive, ResolvingModuleInfo} from "./index";

export async function runAsset(name: string, urlOrPromise: Resolvable): Promise<string> {
    return resolveArchive(name, urlOrPromise);
}