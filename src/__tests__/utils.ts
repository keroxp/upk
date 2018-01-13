import {remove} from "fs-extra";
import {resolveModuleDir} from "../module";

export async function clearModuels() {
    await remove(resolveModuleDir());
    await remove("assets");
}