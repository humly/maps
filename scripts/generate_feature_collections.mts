const countries = [...Deno.readDirSync("maps")].map((c) => c.name);
const subdirs = ["markets", "areas"];

type FeatureCollection = { type: "FeatureCollection"; features: unknown[] };
function createFeatureCollection(): FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

for (const country of countries) {
  const countryCollection = createFeatureCollection();
  for (const subdir of subdirs) {
    const subdirCollection = createFeatureCollection();
    const basePath = `./maps/${country}/${subdir}/`;
    const geoJsonFilenames = [...Deno.readDirSync(basePath)]
      .map((entry) => `${basePath}${entry.name}`)
      .filter((name) => name.endsWith(".geo.json"));

    for (const geoJsonFilename of geoJsonFilenames) {
      const geoJson = await Deno.readTextFile(geoJsonFilename);
      const geoJsonCollection = JSON.parse(geoJson);

      countryCollection.features.push(...geoJsonCollection.features);
      subdirCollection.features.push(...geoJsonCollection.features);
    }

    await Deno.mkdir(`./generated/${country}`, { recursive: true });
    await Deno.writeTextFile(
      `./generated/${country}/${subdir}.geo.json`,
      JSON.stringify(subdirCollection, null, 2),
    );
  }
  await Deno.writeTextFile(
    `./generated/${country}.geo.json`,
    JSON.stringify(countryCollection, null, 2),
  );
}
