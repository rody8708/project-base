// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('system appearance', () => {
  it('advertises and implements light and dark color schemes', async () => {
    const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8');

    expect(css).toMatch(/color-scheme\s*:\s*light\s+dark\s*;/i);
    expect(css).toMatch(/@media\s*\(prefers-color-scheme\s*:\s*dark\)/i);
  });
});
