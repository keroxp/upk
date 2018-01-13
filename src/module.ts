import p = require("path");
const moduleDir = "UpkModules";
export function resolveModuleDir(path: string = ".") {
    return p.resolve(moduleDir, path);
}