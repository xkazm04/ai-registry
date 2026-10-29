/**
 * safe-remove - measure and delete a directory tree without following links out of it.
 *
 * Vendored from the registry's scripts/lib/safe-remove.mjs (a skill is installed without the
 * registry's scripts/). Keep the two in step by hand; this copy carries only what /hackathon uses.
 *
 * WHY: `git worktree remove` on Git for Windows descends into directory junctions while deleting.
 * A worktree whose node_modules held junctions into its primary's node_modules deleted 608 tracked
 * files of that primary checkout (gravitone, 2026-10-20). A hackathon entry worktree has its
 * dependencies installed by the setup step, so it is exactly that shape. Here every symlink or
 * junction is unlinked as a link and never entered (lstat reports both as symbolic links), and a
 * read-only git object is retried once after chmod 0o666.
 *
 * Nothing here decides WHAT to delete; lib/git.mjs owns the worktree policy.
 */
import fs from 'node:fs';
import path from 'node:path';

/** lstat walk: bytes, file/dir/link counts. Never follows a link. */
export function measureTree(root) {
  const r = { bytes: 0, files: 0, dirs: 0, links: 0, unreadable: 0 };
  let st;
  try { st = fs.lstatSync(root); } catch { return { ...r, missing: true }; }
  if (st.isSymbolicLink()) return { ...r, links: 1, rootIsLink: true };
  const stack = [root];
  while (stack.length) {
    const d = stack.pop();
    let ents;
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { r.unreadable += 1; continue; }
    r.dirs += 1;
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isSymbolicLink()) { r.links += 1; continue; }
      let s; // lstat every entry: a junction can surface as a plain directory Dirent
      try { s = fs.lstatSync(p); } catch { r.unreadable += 1; continue; }
      if (s.isSymbolicLink()) { r.links += 1; continue; }
      if (s.isDirectory()) { stack.push(p); continue; }
      r.files += 1;
      r.bytes += s.size;
    }
  }
  return r;
}

function unlinkLink(p) {
  try { fs.unlinkSync(p); return true; } catch { /* a directory junction wants rmdir */ }
  try { fs.rmdirSync(p); return true; } catch { return false; }
}

function unlinkFile(p) {
  try { fs.unlinkSync(p); return null; } catch (e) {
    if (e.code !== 'EPERM' && e.code !== 'EACCES') return e.code;
    try { fs.chmodSync(p, 0o666); fs.unlinkSync(p); return null; } catch (e2) { return e2.code || 'ERROR'; }
  }
}

/**
 * Delete `root`. Links are removed, never entered. Errors (a locked file) are counted and the walk
 * goes on; a directory that could not be emptied stays.
 */
export function removeTree(root, { dryRun = false } = {}) {
  const r = { bytesFreed: 0, files: 0, dirs: 0, links: 0, errors: 0, firstErrors: [] };
  const fail = (p, code) => { r.errors += 1; if (r.firstErrors.length < 5) r.firstErrors.push(`${code} ${p}`); };
  let st;
  try { st = fs.lstatSync(root); } catch { return { ...r, missing: true }; }
  if (st.isSymbolicLink()) {
    if (!dryRun) { if (unlinkLink(root)) r.links += 1; else fail(root, 'LINK'); }
    return r;
  }
  const stack = [[root, false]]; // post-order: [dir, expanded]
  while (stack.length) {
    const top = stack[stack.length - 1];
    const [d, expanded] = top;
    if (!expanded) {
      top[1] = true;
      let ents;
      try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { fail(d, e.code || 'READDIR'); continue; }
      for (const e of ents) {
        const p = path.join(d, e.name);
        let s;
        try { s = fs.lstatSync(p); } catch (err) { fail(p, err.code || 'LSTAT'); continue; }
        if (s.isSymbolicLink()) {
          if (dryRun || unlinkLink(p)) r.links += 1; else fail(p, 'LINK');
        } else if (s.isDirectory()) {
          stack.push([p, false]);
        } else {
          if (dryRun) { r.files += 1; r.bytesFreed += s.size; continue; }
          const code = unlinkFile(p);
          if (code) fail(p, code); else { r.files += 1; r.bytesFreed += s.size; }
        }
      }
      continue;
    }
    stack.pop();
    if (dryRun) { r.dirs += 1; continue; }
    try { fs.rmdirSync(d); r.dirs += 1; } catch (e) { if (e.code !== 'ENOTEMPTY') fail(d, e.code || 'RMDIR'); }
  }
  return r;
}
