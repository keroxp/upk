import {currentRef, fetchTags, fetchVersions, GitOptions, GitTag, lsRemote} from "../resolver/git";
import {Resolvable} from "../resolver";
import {createDependencyTree, DependencyTree, resolveModuleDir, ResolverType} from "../module";
import {BaseUpkfileContext, UpkfileContext} from "./index";
import {PathResolver} from "../resolver/zip";
import {exists} from "mz/fs";
import {isVersionString} from "../version";
import github = require("parse-github-url");
import semver = require("semver");
import {remove} from "fs-extra";

const debug = require("debug")("upk:context:dryrun");

export class DryRunContext extends BaseUpkfileContext implements UpkfileContext {
    constructor(upkfilePath: string, globalDependencies: DependencyTree) {
        super(upkfilePath, globalDependencies)
    }

    async checkDuplication(type: ResolverType, name: string, version?: GitTag) {
        let shouldUpdate = true;
        if (this.localDependencies.modules[name]) {
            throw new Error(`duplicated ${type} dependency for ${name} in ${this.upkfilePath}`);
        }
        const moduleDir = resolveModuleDir(name);
        const hasLock = this.globalDependencies.modules[name];
        const installed = await exists(moduleDir);
        if (hasLock) {
            if (installed) {
                if (type !== "git") {
                    debug(`[${name}] already seems to be installed: -> ${moduleDir}. installation will be skipped.`);
                    shouldUpdate = false;
                }
            }
        } else if (installed) {
            // no lock info, but installed.
            debug(`[${name}] no lock info found. but module dir ${moduleDir} may not be empty. so update will be ignored.`);
            shouldUpdate = false;
        } else {
            // no lock info, not installed.
        }
        if (!this.globalDependencies.modules[name]) {
            this.globalDependencies.modules[name] = this.localDependencies.modules[name] = {
                name, type, version, shouldUpdate
            };
            debug(`[${name}] has been registered global dependency. ${this.globalDependencies.modules[name]}`);
        }
        this.globalDependencies.modules[name].shouldUpdate = shouldUpdate;
        return moduleDir;
    }

    async git(gitUrl: string, version?: GitTag, opts?: GitOptions) {
        const {name} = github(gitUrl);
        const gitdir = resolveModuleDir(name);
        const result = await this.checkDuplication("git", name, version);
        if (await exists(gitdir)) {
            debug(`[${name}] installed by git. checking version change."`);
            let nextLockedVersion = version;
            const versionRange = semver.validRange(version);
            const gitref = await currentRef(gitdir);
            const lockedRange = semver.validRange(this.globalDependencies.modules[name].version);
            const lockedVersion = semver.valid(this.globalDependencies.modules[name].lockedVersion);
            if (lockedVersion && gitref !== lockedVersion) {
                throw new Error(`unlocked git reference: locked: ${lockedVersion}, but actual: ${gitref}`);
            }
            this.globalDependencies.modules[name].version = version;
            if (lockedRange && lockedVersion) {
                // update
                const versions = await fetchVersions(gitdir);
                nextLockedVersion = semver.maxSatisfying(versions, lockedRange);
            }else if (versionRange) {
                // new lock
                const versions = await fetchVersions(gitdir);
                nextLockedVersion = semver.maxSatisfying(versions, versionRange);
            } else if (version) {
                // checkout
                nextLockedVersion = version;
            } else {
                // no version
            }
            if (lockedVersion !== nextLockedVersion) {
                debug(`${name} updated lock version: ${lockedVersion} -> ${nextLockedVersion}`);
            }
            this.globalDependencies.modules[name].lockedVersion = nextLockedVersion;
        }
        return result;
    }

    async zip(url: string, pathResolver: PathResolver): Promise<string> {
        throw new Error(`zip is not allowed in root context.`);
    }

    async upk(name: string, resolver: Resolvable) {
        return this.checkDuplication("upk", name);
    }

    async asset(name: string, resolver: Resolvable) {
        return this.checkDuplication("asset", name);
    }
}