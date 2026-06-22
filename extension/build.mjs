import esbuild from "esbuild";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const out = resolve(root, "dist");
const zipFlag = process.argv.includes("--zip");

await mkdir(out, { recursive: true });

await esbuild.build({
  entryPoints: [resolve(root, "src/background.ts"), resolve(root, "src/panel.ts")],
  bundle: true,
  format: "esm",
  target: "chrome116",
  outdir: out,
  outExtension: { ".js": ".js" },
  minify: true,
  sourcemap: false,
  define: { "process.env.NODE_ENV": '"production"' },
});

for (const f of ["manifest.json", "panel.html", "panel.css"]) {
  await cp(resolve(root, f), resolve(out, f));
}

const iconsSrc = resolve(root, "icons");
if (existsSync(iconsSrc)) await cp(iconsSrc, resolve(out, "icons"), { recursive: true });

console.log("extension built →", out);

if (zipFlag) {
  const { execSync } = await import("node:child_process");
  const zipName = `aetherclaw-extension-${(JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"))).version}.zip`;
  const cwd = out;
  try {
    execSync(`powershell -Command "Compress-Archive -Path * -DestinationPath ../${zipName} -Force"`, { cwd, stdio: "inherit" });
    console.log("zipped →", resolve(root, zipName));
  } catch {
    console.warn("zip step skipped (no powershell). Manually zip:", out);
  }
}
