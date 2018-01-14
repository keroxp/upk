import {exec} from "child-process-promise";
import gh = require("parse-github-url");
import {isObject, isString} from "util";
import {DependencyTree, resolveModuleDir} from "../module";
import {
    isVersion, isVersionRange, isVersionString, resolveVersionRange, createVersion, VersionList,
    parseVersion, createVersionList
} from "../version";
import compareVersions = require("compare-versions")
import {ResolvingContext} from "./index";

function isGithubUrl (urlLike: string) {
    return !!(urlLike.match(/^(.+)?\/(.+)$/))
}

export type GitTag = string;
export type GitOptions = {}
function isGitOptions(a): a is GitOptions {
    return isObject(a);
}
export function gitResolver(context: ResolvingContext) {
    if (context.dryRun) {
        return (...args) => dryRunGit.call(this, context, ...args);
    } else {
        return (...args) => runGit.call(this, context, ...args);
    }
}
export function resoveGit(url, version?: GitTag, opts?: GitOptions): () => Promise<string> {
    return async () => git(url, version, opts);
}
async function lsRemote(gitUrl: string): Promise<VersionList> {
    const result = (await exec(`git ls-remote -t ${gitUrl}`)).stdout as string;
    const versions = result.split("\n").map(ln => ln.split("\t")[1]);
    return createVersionList(...versions);
}

async function clone(gitUrl: string, version?: GitTag, opts?: GitOptions) {
    const gitComps = gh(gitUrl);
    let {name, host, path, protocol} = gitComps;
    if (!protocol && gitComps.host === "github.com") {
        protocol = "https";
    }
    const url = `${protocol}://${host}/${path}`;
    if (!protocol || !host || !path || !name) {
        throw new Error(`invalid git url: ${url}`);
    }
    let cmd = `git clone ${url} ${resolveModuleDir(name)}`;
    if (version) cmd +=  ` -b ${version}`;
    await exec(cmd);
    return resolveModuleDir(name);
}

export async function dryRunGit(context: ResolvingContext, urlLike: string, version?: GitTag, opts?: GitOptions) {
    const {name, tag} = gh(urlLike);
    const dep = context.dependencies.modules[name];
    if (dep) {
        if (isVersionString(version) && isVersionRange(dep.version)) {
            const a = resolveVersionRange(version);
            const b = dep.version;
            if (a.canAccept(b.min) && a.canAccept(b.max)) {
                // [a [b] ]
                dep.version = b;
            } else if (b.canAccept(a.min) && b.canAccept(a.max)) {
                // [b [a] ]
                dep.version = a;
            } else if (compareVersions(a.max.toString(), b.min.toString()) < 0 || compareVersions(b.max.toString(), a.min.toString()) < 0) {
                // [a] [b] or [b] [a]
                throw new Error(`cannnot resolve range`)
            }
        } else {
            throw new Error("cannot resolve common dependency between semantic version and git tag, branch or commit sha1.");
        }
    } else {
        if (isVersionString(version)) {
            context.dependencies.modules[name] = {
                name, type: "git", version: resolveVersionRange(version),
            }
        } else {
            context.dependencies.modules[name] = {
                name, type: "git", version
            }
        }
    }
}
export async function runGit(context: ResolvingContext, urlLike: string, version?: GitTag, opts?: GitOptions) {
    await clone(urlLike)
}

export async function git(urlLike: string, version?: GitTag, opts?: GitOptions) {
    return await clone(urlLike, version, opts);
}