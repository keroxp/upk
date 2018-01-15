import CoffeeScript = require("coffee-script");
import Debug = require("debug");
import {exists, readFile} from "mz/fs";
import {createDependencyTree, DependencyTree} from "../module";
import {runInContext} from "../context";
import {RunContext} from "../context/run-context";
import {DryRunContext} from "../context/dryrun-context";
import * as path from "path";
import {writeFile} from "fs-extra";

export async function resolveUpkFile(dir: string): Promise<string> {
    for (const fn of ["Upkfile", "Upkfile.coffee"]) {
        const p = path.resolve(`${dir}/${fn}`);
        if (await exists(p)) return p;
    }
}

export type InstallCommandOptions = {
    upkfile: string, verbose: boolean
}
const debug = require("debug")("upk:command:install");

export async function install(args: {}, opts: InstallCommandOptions, logger) {
    const file = opts.upkfile || await resolveUpkFile(".");
    if (opts.verbose) Debug.enable("upk:*");
    if (!file) {
        console.error("no Upkfile specified.");
        process.exit(1);
    }
    debug(`Upkfile -> ${file}`);
    const script = String(await readFile(file));
    const deps: DependencyTree = createDependencyTree();
    global["dependencies"] = async (resolvers: Function[]) => {
        debug(resolvers);
        for (const p of resolvers) await p();
    };
    await beforeRun(file, deps);
    await dryRun(script, file, deps);
    if (opts["dryRun"]) return;
    await run(script, file, deps);
    await afterRun(file, deps);
}

export async function beforeRun(upkfile: string, deps: DependencyTree) {
    const lockFile = `${upkfile}.lock`;
    if (await exists(lockFile)) {
        debug(`lockfile found: -> ${lockFile}`);
        const lockedDeps = JSON.parse(String(await readFile(lockFile)));
        for (const key in lockedDeps.modules) {
            deps.modules[key] = lockedDeps.modules[key];
        }
    }
}

export async function dryRun(script: string, upkfile: string, globalDependencies: DependencyTree) {
    await runInContext(new DryRunContext(upkfile, globalDependencies), async () => {
        await CoffeeScript.eval(script, {filename: upkfile});
    });
    debug("dependency tree are:");
    debug(globalDependencies);
}

export async function run(script: string, upkfile: string, globalDependencies: DependencyTree) {
    await runInContext(new RunContext(upkfile, globalDependencies), async () => {
        await CoffeeScript.eval(script, {filename: upkfile});
    });
}

export async function afterRun(upkfile: string, deps: DependencyTree) {
    // generate lockfile
    const lockFile = `${upkfile}.lock`;
    debug(`[AfterRun] generate lock file -> ${lockFile}`);
    await writeFile(lockFile, JSON.stringify(deps, null, 4));
    debug(deps);
}