import {exec} from "child-process-promise";
import gh = require("parse-github-url");
import {isObject, isString} from "util";
import {resolveModuleDir} from "./module";
function isGithubUrl (urlLike: string) {
    return !!(urlLike.match(/^(.+)?\/(.+)$/))
}

export type VersionString = string;
export type GitOptions = {

}
function isGitOptions(a): a is GitOptions {
    return isObject(a);
}
async function clone(gitUrl: string, version?: VersionString, opts?: GitOptions) {
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
}
export async function git(urlLike: string, version?: VersionString, opts?: GitOptions) {
    await clone(urlLike, version, opts);
}