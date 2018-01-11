import * as program from "caporal"
import {install} from "./install";

program
    .version("0.0.1")
    .command("install", "add dependency")
    .argument("")
    .action(install);