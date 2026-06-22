import esbuild from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chmod } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));

const outfile = resolve(__dirname, "dist/cli.js");

await esbuild.build({
  entryPoints: [resolve(__dirname, "src/cli.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node18",
  outfile,
  minify: true,
  sourcemap: false,
});

try { await chmod(outfile, 0o755); } catch {}

console.log("cli built → dist/cli.js");
