import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const sql = postgres({
  host: "localhost",
  port: 5432,
  user: "myuser",
  password: "mypassword",
  database: "maps_db",
});

// Assumes geo json file with a feature collection containing a single feature
async function getGeoString(filename: string) {
  const filecontents = await Deno.readTextFile(filename);
  const geometry = ((JSON.parse(filecontents)).features[0].geometry);
  return JSON.stringify(geometry);
}

const geoJsonFilenames = [...Deno.readDirSync("./")]
  .map(entry => entry.name)
  .filter(name => name.endsWith(".geo.json"))

for (const filenameA of geoJsonFilenames) { 
  for (const filenameB of geoJsonFilenames) {
    if (filenameA === filenameB ) { continue }
    
    const [{ intersects }] = await sql`
      SELECT ST_Intersects(
        ST_AsText(ST_GeomFromGeoJSON(${await getGeoString(filenameA)})), 
        ST_AsText(ST_GeomFromGeoJSON(${await getGeoString(filenameB)}))
      ) as intersects`;
    
    if (intersects) {
      console.log(`${filenameA}\t intersects ${filenameB}`);
    }
  }
}

await sql.end();
