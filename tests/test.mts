import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { geoIntersects, getCombinations } from "./utils.mts";

describe("Utils", () => {
  it("getCombinations", () => {
    expect(getCombinations(["a1", "a2", "b1"])).toEqual([
      ["a1", "a2"],
      ["a1", "b1"],
      ["a2", "b1"],
    ]);
  });
});

describe("Maps", () => {
  const countries = [...Deno.readDirSync("maps")].map((c) => c.name);
  const subdirs = ["markets", "areas"];

  for (const country of countries) {
    describe(country, () => {
      for (const subdir of subdirs) {
        describe(subdir, () => {
          const basePath = `./maps/${country}/${subdir}/`;
          const geoJsonFilenames = [...Deno.readDirSync(basePath)]
            .map((entry) => `${basePath}${entry.name}`)
            .filter((name) => name.endsWith(".geo.json"));
          const combinations = getCombinations(geoJsonFilenames);

          describe("should not intersect", () => {
            for (const combination of combinations) {
              const readableName = combination
                .join(",")
                .replaceAll(basePath, "")
                .replaceAll(".geo.json", "");

              it(readableName, async () => {
                expect(await geoIntersects(combination)).toBeFalsy();
              });
            }
          });
        });
      }
    });
  }
});
