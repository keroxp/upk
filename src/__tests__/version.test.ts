import {createVersion, resolveVersionRange} from "../version";

describe("version", () => {
    describe("正常系", () => {
        it("1.0.0", () => {
            const v = resolveVersionRange("1.0.0");
            expect(v.min.toArray()).toEqual(createVersion(1,0,0).toArray());
            expect(v.max.toArray()).toEqual(createVersion(1,0,1).toArray());
            expect(v.includeMin).toBe(true);
            expect(v.includeMax).toBe(false);
        });
        it("1.0", () => {
            const v = resolveVersionRange("1.0");
            expect(v.min.toArray()).toEqual(createVersion(1,0,0).toArray());
            expect(v.max.toArray()).toEqual(createVersion(1,0,1).toArray());
            expect(v.includeMin).toBe(true);
            expect(v.includeMax).toBe(false);
        });
        it("1", () => {
            const v = resolveVersionRange("1");
            expect(v.min.toArray()).toEqual(createVersion(1,0,0).toArray());
            expect(v.max.toArray()).toEqual(createVersion(1,0,1).toArray());
            expect(v.includeMin).toBe(true);
            expect(v.includeMax).toBe(false);
        });
        it(">=2.1.0", () =>{
            const v = resolveVersionRange(">=2.1.0");
            expect(v.min.toArray()).toEqual(createVersion(2,1,0).toArray());
            expect(v.max).toBeNull();
            expect(v.includeMin).toBe(true);
            expect(v.includeMax).toBe(false);
        });
        it(">=2.1", () =>{
            const v = resolveVersionRange(">=2.1");
            expect(v.min.toArray()).toEqual(createVersion(2,1,0).toArray());
            expect(v.max).toBeNull();
            expect(v.includeMin).toBe(true);
            expect(v.includeMax).toBe(false);
        });
        it(">=2", () =>{
            const v = resolveVersionRange(">=2");
            expect(v.min.toArray()).toEqual(createVersion(2,0,0).toArray());
            expect(v.max).toBeNull();
            expect(v.includeMin).toBe(true);
            expect(v.includeMax).toBe(false);
        });
        it(">2.1.0", () =>{
            const v = resolveVersionRange(">2.1.0");
            expect(v.min.toArray()).toEqual(createVersion(2,1,0).toArray());
            expect(v.max).toBeNull();
            expect(v.includeMin).toBe(false);
            expect(v.includeMax).toBe(false);
        });
        it(">2.1", () =>{
            const v = resolveVersionRange(">2.1");
            expect(v.min.toArray()).toEqual(createVersion(2,1,0).toArray());
            expect(v.max).toBeNull();
            expect(v.includeMin).toBe(false);
            expect(v.includeMax).toBe(false);
        });
        it(">2", () =>{
            const v = resolveVersionRange(">2");
            expect(v.min.toArray()).toEqual(createVersion(2,0,0).toArray());
            expect(v.max).toBeNull();
            expect(v.includeMin).toBe(false);
            expect(v.includeMax).toBe(false);
        });
        it("<2.1.0", () =>{
            const v = resolveVersionRange("<2.1.0");
            expect(v.min).toBeNull();
            expect(v.max.toArray()).toEqual(createVersion(2,1,0).toArray());
            expect(v.includeMin).toBe(false);
            expect(v.includeMax).toBe(false);
        });
        it("<2.1", () =>{
            const v = resolveVersionRange("<2.1");
            expect(v.min).toBeNull();
            expect(v.max.toArray()).toEqual(createVersion(2,1,0).toArray());
            expect(v.includeMin).toBe(false);
            expect(v.includeMax).toBe(false);
        });
        it("<2", () =>{
            const v = resolveVersionRange("<2");
            expect(v.min).toBeNull();
            expect(v.max.toArray()).toEqual(createVersion(2,0,0).toArray());
            expect(v.includeMin).toBe(false);
            expect(v.includeMax).toBe(false);
        });
        it("<=2.1.0", () =>{
            const v = resolveVersionRange("<=2.1.0");
            expect(v.min).toBeNull();
            expect(v.max.toArray()).toEqual(createVersion(2,1,0).toArray());
            expect(v.includeMin).toBe(false);
            expect(v.includeMax).toBe(true);
        });
        it("<=2.1", () =>{
            const v = resolveVersionRange("<=2.1");
            expect(v.min).toBeNull();
            expect(v.max.toArray()).toEqual(createVersion(2,1,0).toArray());
            expect(v.includeMin).toBe(false);
            expect(v.includeMax).toBe(true);
        });
        it("<=2", () =>{
            const v = resolveVersionRange("<=2");
            expect(v.min).toBeNull();
            expect(v.max.toArray()).toEqual(createVersion(2,0,0).toArray());
            expect(v.includeMin).toBe(false);
            expect(v.includeMax).toBe(true);
        });
    });
});