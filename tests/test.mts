import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { geoIntersects, getCombinations } from "./utils.mts";

describe("utils", () => {
  it("getCombinations", () => {
    expect(getCombinations(["a1", "a2", "b1"])).toEqual([
      ["a1", "a2"],
      ["a2", "b1"],
      ["a1", "b1"],
    ]);
  });
});

describe("maps", () => {
  const basePath = "./maps/uk/";
  const geoJsonFilenames = [...Deno.readDirSync(basePath)]
    .map((entry) => `${basePath}${entry.name}`)
    .filter((name) => name.endsWith(".geo.json"));
  const combinations = getCombinations(geoJsonFilenames);

  describe("Make sure no markets intersect", () => {
    for (const combination of combinations) {
      const readableName = combination
        .join(",")
        .replaceAll(basePath, "")
        .replaceAll(".geo.json", "");

      it(`${readableName} should not intersect`, async () => {
        expect(await geoIntersects(combination)).toBeFalsy();
      });
    }
  });
});
