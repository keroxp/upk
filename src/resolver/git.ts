import {exec} from "child-process-promise";
import {FixedModuleVersion, resolveModuleDir} from "../module";
import {isVersionString} from "../version";
import {ResolvingModuleInfo} from "./index";
import gh = require("parse-github-url");
import {exists} from "mz/fs";
import * as path from "path";
const debug = require("debug")("upk:git");
export type GitTag = string;
export type GitOptions = {}
import semver = require("semver");
async function checkoutIdealVersion(gitdir: string, version?: GitTag): Promise<FixedModuleVersion> {
    let coVersion = version;
    const cwd = process.cwd();
    try {
        const range = semver.validRange(version);
        debug(gitdir);
        process.chdir(path.resolve(gitdir));
        if (range) {
            debug(`semantic version was specified: range=${range}, original=${version}`);
            // v0.1.0 or 1.0.0 ~>0.1.2 etc...
            const tags = (await fetchTags()).filter(tag => !!semver.valid(tag));
            coVersion = semver.maxSatisfying(tags, range);
        } else if (!version) {
            debug("no version specified. try to lock current head's commit.");
            coVersion = await currentCommit(gitdir);
        }
        debug(`ideal version resolved. try to checkout: ${coVersion}`);
        await exec(`git checkout ${coVersion}`);
    } finally {
        process.chdir(cwd);
    }
    return currentCommit(gitdir);
}

export async function isGitDir(gitpath: string = "."): Promise<boolean> {
    return exists(path.resolve(gitpath, ".git"));
}

export async function fetchTags(gitdir: string = "."): Promise<string[]> {
    const cwd = process.cwd();
    try {
        process.chdir(path.resolve(gitdir));
        await exec(`git fetch --all`);
        const {stdout} = await exec(`git tag`);
        return stdout.split("\n");
    } finally {
        process.chdir(cwd);
    }
}
async function execGitCmd(gitdir = ".", cmd: string): Promise<string> {
    if (!await isGitDir(gitdir)) throw new Error(`gitdir: ${gitdir} may not be git directory.`);
    const cwd = process.cwd();
    try {
        process.chdir(path.resolve(gitdir));
        const {stdout} = (await exec(cmd));
        return stdout;
    } finally {
        process.chdir(cwd);
    }
}
export async function fetchVersions(gitdir = "."): Promise<string[]> {
    return (await fetchTags(gitdir)).filter(tag => !!semver.valid(tag));
}

export async function currentCommit(gitdir = "."): Promise<string> {
    return (await execGitCmd(gitdir,"git rev-parse --short HEAD")).split("\n")[0];
}
export async function currentRef(gitdir = "."): Promise<string> {
    const cwd = process.cwd();
    if (!await isGitDir(gitdir)) throw new Error(`gitdir: ${gitdir} may not be git directory.`);
    try {
        process.chdir(path.resolve(gitdir));
        const {stdout} = (await exec(`git symbolic-ref --short HEAD`));
        return parseGitRef(stdout);
    } catch (err) {
        // may be checkouted commit?
        try {
            return currentCommit(gitdir);
        } catch (err2) {
            debug("unknown error occured while retrieving git revision within : "+gitdir);
            // unknwon
            throw err2;
        }
    } finally {
        process.chdir(cwd);
    }
}

export function parseGitRef(ref: string) {
    const m = ref.match(/^heads\/(.+)$/);
    if (m) {
        return m[1];
    }
    throw new Error(`ref:${ref} is not result of git symbolic-ref`);
}

export async function lsRemote(gitUrl: string): Promise<string[]> {
    const result = (await exec(`git ls-remote -t ${gitUrl}`)).stdout as string;
    return result.split("\n").map(ln => ln.split("\t")[1]);
}

export async function clone(gitUrl: string, dest?: string, version?: GitTag, opts?: GitOptions) {
    const gitComps = gh(gitUrl);
    let {name, host, path, protocol} = gitComps;
    if (!protocol && gitComps.host === "github.com") {
        protocol = "https";
    }
    const url = `${protocol}://${host}/${path}`;
    if (!protocol || !host || !path || !name) {
        throw new Error(`invalid git url: ${url}`);
    }
    const gitdir = dest || resolveModuleDir(name);
    if (await isGitDir(gitdir)) {
        debug(`${name}: already cloned into ${gitdir}`);
        return gitdir;
    }
    debug(`try to clone git repo: ${url} -> ${gitdir}`);
    let cmd = `git clone ${url}`;
    if (dest) cmd += ` ${dest}`;
    if (version) cmd +=  ` -b ${version}`;
    await exec(cmd);
    return gitdir;
}

export async function runGit(context: ResolvingModuleInfo, urlLike: string, version?: GitTag, opts?: GitOptions) {
    const gitdir = await clone(urlLike, resolveModuleDir(context.moduleName));
    const lockedVersion = await checkoutIdealVersion(gitdir, version);
    context.runContext.globalDependencies.modules[context.moduleName].lockedVersion = lockedVersion;
    return resolveModuleDir(context.moduleName)
}

export async function git(urlLike: string, version?: GitTag, opts?: GitOptions) {
    return await clone(urlLike, void 0, version, opts);
}