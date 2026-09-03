import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
