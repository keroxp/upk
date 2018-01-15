// import {createVersion, parseVersion, resolveVersionRange} from "../version";
//
// describe("version", () => {
//     describe("正常系", () => {
//         test("1.0.0", () => {
//             const v = resolveVersionRange("1.0.0");
//             expect(v.min.toArray()).toMatchObject(createVersion(1,0,0).toArray());
//             expect(v.max.toArray()).toMatchObject(createVersion(1,0,1).toArray());
//             expect(v.includeMin).toBe(true);
//             expect(v.includeMax).toBe(false);
//         });
//         test("1.0", () => {
//             const v = resolveVersionRange("1.0");
//             expect(v.min.toArray()).toMatchObject(createVersion(1,0,0).toArray());
//             expect(v.max.toArray()).toMatchObject(createVersion(1,0,1).toArray());
//             expect(v.includeMin).toBe(true);
//             expect(v.includeMax).toBe(false);
//         });
//         test("1", () => {
//             const v = resolveVersionRange("1");
//             expect(v.min.toArray()).toMatchObject(createVersion(1,0,0).toArray());
//             expect(v.max.toArray()).toMatchObject(createVersion(1,0,1).toArray());
//             expect(v.includeMin).toBe(true);
//             expect(v.includeMax).toBe(false);
//         });
//         test(">=2.1.0", () =>{
//             const v = resolveVersionRange(">=2.1.0");
//             expect(v.min.toArray()).toMatchObject(createVersion(2,1,0).toArray());
//             expect(v.max).toBeNull();
//             expect(v.includeMin).toBe(true);
//             expect(v.includeMax).toBe(false);
//         });
//         test(">=2.1", () =>{
//             const v = resolveVersionRange(">=2.1");
//             expect(v.min.toArray()).toMatchObject(createVersion(2,1,0).toArray());
//             expect(v.max).toBeNull();
//             expect(v.includeMin).toBe(true);
//             expect(v.includeMax).toBe(false);
//         });
//         test(">=2", () =>{
//             const v = resolveVersionRange(">=2");
//             expect(v.min.toArray()).toMatchObject(createVersion(2,0,0).toArray());
//             expect(v.max).toBeNull();
//             expect(v.includeMin).toBe(true);
//             expect(v.includeMax).toBe(false);
//         });
//         test(">2.1.0", () =>{
//             const v = resolveVersionRange(">2.1.0");
//             expect(v.min.toArray()).toMatchObject(createVersion(2,1,0).toArray());
//             expect(v.max).toBeNull();
//             expect(v.includeMin).toBe(false);
//             expect(v.includeMax).toBe(false);
//         });
//         test(">2.1", () =>{
//             const v = resolveVersionRange(">2.1");
//             expect(v.min.toArray()).toMatchObject(createVersion(2,1,0).toArray());
//             expect(v.max).toBeNull();
//             expect(v.includeMin).toBe(false);
//             expect(v.includeMax).toBe(false);
//         });
//         test(">2", () =>{
//             const v = resolveVersionRange(">2");
//             expect(v.min.toArray()).toMatchObject(createVersion(2,0,0).toArray());
//             expect(v.max).toBeNull();
//             expect(v.includeMin).toBe(false);
//             expect(v.includeMax).toBe(false);
//         });
//         test("<2.1.0", () =>{
//             const v = resolveVersionRange("<2.1.0");
//             expect(v.min).toBeNull();
//             expect(v.max.toArray()).toMatchObject(createVersion(2,1,0).toArray());
//             expect(v.includeMin).toBe(false);
//             expect(v.includeMax).toBe(false);
//         });
//         test("<2.1", () =>{
//             const v = resolveVersionRange("<2.1");
//             expect(v.min).toBeNull();
//             expect(v.max.toArray()).toMatchObject(createVersion(2,1,0).toArray());
//             expect(v.includeMin).toBe(false);
//             expect(v.includeMax).toBe(false);
//         });
//         test("<2", () =>{
//             const v = resolveVersionRange("<2");
//             expect(v.min).toBeNull();
//             expect(v.max.toArray()).toMatchObject(createVersion(2,0,0).toArray());
//             expect(v.includeMin).toBe(false);
//             expect(v.includeMax).toBe(false);
//         });
//         test("<=2.1.0", () =>{
//             const v = resolveVersionRange("<=2.1.0");
//             expect(v.min).toBeNull();
//             expect(v.max.toArray()).toMatchObject(createVersion(2,1,0).toArray());
//             expect(v.includeMin).toBe(false);
//             expect(v.includeMax).toBe(true);
//         });
//         test("<=2.1", () =>{
//             const v = resolveVersionRange("<=2.1");
//             expect(v.min).toBeNull();
//             expect(v.max.toArray()).toMatchObject(createVersion(2,1,0).toArray());
//             expect(v.includeMin).toBe(false);
//             expect(v.includeMax).toBe(true);
//         });
//         test("<=2", () =>{
//             const v = resolveVersionRange("<=2");
//             expect(v.min).toBeNull();
//             expect(v.max.toArray()).toMatchObject(createVersion(2,0,0).toArray());
//             expect(v.includeMin).toBe(false);
//             expect(v.includeMax).toBe(true);
//         });
//         describe("parseVersion", () => {
//             test("1.0.0", () => {
//                 const v = parseVersion("1.0.0");
//                 expect(v.toArray()).toMatchObject([1,0,0]);
//                 expect(v.toString()).toEqual("1.0.0");
//             });
//             test("1.0", () => {
//                 const v = parseVersion("1.0");
//                 expect(v.toArray()).toMatchObject([1,0,0]);
//                 expect(v.toString()).toEqual("1.0.0");
//             });
//             test("1", () => {
//                 const v = parseVersion("1");
//                 expect(v.toArray()).toMatchObject([1,0,0]);
//                 expect(v.toString()).toEqual("1.0.0");
//             });
//         });
//         describe("canAccept", () => {
//             const vr = resolveVersionRange;
//             const vs = parseVersion;
//             test(">=", () => {
//                 const v = vr(">=1.0");
//                 const mis = v.min.toString();
//                 console.log(mis);
//                 expect(v.canAccept(vs("1.0"))).toBe(true);
//                 expect(v.canAccept(vs("1.0.1"))).toBe(true);
//                 expect(v.canAccept(vs("1.1"))).toBe(true);
//                 expect(v.canAccept(vs("2.0"))).toBe(true);
//             });
//             test(">", () => {
//                 const v = vr(">1.0");
//                 expect(v.canAccept(vs("1.0"))).toBe(false);
//                 expect(v.canAccept(vs("1.0.1"))).toBe(true);
//                 expect(v.canAccept(vs("1.1"))).toBe(true);
//                 expect(v.canAccept(vs("2.0"))).toBe(true);
//             });
//             test("<=", () => {
//                 const v = vr("<=2.0");
//                 expect(v.canAccept(vs("1.0"))).toBe(true);
//                 expect(v.canAccept(vs("1.0.1"))).toBe(true);
//                 expect(v.canAccept(vs("1.9"))).toBe(true);
//                 expect(v.canAccept(vs("1.9.9"))).toBe(true);
//                 expect(v.canAccept(vs("2.0"))).toBe(true);
//                 expect(v.canAccept(vs("2.1"))).toBe(false);
//                 expect(v.canAccept(vs("3"))).toBe(false);
//             });
//             test("<", () => {
//                 const v = vr("<2.0");
//                 expect(v.canAccept(vs("1.0"))).toBe(true);
//                 expect(v.canAccept(vs("1.0.1"))).toBe(true);
//                 expect(v.canAccept(vs("1.9"))).toBe(true);
//                 expect(v.canAccept(vs("1.9.9"))).toBe(true);
//                 expect(v.canAccept(vs("2.0"))).toBe(false);
//                 expect(v.canAccept(vs("2.1"))).toBe(false);
//                 expect(v.canAccept(vs("3"))).toBe(false);
//             });
//         });
//     });
// });