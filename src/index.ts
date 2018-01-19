require("source-map-support").install();
global["__originalDir"] = process.cwd();
const prog = require("caporal");
import {install} from "./command/install";
prog.version("0.0.1")
    .command("install", "add dependency")
    .argument("[module]", "module name to install")
    .option("--upkfile <upkfile>", "select <upkfile> for installation")
    .option("--verbose", "print debug log")
    .option("--no-extract", "resolve package from remote resources but won't extract anything.")
    .option("--dry-run", "dry run for installation. (neither download nor copy)")
    .action(install);
export const cli = prog;