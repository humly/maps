import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { geoIntersects, getCombinations, getSQL } from "./utils.mts";

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
  it("connects to db", async () => { 
    let connected = false;
    for (let retries = 0; retries < 10 && !connected; ++retries) {
      try {
        const sql = getSQL();
        await sql`SELECT 1`;
        connected = true;
      } catch (_) {
        // wait a bit and retry
        console.log(`Couldn't connect to DB. Retrying... (attempt ${retries})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    expect (connected).toBeTruthy();
  })

  const countries = [...Deno.readDirSync("maps")].map((c) => c.name);
  const subdirs = ["markets", "areas"];

  for (const country of countries) {
    describe(country, () => {
      for (const subdir of subdirs) {
        describe(subdir, () => {
          const basePath = `./maps/${country}/${subdir}/`;

          try {
            Deno.lstatSync(basePath).isDirectory;
          } catch (_) {
            return;
          }

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
