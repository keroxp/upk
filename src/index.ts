import program = require("caporal");
import {install} from "./command/install";
const prog = program.default;
prog
    .version("0.0.1")
    .command("install", "add dependency")
    .option("--upkfile <upkfilepath>", "select <upkfilepath> for installation")
    .action(install);