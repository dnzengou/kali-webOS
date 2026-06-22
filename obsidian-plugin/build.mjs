import esbuild from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, cp, readFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const out = resolve(root, "dist");
const zipFlag = process.argv.includes("--zip");

await mkdir(out, { recursive: true });

await esbuild.build({
  entryPoints: [resolve(root, "src/main.ts")],
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: "es2022",
  external: ["obsidian", "electron", "@codemirror/*", "@lezer/*"],
  outfile: resolve(out, "main.js"),
  minify: true,
  sourcemap: false,
});

await cp(resolve(root, "manifest.json"), resolve(out, "manifest.json"));

console.log("obsidian plugin built →", out);

if (zipFlag) {
  const { execSync } = await import("node:child_process");
  const v = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8")).version;
  try {
    execSync(`powershell -Command "Compress-Archive -Path * -DestinationPath ../obsidian-aetherclaw-${v}.zip -Force"`, { cwd: out, stdio: "inherit" });
    console.log("zipped → obsidian-aetherclaw-" + v + ".zip");
  } catch {
    console.warn("zip skipped; archive", out, "manually");
  }
}
