/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const authPopupHtml = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../auth-popup.html'),
  'utf8',
);

describe('auth-popup.html', () => {
  it('disables spinner animation for users who prefer reduced motion', () => {
    expect(authPopupHtml).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.spinner\s*\{[\s\S]*?animation:\s*none;/);
  });
});
