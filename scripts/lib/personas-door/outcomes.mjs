// Idea outcomes that survive the app being down: replay the spool scan-sweep's `door.mjs outcome` wrote.
//
// Why: after a Lane B merge the director posts what happened to each approved card (POST
// /dev-tools/ideas/{id}/outcome). personas c2r2 (2026-10-31) posted 58 through a one-off helper; the skill's verb
// now posts directly when the app is up and spools the validated body to <spool>/outcomes.jsonl when it is not.
// This module drains that file through the same door, so an outcome is as durable as a filed card.
// The body was validated before it was spooled (skills/scan-sweep/scripts/filing.mjs toOutcome); it is posted verbatim.
import { call, appUp, appendSpool, pending } from './door.mjs';

/** Drain queued outcomes. A post that lands is marked done; one the app refuses stays queued with its error. */
export async function sync() {
  const queued = pending('outcomes');
  if (!queued.length) return { drained: 0, left: 0, results: [] };
  if (!(await appUp())) return { drained: 0, left: queued.length, results: [], appDown: true };
  const results = [];
  for (const e of queued) {
    try {
      const r = await call('POST', `/ideas/${encodeURIComponent(e.ideaId)}/outcome`, e.body);
      appendSpool('outcomes', { id: e.id, state: 'done', doneAt: new Date().toISOString(), ideaStatus: r?.ideaStatus ?? null });
      results.push({ ideaId: e.ideaId, outcome: e.body?.outcome, posted: true });
    } catch (err) {
      appendSpool('outcomes', { id: e.id, state: 'queued', lastError: err.message.slice(0, 300), lastTriedAt: new Date().toISOString() });
      results.push({ ideaId: e.ideaId, outcome: e.body?.outcome, posted: false, error: err.message });
    }
  }
  const drained = results.filter((r) => r.posted).length;
  return { drained, left: queued.length - drained, results };
}
