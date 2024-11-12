# humly/maps

Various maps used by Humly

# Structure

Map files are stored in countries/`country`/markets/`market`

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
