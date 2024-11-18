# FTC Stream Overlays

For use with the [stream-cam](https://github.com/JiningLiu/stream-cam/) project and official [FTCLive](https://github.com/FIRST-Tech-Challenge/scorekeeper) scoring system.

## Developing

Once you've installed dependencies with `bun install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

The port is exposed by default with the `--host` flag.

## Building

To create a production version of the app:

```bash
bun run build
```

You can preview the production build with `bun run preview`.