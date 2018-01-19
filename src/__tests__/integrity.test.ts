import {calculateFileIntegrity} from "../integrity";

describe("integrity", () => {
   test("a", async () => {
       const a = await calculateFileIntegrity("fixtures/integrity");
       expect(a).toBe("d9e6762dd1c8eaf6d61b3c6192fc408d4d6d5f1176d0c29169bc24e71c3f274ad27fcd5811b313d681f7e55ec02d73d499c95455b6b5bb503acf574fba8ffe85");
   })
});