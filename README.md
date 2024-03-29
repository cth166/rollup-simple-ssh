# rollup-simple-ssh

Connect your server, upload your dist folder to your server after you run `npm run build`

**This plugin is inspired by coderwhy's webpack course**.

## Install

```bash
pnpm add rollup-simple-ssh -D
```

## Usage

```js
//rollup.config.js
import { defineConfig } from "rollup";
import ssh from "rollup-simple-ssh";

export default defineConfig({
  input: "./src/index.js",
  output: {
    file: "./dist/index.js",
    format: "es",
  },
  plugins: [
    ssh({
      host: "192.168.117.133",
      username: "cth",
      // password: "123456",
      privateKeyPath: String.raw`C:\Users\cth16\.ssh\id_ubuntu`,
      remotePath: "/home/cth/Desktop/build",
    }),
  ],
});
```

## Options

### `host`

your server ip.

### `username`

### `password` |`privateKeyPath`

In order to connect your server. You can choose either `privateKeyPath` or `password`.

### `remotePath`

An absolute path, perhaps the static directory pointed to by your nginx.
