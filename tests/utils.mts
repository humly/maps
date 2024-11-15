import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

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
export async function getGeoString(filename: string) {
  const filecontents = await Deno.readTextFile(filename);
  const geometry = JSON.parse(filecontents).features[0].geometry;
  return JSON.stringify(geometry);
}

export async function geoIntersects([filenameA, filenameB]: [string, string]) {
  await using sql = getSQL();
  const [{ intersects }] = await sql`
      SELECT ST_Intersects(
        ST_AsText(ST_GeomFromGeoJSON(${await getGeoString(filenameA)})), 
        ST_AsText(ST_GeomFromGeoJSON(${await getGeoString(filenameB)}))
      ) as intersects`;

  return !!intersects;
}
export function getCombinations(items: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      pairs.push([items[i], items[j]]);
    }
  }
  return pairs;
}
