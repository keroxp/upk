import {isNumber} from "util";
const semver = require("semver");
import compareVersions = require("compare-versions");
import {FixedModuleVersion} from "./module";

export function isVersionString(version: string) {
    return !!semver.valid(version);
}
//
// export function resolveVersionRange(version: string): VersionRange {
//     if (isVersionString(version)) {
//         return parseVersionRange(version);
//     }
//     throw new Error("invalid version signature: " + version);
// }
//
//
// export function parseVersion(version: string): Version {
//     const matches = version.match(regex);
//     let i = version.match(/^(>=?|<=?|~>)/) ? 2 : 1;
//     const major = extractVersionComp(matches[i]);
//     let minor = extractVersionComp(matches[i+2]);
//     let patch = extractVersionComp(matches[i+4]);
//     return createVersion(major, minor, patch);
// }
//
// function parseVersionRange(version: string): VersionRange {
//     let min = parseVersion(version);
//     let includeMin = true;
//     let includeMax = false;
//     let m = version.match(/^(>=?|<=?|~>)/);
//     let max = min.nextPatch();
//     if (m) {
//         if (m[1] === ">") {
//             includeMin = false;
//             max = null;
//         } else if (m[1] === ">=") {
//             includeMin = true;
//             max = null;
//         } else if (m[1] === "<") {
//             includeMax = false;
//             includeMin = false;
//             max = min.clone();
//             min = null;
//         } else if (m[1] === "<=") {
//             includeMax = true;
//             includeMin = false;
//             max = min.clone();
//             min = null;
//         } else if (m[1] === "~>") {
//             if (min.major > 0) {
//                 max = min.nextMajor();
//             } else if (min.minor > 0) {
//                 max = min.nextMinor();
//             } else {
//                 max = min;
//             }
//         }
//     }
//     return new _VersionRange(min, max, includeMin, includeMax);
// }
//
// class _VersionRange implements VersionRange {
//     constructor(public readonly min: Version,
//                 public readonly max: Version,
//                 public readonly includeMin: boolean,
//                 public readonly includeMax: boolean) {
//
//     }
//     toString() {
//         let res = "";
//         if (this.min) {
//             res +=`${this.includeMin ? ">=" : ">"}${this.min.toString()}`;
//         }
//         if (this.max) {
//             if (this.min) res += " ";
//             res += `${this.includeMax ? "<=" : "<"}${this.max.toString()}`;
//         }
//         return res;
//     }
//     canAccept(version: Version) {
//         if (!version) throw new Error(`invalid version: ${version}`);
//         const a = this.min ? compareVersions(this.min.toString(), version.toString()) : -1;
//         const b = this.max ? compareVersions(version.toString(), this.max.toString()) : -1;
//         return (this.includeMin && a >= 0) || (!this.includeMin && a > 0)
//             && (this.includeMax && b <= 0) || (!this.includeMax && b < 0);
//     }
//     intersection(range: VersionRange) {
//         const a = this;
//         const b = range;
//         const amin = a.min.toString();
//         const bmin = b.min.toString();
//         const amax = a.max.toString();
//         const bmax = b.max.toString();
//         const cmp = compareVersions;
//         if (cmp(bmin, amax) > 0 || cmp(amin, bmax) > 0) {
//             // no intersection
//             // [a] [b] || [b] [a]
//             return void 0;
//         }
//         if (cmp(amin, bmin) <= 0 && cmp(bmax, amax) <= 0) {
//             // [a [b] ]
//             return range;
//         } else if (cmp(bmin, amin) <= 0 && cmp(amax, bmax) <= 0) {
//             // [b [a] ]
//             return this;
//         } else if (cmp(amin, bmax) <= 0) {
//             // <b [a> ]
//             return new _VersionRange(b.min, a.max, b.includeMin, a.includeMax);
//         } else if (cmp(bmin, amax) <= 0) {
//             // <a [b> ]
//             return new _VersionRange(a.min, b.max, a.includeMin, b.includeMax);
//         }
//     }
// }
//
// function clamp(n) {
//     return n < 0 ? 0 : n;
// }
//
// export function createVersion(major = 0, minor = 0, patch = 0): Version {
//     return {
//         major: clamp(major),
//         minor: clamp(minor),
//         patch: clamp(patch),
//         toArray() {
//             return [major, minor, patch];
//         },
//         clone() {
//             return createVersion(major, minor, patch);
//         },
//         nextMinor() {
//             return createVersion(major, minor + 1)
//         },
//         nextMajor() {
//             return createVersion(major + 1)
//         },
//         nextPatch() {
//             return createVersion(major, minor, patch + 1)
//         },
//         toString() {
//             return `${this.major}.${this.minor}.${this.patch}`;
//         }
//     };
// }
//
// function extractVersionComp(comp: string): number {
//     return !comp ? 0 : parseInt(comp);
// }
//
// export type VersionList = ReadonlyArray<Version> & {
//     latest(): Version;
//     ideal(versions: VersionRange[]): Version;
// }
//
// export function createVersionList(...versions: string[]): VersionList {
//     return Object.assign(
//         versions
//             .sort(compareVersions)
//             .map(parseVersion), {
//             latest() {
//                 return this[this.length-1];
//             },
//             ideal(ranges: VersionRange[]) {
//                 let min: Version = this[this.length-1].clone();
//                 let max: Version = this[0].clone();
//                 for (const v of ranges) {
//                     if (compareVersions(min.toString(), v.min.toString()) > 0) {
//                         min = v.min;
//                     }
//                     if (compareVersions(max.toString(), v.max.toString()) < 0) {
//                         max = v.max;
//                     }
//                 }
//                 for (let i = this.length-1; i >=0 ; i--) {
//                     const v = this[i];
//                     if (compareVersions(v.toString(), max.toString()) <= 0) {
//                         return v;
//                     }
//                 }
//                 throw new Error(`no suitable version: min=${min.toString()}, max=${max.toString()}`);
//             }
//         });
// }