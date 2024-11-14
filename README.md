# humly/maps

Various maps used by Humly

# Structure

Map files are stored in maps/`country`/`market`.geo.json

# Setup

```sh
brew install deno
```

# Run tests to validate the map files

```sh
docker compose up -d
deno test --allow-all
```

# Format files

```sh
deno fmt
```

# Generate combined maps from areas and markets

```sh
deno run --allow-all scripts/generate_feature_collections.mts
