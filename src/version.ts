const semver = require("semver");

export function isVersionString(version: string) {
    return !!semver.valid(version);
}
