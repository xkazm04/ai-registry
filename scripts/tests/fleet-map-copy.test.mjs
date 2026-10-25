// The fleet map's own prose must point readers at the file that actually holds the
// per-device root. scripts/lib/projects.mjs rejects `root` inside projects.json machines
// ("root belongs in .machine.local.json"), so copy naming `machines.<name>.root` or
// `projects.json` as the root's home is wrong on every device that reads it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLEET_MAP_NOTE, fleetMapMdIntro } from '../lib/fleet-map-copy.mjs';

const SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the JSON note names .machine.local.json as the per-device root, not machines.<name>.root', () => {
  assert.match(FLEET_MAP_NOTE, /\.machine\.local\.json/);
  assert.doesNotMatch(FLEET_MAP_NOTE, /machines\.<name>\.root/);
});

test('the markdown intro names .machine.local.json and does not send readers to projects.json for the root', () => {
  const md = fleetMapMdIntro('2026-01-01');
  assert.match(md, /\.machine\.local\.json/);
  assert.doesNotMatch(md, /root per device is `projects\.json`/);
  assert.match(md, /2026-01-01/);
});

test('projects.mjs still rejects root in projects.json machines (the claim the copy rests on)', () => {
  const src = fs.readFileSync(path.join(SCRIPTS, 'lib', 'projects.mjs'), 'utf8');
  assert.match(src, /root belongs in \.machine\.local\.json/);
});

test('build-fleet-map.mjs takes its prose from the module and its header does not misplace the root', () => {
  const src = fs.readFileSync(path.join(SCRIPTS, 'build-fleet-map.mjs'), 'utf8');
  assert.match(src, /fleet-map-copy\.mjs/);
  assert.doesNotMatch(src, /machines\.<name>\.root/);
  assert.doesNotMatch(src, /projects\.json declares the root/);
});
