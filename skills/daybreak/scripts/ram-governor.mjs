#!/usr/bin/env node
/**
 * ram-governor - how many Codex builders the box can run right now.
 *
 * WHY: daybreak runs long, and project dev tooling (node, cargo, vitest) plus each Codex
 * process can exhaust RAM and freeze the machine (the Flux 2 incident). The slot count is
 * a pure function of free memory, re-read before each dispatch, never cached.
 *
 *   node ram-governor.mjs [--json] [--min-free-gb N] [--reserve-gb 8] [--per-slot-gb 2.5] [--cap 4]
 *
 * Prints the slot count. Exit 0 normally; exit 1 (VIOLATIONS: the floor was hit) when
 * --min-free-gb is given and free RAM is under it, so a caller can back off.
 */
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { EXIT, installCrashDoor } from '../../../scripts/lib/exit-codes.mjs';

export function slots({ freeGb, reserveGb = 8, perSlotGb = 2.5, cap = 4 } = {}) {
  if (!Number.isFinite(freeGb) || !Number.isFinite(reserveGb) || !Number.isFinite(perSlotGb) || perSlotGb <= 0) return 0;
  const raw = Math.floor((freeGb - reserveGb) / perSlotGb);
  return Math.max(0, Math.min(cap, raw));
}

export const freeGbNow = () => os.freemem() / 1024 ** 3;

function main() {
  installCrashDoor();
  const argv = process.argv.slice(2);
  const val = (name, dflt) => {
    const i = argv.indexOf(name);
    return i >= 0 ? Number(argv[i + 1]) : dflt;
  };
  const freeGb = freeGbNow();
  const minFree = val('--min-free-gb', null);
  const n = slots({ freeGb, reserveGb: val('--reserve-gb', 8), perSlotGb: val('--per-slot-gb', 2.5), cap: val('--cap', 4) });
  const belowFloor = minFree !== null && Number.isFinite(minFree) && freeGb < minFree;
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ freeGb: Math.round(freeGb * 10) / 10, slots: n, belowFloor }));
  } else {
    console.log(String(n));
  }
  process.exit(belowFloor ? EXIT.VIOLATIONS : EXIT.OK);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
