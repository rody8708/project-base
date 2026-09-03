import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const copyrightNotice = "SPDX-FileCopyrightText: 2026 Zendrhax LLC";
const licenseNotice = "SPDX-License-Identifier: MPL-2.0";
const generatedDirectories = new Set([
  "node_modules", "vendor", "dist", "build", ".dart_tool", ".gradle",
]);
const maintainedSourceRules = [
  { root: "scripts", extensions: new Set([".mjs"]) },
  { root: "tools", extensions: new Set([".mjs"]) },
  { root: "starters/web", extensions: new Set([".js", ".mjs", ".ts", ".tsx", ".html", ".css"]) },
  { root: "starters/web-vanilla", extensions: new Set([".js", ".mjs", ".html", ".css"]) },
  { root: "starters/backend-node", extensions: new Set([".ts"]) },
  { root: "starters/backend-php", extensions: new Set([".php", ".mjs", ".ps1", ".sh"]), names: new Set(["Dockerfile", "artisan"]) },
  { root: "starters/flutter/lib", extensions: new Set([".dart"]) },
  { root: "starters/flutter/test", extensions: new Set([".dart"]) },
  { root: "starters/flutter/integration_test", extensions: new Set([".dart"]) },
  { root: "starters/flutter/tool", extensions: new Set([".dart"]) },
  { root: "starters/kotlin-android", extensions: new Set([".kt", ".kts"]) },
];

async function maintainedSourcePaths() {
  const files = [];
  async function walk(directory, rule) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (generatedDirectories.has(entry.name)) continue;
      const candidate = path.join(directory, entry.name);
      if (candidate.split(path.sep).join("/").endsWith("/bootstrap/cache")) continue;
      if (entry.isDirectory()) await walk(candidate, rule);
      else if (entry.isFile() && (rule.extensions.has(path.extname(entry.name)) || rule.names?.has(entry.name))) {
        files.push(candidate.split(path.sep).join("/"));
      }
    }
  }
  for (const rule of maintainedSourceRules) await walk(rule.root, rule);
  return files.sort();
}

const expectedLicenseSha256 =
  "3f3d9e0024b1921b067d6f7f88deb4a60cbe7a78e76c64e3f1d7fc3b779b9d04";
const licensePaths = [
  "LICENSE",
  "starters/web/LICENSE",
  "starters/web-vanilla/LICENSE",
  "starters/flutter/LICENSE",
  "starters/kotlin-android/LICENSE",
  "starters/backend-php/LICENSE",
  "starters/backend-node/LICENSE",
];

const npmManifestPaths = [
  "package.json",
  "starters/web/package.json",
  "starters/web-vanilla/package.json",
  "starters/backend-node/package.json",
];

test("repository and every exportable starter carry the unmodified MPL-2.0 text", async () => {
  for (const path of licensePaths) {
    const text = (await readFile(path, "utf8")).replace(/\r\n/g, "\n");
    const digest = createHash("sha256").update(text).digest("hex");
    assert.equal(digest, expectedLicenseSha256, path);
  }
});

test("package manifests declare MPL-2.0", async () => {
  for (const path of npmManifestPaths) {
    const manifest = JSON.parse(await readFile(path, "utf8"));
    assert.equal(manifest.license, "MPL-2.0", path);
  }

  const composer = JSON.parse(
    await readFile("starters/backend-php/composer.json", "utf8"),
  );
  assert.equal(composer.license, "MPL-2.0");
});

test("maintained source files carry Zendrhax LLC SPDX notices", async () => {
  const files = await maintainedSourcePaths();
  assert.ok(files.length > 100, "unexpectedly small maintained source inventory");
  for (const sourcePath of files) {
    const beginning = (await readFile(sourcePath, "utf8")).split(/\r?\n/, 8).join("\n");
    assert.match(beginning, new RegExp(copyrightNotice.replaceAll(" ", "\\s")), sourcePath);
    assert.match(beginning, new RegExp(licenseNotice.replaceAll("-", "\\-")), sourcePath);
  }
});
