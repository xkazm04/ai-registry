// lock.mjs - one writer at a time on hackathon.json.
//
// WHY: update() is read-modify-rename. In 1.0.0's first run a second `run --only e4
// --resume-limited` ran beside the main `run`, and a third (`run --only e2`) joined later; a write
// that lands between another process's read and rename is lost silently. The critical section is
// milliseconds, so a lock file made with O_EXCL, a short wait and a stale break are enough.
import fs from 'node:fs';

const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** Take `lockFile` (create-exclusive). A lock older than `staleMs` is broken; after `waitMs` it throws. */
export function acquireLock(lockFile, { staleMs = 30000, waitMs = 15000, sleep = sleepSync } = {}) {
  const t0 = Date.now();
  for (;;) {
    try {
      const fd = fs.openSync(lockFile, 'wx');
      fs.writeSync(fd, `${process.pid} ${new Date().toISOString()}\n`);
      fs.closeSync(fd);
      return;
    } catch (e) { if (e.code !== 'EEXIST') throw e; }
    let age;
    try { age = Date.now() - fs.statSync(lockFile).mtimeMs; } catch { continue; } // released between the two calls
    if (age > staleMs) { try { fs.rmSync(lockFile, { force: true }); } catch { /* another breaker won */ } continue; }
    if (Date.now() - t0 > waitMs) {
      throw new Error(`state lock ${lockFile} has been held for ${Math.round(age / 1000)} s - another hackathon step is writing; retry, or delete the lock if no step is running`);
    }
    sleep(25);
  }
}

export function releaseLock(lockFile) {
  try { fs.rmSync(lockFile, { force: true }); } catch { /* best effort */ }
}

/** Run `fn` holding `<file>.lock`; returns what `fn` returns. */
export function withFileLock(file, fn, opts) {
  const lockFile = `${file}.lock`;
  acquireLock(lockFile, opts);
  try { return fn(); } finally { releaseLock(lockFile); }
}
