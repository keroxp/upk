const prog = require("caporal");
import {install} from "./command/install";
prog.version("0.0.1")
    .command("install", "add dependency")
    .option("--upkfile <upkfile>", "select <upkfile> for installation")
    .action(install);
export const cli = prog;