/**
 * safe-remove - measure and delete a directory tree on a developer machine without following
 * links out of it.
 *
 * A plain recursive delete is the wrong tool for agent leftovers on Windows:
 *
 *   - pnpm `node_modules` and several harnesses use directory junctions. A walker that
 *     descends into a junction deletes the shared store (or a sibling checkout) it points at.
 *     Here every symlink or junction is removed as a link and never entered: lstat reports
 *     both as symbolic links, and the link itself is unlinked or rmdir'ed.
 *   - git marks pack and loose objects read-only, so unlink fails with EPERM on every clone
 *     until the bit is cleared. A failure is retried once after chmod 0o666.
 *   - a tree someone is still working in must not go. `measureTree` returns the newest
 *     write or creation time (ignoring `.git/index`, which `git status` from any scanner
 *     refreshes), so a caller can refuse a tree touched within its quiet window.
 *
 * Nothing here decides WHAT to delete. Callers own the policy (which roots, which age, which
 * git state); this module only makes the mechanics safe and countable.
 */
import fs from 'node:fs';
import path from 'node:path';

const isIndex = (p) => /[\\/]\.git[\\/]index$/i.test(p);

/** lstat walk: bytes, file/dir/link counts and the newest mtime/birthtime. Never follows a link. */
export function measureTree(root) {
  const r = { bytes: 0, files: 0, dirs: 0, links: 0, newestMs: 0, unreadable: 0 };
  let st;
  try { st = fs.lstatSync(root); } catch { return { ...r, missing: true }; }
  if (st.isSymbolicLink()) return { ...r, links: 1, rootIsLink: true };
  const stack = [root];
  while (stack.length) {
    const d = stack.pop();
    let ents;
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { r.unreadable++; continue; }
    r.dirs++;
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isSymbolicLink()) { r.links++; continue; }
      let s; // lstat every entry: a junction can surface as a plain directory Dirent
      try { s = fs.lstatSync(p); } catch { r.unreadable++; continue; }
      if (s.isSymbolicLink()) { r.links++; continue; }
      if (s.isDirectory()) { stack.push(p); continue; }
      r.files++;
      r.bytes += s.size;
      if (!isIndex(p)) r.newestMs = Math.max(r.newestMs, s.mtimeMs, s.birthtimeMs || 0);
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
 * Delete `root` (or only what is inside it with keepRoot, or everything below its first-level
 * folders with keepFirstLevelDirs). Links are removed, never entered. Errors (a locked file) are
 * counted and the walk goes on; a directory that could not be emptied stays.
 */
export function removeTree(root, { keepRoot = false, keepFirstLevelDirs = false, dryRun = false } = {}) {
  const r = { bytesFreed: 0, files: 0, dirs: 0, links: 0, errors: 0, errorCodes: {}, firstErrors: [] };
  const fail = (p, code) => { r.errors++; r.errorCodes[code] = (r.errorCodes[code] || 0) + 1; if (r.firstErrors.length < 5) r.firstErrors.push(`${code} ${p}`); };
  let st;
  try { st = fs.lstatSync(root); } catch { return { ...r, missing: true }; }
  if (st.isSymbolicLink()) {
    if (!dryRun && !keepRoot) { if (unlinkLink(root)) r.links++; else fail(root, 'LINK'); }
    return r;
  }
  // post-order: [dir, depth, expanded]
  const stack = [[root, 0, false]];
  while (stack.length) {
    const top = stack[stack.length - 1];
    const [d, depth, expanded] = top;
    if (!expanded) {
      top[2] = true;
      let ents;
      try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { fail(d, e.code || 'READDIR'); continue; }
      for (const e of ents) {
        const p = path.join(d, e.name);
        let s;
        try { s = fs.lstatSync(p); } catch (err) { fail(p, err.code || 'LSTAT'); continue; }
        if (s.isSymbolicLink()) {
          if (dryRun || unlinkLink(p)) r.links++; else fail(p, 'LINK');
        } else if (s.isDirectory()) {
          stack.push([p, depth + 1, false]);
        } else {
          if (dryRun) { r.files++; r.bytesFreed += s.size; continue; }
          const code = unlinkFile(p);
          if (code) fail(p, code); else { r.files++; r.bytesFreed += s.size; }
        }
      }
      continue;
    }
    stack.pop();
    const keep = (depth === 0 && (keepRoot || keepFirstLevelDirs)) || (depth === 1 && keepFirstLevelDirs);
    if (keep) continue;
    if (dryRun) { r.dirs++; continue; }
    try { fs.rmdirSync(d); r.dirs++; } catch (e) { if (e.code !== 'ENOTEMPTY') fail(d, e.code || 'RMDIR'); }
  }
  return r;
}
