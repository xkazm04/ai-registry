// preflight.mjs - what the machine and the seats can actually carry, checked before the clock.
//
// WHY: hackathon 1.0.0's first run (2026-10-28) was killed at 16:19 by the host harness, not by
// a seat: Claude Code reaps background shells when the machine runs low on memory, and four
// entries (each a seat CLI, a dev server and a Python sidecar, 1.5-4 GB) shared a box with
// another session's native builds. Every seat died with the tree; the dev servers survived as
// orphans. The resume design held, but the clock lost the time. So `run` sizes the field
// against free memory before it starts, and says how to launch out of the reaper's reach.
// Pure: callers pass os.freemem()/totalmem() and process.env.

export const RAM_PER_ENTRY_GB = 3;
export const RAM_RESERVE_GB = 4;
const GB = 1024 ** 3;
const r1 = (n) => Math.round(n * 10) / 10;

/** { ok, freeGb, totalGb, needGb, line } - `entries` running at once, each `perEntryGb`, plus a reserve. */
export function ramCheck({ freeBytes, totalBytes, entries, perEntryGb = RAM_PER_ENTRY_GB, reserveGb = RAM_RESERVE_GB }) {
  const needGb = r1(entries * perEntryGb + reserveGb);
  const freeGb = r1(freeBytes / GB);
  const totalGb = r1(totalBytes / GB);
  return {
    ok: freeGb >= needGb, freeGb, totalGb, needGb,
    line: `free RAM ${freeGb} of ${totalGb} GB; ${entries} entr${entries === 1 ? 'y' : 'ies'} x ${perEntryGb} GB + ${reserveGb} GB reserve = ${needGb} GB`,
  };
}

/** A warning when this process runs inside Claude Code with the memory-pressure reaper armed; else null. */
export function reaperNote(env = {}) {
  if (env.CLAUDECODE !== '1' && !env.CLAUDE_CODE_ENTRYPOINT) return null;
  if (env.CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP === '1') return null;
  return 'this run is a child of Claude Code, whose background shells are reaped under memory pressure '
    + '(a 1.0.0 run was killed that way). Launch it detached (Start-Process / nohup / setsid) or start '
    + 'Claude Code with CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1; a killed run resumes by re-running `run`, '
    + 'and seat dev servers it leaves behind must be killed by port.';
}

/**
 * The effort a seat really runs at. agy's model slugs carry the tier and stop at high (the contest
 * engine table clamps xhigh and max to high, and a slug that already ends -low/-medium/-high wins),
 * so a spec that says @xhigh would put a wrong label in the ledger and the judging pack.
 */
export function effectiveSpec(spec) {
  const m = String(spec).match(/^([a-z]+):([A-Za-z0-9._-]+)@([a-z]+)(#[A-Za-z0-9._-]+)?$/);
  if (!m || m[1] !== 'agy') return String(spec);
  const [, engine, model, effort, label = ''] = m;
  const slugTier = model.match(/-(low|medium|high)$/)?.[1];
  const tier = slugTier ?? (effort === 'xhigh' || effort === 'max' ? 'high' : effort);
  return `${engine}:${model}@${tier}${label}`;
}
