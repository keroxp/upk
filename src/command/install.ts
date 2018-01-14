import CoffeeScript = require("coffee-script");
import {exists, readFile} from "mz/fs";
import {createDependencyTree, DependencyTree} from "../module";
import {runInContext} from "../context";
import {RunContext} from "../context/run-context";
import {DryRunContext} from "../context/dryrun-context";
import * as path from "path";
import {writeFile} from "fs-extra";
import {upk} from "../resolver/upk";

export async function resolveUpkFile(dir: string): Promise<string> {
    for (const fn of ["Upkfile", "Upkfile.coffee"]) {
        const p = path.resolve(`${dir}/${fn}`);
        if (await exists(p)) return p;
    }
}
export type InstallCommandOptions = {
    upkfile: string
}
const debug = require("debug")("upk:command:install");
export async function install(args: {}, opts: InstallCommandOptions, logger) {
    const file = opts.upkfile || await resolveUpkFile(".");
    if (!file) {
        console.log("no Upkfile specified.");
        process.exit(1);
    }
    debug(`Upkfile -> ${file}`);
    const script = String(await readFile(file));
    const deps: DependencyTree = createDependencyTree();
    await beforeRun(file, deps);
    await dryRun(script, file, deps);
    await run(script, file, deps);
    await afterRun(file, deps);
}

export async function beforeRun(upkfile: string, deps: DependencyTree) {
    const lockFile = `${upkfile}.lock`;
    if (await exists(lockFile)) {
        debug(`lockfile found: -> ${lockFile}`);
        const lockedDeps = JSON.parse(String(await readFile(lockFile)));
        for (const key in lockedDeps.modules) {
            deps[key] = lockedDeps.modules[key];
        }
    }
}

export async function dryRun(script: string, upkfile: string, globalDependencies: DependencyTree) {
    await runInContext(new DryRunContext(upkfile, globalDependencies), async () => {
        CoffeeScript.run(script, {filename: upkfile});
    });
}

export async function run(script: string, upkfile: string, globalDependencies: DependencyTree) {
    await runInContext(new RunContext(upkfile, globalDependencies), async () => {
        CoffeeScript.run(script, {filename: upkfile});
    });
}

export async function afterRun(upkfile: string, deps: DependencyTree) {
    // generate lockfile
    const lockFile = `${upkfile}.lock`;
    debug(`[AfterRun] generate lock file -> ${lockFile}`);
    await writeFile(lockFile, JSON.stringify(deps));
}