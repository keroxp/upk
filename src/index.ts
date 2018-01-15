require("source-map-support").install();
global["__originalDir"] = process.cwd();
const prog = require("caporal");
import {install} from "./command/install";
prog.version("0.0.1")
    .command("install", "add dependency")
    .option("--upkfile <upkfile>", "select <upkfile> for installation")
    .option("--verbose", "print debug log")
    .option("--dry-run", "dry run for installation. (no download or copy)")
    .action(install);
export const cli = prog;