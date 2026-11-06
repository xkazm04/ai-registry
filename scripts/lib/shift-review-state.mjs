/**
 * shift-review-state - how much review the operator owes, and whether proofs must pause.
 *
 * WHY A LIB
 * The review page and the queue's gpu-proof rung must agree on this number: a proof that the
 * ladder allows and the page reports as over cap would be two answers to one question. Both
 * import this one implementation, and it sits here because shift-review already imports from
 * shift-queue, so the queue importing from shift-review would be a cycle.
 *
 * WHY INODES
 * render-triage hard-links every arm's output into `triage/` under a neutral name. A plain walk
 * counts each of those files twice, so proofs would pause at half the operator's cap.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadPolicy } from './shift-policy.mjs';

const GIB = 1024 ** 3;

export const reviewDir = (root) => path.join(root, '.ai', 'shift', 'review');
export const itemsDir = (root) => path.join(reviewDir(root), 'items');

/** Config over defaults. A broken config throws: guessing a cap would hide the typo. */
export function readPolicy(root) {
  const file = path.join(root, '.ai', 'shift', 'config.json');
  return loadPolicy(fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {});
}

/** Bytes on disk under a directory, each hard-linked file once. A missing directory is 0. */
export function treeBytes(dir) {
  const seen = new Set();
  let bytes = 0;
  const walk = (p) => {
    let st;
    // A seat may delete a file during the walk; bigint because NTFS ids overflow a double.
    try { st = fs.lstatSync(p, { bigint: true }); } catch (e) {
      if (e.code === 'ENOENT') return;
      throw e;
    }
    if (st.isDirectory()) {
      for (const name of fs.readdirSync(p)) walk(path.join(p, name));
      return;
    }
    const id = `${st.dev}:${st.ino}`;
    if (seen.has(id)) return;
    seen.add(id);
    bytes += Number(st.size);
  };
  walk(dir);
  return bytes;
}

/** Runs whose sheet is sealed and whose verdict is not in: what waits on the operator. */
export function pendingRuns(root) {
  const dir = itemsDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).sort().filter((run) => fs.existsSync(path.join(dir, run, 'triage', 'key.json'))
    && !fs.existsSync(path.join(dir, run, 'verdict.json')));
}

export function reviewSize(root) {
  const bytes = treeBytes(reviewDir(root));
  const capGb = readPolicy(root).reviewCapGb;
  return {
    reviewGb: Math.round((bytes / GIB) * 1000) / 1000,
    capGb,
    overCap: bytes > capGb * GIB,
    pending: pendingRuns(root).length,
  };
}
