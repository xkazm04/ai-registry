// ledger.mjs - the vault: an index of hackathons, one note per hackathon, and a per-seat ledger.
//
// WHY a JSON sidecar behind Seats.md: shortlist and verdict both write the ledger, and either may
// be re-run (a corrected pick, a second verdict note). Counting by appending would double a seat's
// numbers on every rerun. seats.json stores each hackathon's contribution under its id; a rerun
// replaces that one block and Seats.md is re-rendered from the sum, so the table is idempotent.
//
// A seat is keyed engine:model - effort and #label stripped - so its record accrues across the
// efforts it ran at. Pure: callers read and write the files.

export const seatKey = (spec) => {
  const m = String(spec).match(/^([a-z]+):([A-Za-z0-9._-]+)@/);
  return m ? `${m[1]}:${m[2]}` : String(spec);
};

const cell = (s) => String(s ?? '').replace(/\r?\n+/g, ' ').replace(/\|/g, '\\|').trim();

/** Per-seat contribution of one hackathon state: { [engine:model]: { proposed, shortlisted, built, won, winning_idea } }. */
export function seatContributions(state) {
  const out = {};
  const row = (spec) => {
    const k = seatKey(spec);
    out[k] ??= { proposed: 0, shortlisted: 0, built: 0, won: 0, winning_idea: 0 };
    return out[k];
  };
  for (const ide of Object.values(state.ideation ?? {})) row(ide.spec).proposed += ide.count ?? 0;
  const proposerOf = (ideaId) => {
    const letter = String(ideaId).replace(/\d+$/, '');
    const seat = Object.values(state.ideation ?? {}).find((x) => x.letter === letter);
    return seat?.spec ?? null;
  };
  // An idea fused into two packs is one shortlisting for its proposer, not two.
  const distinct = [...new Set((state.shortlist ?? []).flatMap((r) => r.ideas ?? (r.idea ? [r.idea] : [])))];
  for (const idea of distinct) { const p = proposerOf(idea); if (p) row(p).shortlisted += 1; }
  for (const [id, e] of Object.entries(state.entries ?? {})) {
    if ((e.sessions ?? []).some((x) => x.outcome && x.outcome !== 'unavailable')) row(e.spec).built += 1;
    if (state.winner === id) {
      row(e.spec).won += 1;
      // A winning pack credits each distinct seat whose idea it fused, once.
      const proposers = new Set((e.ideas ?? [e.idea]).map(proposerOf).filter(Boolean));
      for (const p of proposers) row(p).winning_idea += 1;
    }
  }
  return out;
}

/** Replace hackathon `id`'s block in the ledger JSON. Returns a new object. */
export function upsertSeatLedger(ledger, id, contributions, meta = {}) {
  const next = { hackathons: { ...(ledger?.hackathons ?? {}) } };
  next.hackathons[id] = { ...meta, seats: contributions };
  return next;
}

/** Totals per seat across every hackathon block. */
export function seatTotals(ledger) {
  const totals = {};
  for (const h of Object.values(ledger?.hackathons ?? {})) {
    for (const [k, c] of Object.entries(h.seats ?? {})) {
      const t = (totals[k] ??= { hackathons: 0, proposed: 0, shortlisted: 0, built: 0, won: 0, winning_idea: 0 });
      t.hackathons += 1;
      for (const f of ['proposed', 'shortlisted', 'built', 'won', 'winning_idea']) t[f] += c[f] ?? 0;
    }
  }
  return totals;
}

export function renderSeatsMd(ledger) {
  const totals = seatTotals(ledger);
  const rows = Object.entries(totals).sort((a, b) => b[1].won - a[1].won || b[1].shortlisted - a[1].shortlisted || a[0].localeCompare(b[0]));
  const ids = Object.keys(ledger?.hackathons ?? {}).sort();
  return [
    '# Hackathon seats',
    '',
    'One row per seat (engine:model, effort stripped). Rendered from `seats.json`; edit that, not this table.',
    '`won` counts entries the seat built that the owner named winner; `winning idea` counts winners built from the seat\'s idea.',
    '',
    '| Seat | Hackathons | Ideas proposed | Shortlisted | Built | Won | Winning idea |',
    '|---|--:|--:|--:|--:|--:|--:|',
    ...rows.map(([k, t]) => `| ${cell(k)} | ${t.hackathons} | ${t.proposed} | ${t.shortlisted} | ${t.built} | ${t.won} | ${t.winning_idea} |`),
    '',
    `Hackathons counted: ${ids.length ? ids.join(', ') : 'none'}.`,
    '',
  ].join('\n');
}

const INDEX_HEADER = '# Hackathons\n\nOne row per hackathon, newest first. Each links its note.\n\n| Date | Id | Title | Mode | Hours | Entries | Winner | Note |\n|---|---|---|---|--:|--:|---|---|\n';

/** Hackathons.md upserted by id: the row whose Id cell links hackathons/<id> is replaced. */
export function upsertIndexRow(existing, row) {
  const idCell = `[[hackathons/${row.id}\\|${cell(row.id)}]]`;
  const line = `| ${cell(row.date)} | ${idCell} | ${cell(row.title)} | ${cell(row.mode)} | ${cell(row.hours)} | ${cell(row.entries)} | ${cell(row.winner)} | ${cell(row.note)} |`;
  const text = existing && existing.includes('| Date | Id |') ? existing.replace(/\r\n/g, '\n') : INDEX_HEADER;
  const lines = text.split('\n');
  const at = lines.findIndex((l) => l.includes(`[[hackathons/${row.id}\\|`));
  if (at !== -1) lines[at] = line;
  else {
    const sep = lines.findIndex((l) => l.startsWith('|---'));
    if (sep === -1) return `${INDEX_HEADER}${line}\n`;
    lines.splice(sep + 1, 0, line);
  }
  return `${lines.join('\n').replace(/\n*$/, '')}\n`;
}

/**
 * hackathons/<id>.md. `board` is [{ id, title, seat, shortlisted }]; `entries` carry the collected
 * numbers when collect ran ({ entry, title, spec, sessions, commits, shortstat, gates }).
 */
export function renderHackathonNote({ state, track, board, entries }) {
  const winner = state.winner ? state.entries[state.winner] : null;
  const runner = state.runner_up ? state.entries[state.runner_up] : null;
  const fm = [
    '---',
    `hackathon: ${JSON.stringify(state.id)}`,
    `title: ${JSON.stringify(state.title)}`,
    `date: ${String(state.created).slice(0, 10)}`,
    `mode: ${state.mode}`,
    `hours: ${state.hours}`,
    `ideators: [${state.ideators.map((s) => JSON.stringify(s)).join(', ')}]`,
    `winner: ${JSON.stringify(winner ? `${state.winner} - ${winner.title}` : (state.closed ? 'closed' : (state.dispositions ? 'fusion' : 'pending')))}`,
    ...(state.dispositions ? [`dispositions: {${Object.entries(state.dispositions).map(([e, d]) => `${e}: ${d}`).join(', ')}}`] : []),
    `winner_seat: ${JSON.stringify(winner?.spec ?? '')}`,
    'tags: [hackathon]',
    '---',
  ].join('\n');
  const ide = Object.entries(state.ideation ?? {}).map(([id, x]) => `| ${x.letter ?? '?'} | ${cell(x.spec)} | ${cell(x.outcome ?? 'not run')} | ${x.count ?? 0} | ${x.wall_s != null ? Math.round(x.wall_s / 60) : '-'} |`);
  const boardRows = board.map((b) => `| ${b.id} | ${cell(b.title)} | ${cell(b.seat)} | ${b.shortlisted ? `yes (${b.shortlisted})` : ''} |`);
  const entryRows = (entries ?? []).map((e) => `| ${e.entry} | ${cell(e.title)} | ${cell(e.ideas ?? '')} | ${cell(e.spec)} | ${cell(e.sessions)} | ${e.commits ?? '-'} | ${cell(e.shortstat ?? '-')} | ${cell(e.gates ?? '-')} |`);
  const fused = Object.entries(state.dispositions ?? {});
  const verdict = fused.length
    ? [`**Fusion:** the owner composed the follow-up from several entries${state.followup ? ` - next: ${state.followup}` : ''}.`, '',
      ...fused.map(([eid, d]) => `- **${d}** ${eid} - ${state.entries[eid]?.title ?? '?'} - built by ${state.entries[eid]?.spec ?? '?'}`)].join('\n')
    : state.closed
    ? `**Closed without a winner:** ${state.closed}`
    : winner ? `**Winner:** ${state.winner} - ${winner.title} - built by ${winner.spec}${runner ? `\n\n**Runner-up:** ${state.runner_up} - ${runner.title} - built by ${runner.spec}` : ''}`
      : '**Winner:** pending';
  return [
    fm, '', `# ${state.title}`, '', verdict, '',
    '## Track', '', String(track ?? '').trim() || '_(no track text)_', '',
    '## Ideators', '', '| Letter | Seat | Outcome | Ideas | Minutes |', '|---|---|---|--:|--:|', ...ide, '',
    '## Board (seats revealed)', '', '| Idea | Title | Seat | Shortlisted |', '|---|---|---|---|', ...boardRows, '',
    '## Entries', '', '| Entry | Title | Idea(s) | Builder | Sessions | Commits | Diffstat | Gates |', '|---|---|---|---|---|--:|---|---|', ...entryRows, '',
    '## The owner\'s note', '', String(state.verdict_note ?? '').trim() || '_(no verdict yet)_', '',
    ...(String(state.owner_note ?? '').trim() ? ['## The owner\'s shortlist note', '', String(state.owner_note).trim(), ''] : []),
  ].join('\n');
}
