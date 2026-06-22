import esbuild from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [resolve(__dirname, "src/extension.ts")],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node18",
  external: ["vscode"],
  outfile: resolve(__dirname, "dist/extension.js"),
  minify: true,
  sourcemap: false,
});

console.log("vscode extension built → dist/extension.js");
