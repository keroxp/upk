import CoffeeScript = require("coffee-script")
import program = require("caporal");
import {exists, readFile} from "mz/fs";
import {resolveZip} from "../resolver/zip";
import {dryRunGit, resolveGit} from "../resolver/git";
import {dryRunUpk, upk} from "../resolver/upk";
import {asset, dryRunAsset} from "../resolver/asset";
import {DependencyTree} from "../module";

export function install(args, opts, logger) {
    const file = opts.upkefilepath || "Upkfile" || "Upkfile.coffee";
    const script = String(readFile(file));
    const dtree: DependencyTree = {modules: {}};
    dryRun(script, dtree);
    run(script);
}

function run(script) {
    extend(global, {
        asset: asset, git: resolveGit, upk: upk, zip: resolveZip
    });
    CoffeeScript.run(script);
    extend(global, empty);
}

function dryRun(script, dtree: DependencyTree) {
    extend(global, {
        asset: (...args) => dryRunAsset.call(global, dtree, ...args),
        git: (...args) => dryRunGit.call(global, dtree, ...args),
        upk: (...args) => dryRunUpk.call(global, dtree, ...args),
    });
    CoffeeScript.run(script);
    extend(global, empty);
}

type InstallContext = {
    asset: Function
    upk: Function
    git: Function
    zip?: Function
}
const empty = {
    asset: void 0, upk: void 0, git: void 0, zip: void 0
};

function extend(context, ext: InstallContext) {
    Object.assign(context, ext);
}