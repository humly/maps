import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import { expect } from "jsr:@std/expect";

const getSQL = () => {
  const sql = postgres({
    host: "localhost",
    port: 5432,
    user: "myuser",
    password: "mypassword",
    database: "maps_db",
  }) as ReturnType<typeof postgres> & AsyncDisposable;

  sql[Symbol.asyncDispose] = sql.end;

  return sql;
};

// Assumes geo json file with a feature collection containing a single feature
async function getGeoString(filename: string) {
  const filecontents = await Deno.readTextFile(filename);
  const geometry = JSON.parse(filecontents).features[0].geometry;
  return JSON.stringify(geometry);
}

async function geoIntersects([filenameA, filenameB]: [string, string]) {
  await using sql = getSQL();
  const [{ intersects }] = await sql`
      SELECT ST_Intersects(
        ST_AsText(ST_GeomFromGeoJSON(${await getGeoString(filenameA)})), 
        ST_AsText(ST_GeomFromGeoJSON(${await getGeoString(filenameB)}))
      ) as intersects`;

  return !!intersects;
}

Deno.test("Make sure no markets intersect", async (t) => {
  const basePath = "./maps/uk";
  const geoJsonFilenames = [...Deno.readDirSync(basePath)]
    .map((entry) => `${basePath}/${entry.name}`)
    .filter((name) => name.endsWith(".geo.json"));

  const combinations = geoJsonFilenames.map((filenameA) =>
    geoJsonFilenames
      .map((filenameB) => [filenameA, filenameB].sort())
      .filter((pair) => pair[0] !== pair[1])
  ).flat() as [string, string][];

  for (const combination of combinations) {
    await t.step(`${combination} should not intersect`, async () => {
       expect(await geoIntersects(combination)).toBeFalsy();
    })
  }
});
