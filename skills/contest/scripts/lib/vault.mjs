// Pure renderers for the Obsidian vault: one note per contest, an index, and the
// pattern ledger that turns winners into the next brief's bar. No filesystem here.

const yamlList = (xs) => (xs.length ? `[${xs.map((x) => JSON.stringify(String(x))).join(', ')}]` : '[]');

/** contests/<id>.md */
export function renderContestNote(c) {
  const { id, title, date, project, brief, participants, scoreboard, winner, runnerUp, judges, patterns, antiPatterns, decision, costs } = c;
  const shortlist = c.shortlist ?? [];
  const fm = [
    '---',
    `contest: ${JSON.stringify(id)}`,
    `title: ${JSON.stringify(title)}`,
    `date: ${date}`,
    `project: ${JSON.stringify(project)}`,
    `participants: ${yamlList(participants.map((p) => p.spec))}`,
    `judges: ${yamlList(judges)}`,
    `winner: ${JSON.stringify(winner?.label ?? '')}`,
    `winner_seat: ${JSON.stringify(winner?.spec ?? '')}`,
    `runner_up: ${JSON.stringify(runnerUp?.label ?? '')}`,
    `shortlist: ${yamlList(shortlist.map((x) => x.label))}`,
    `patterns: ${yamlList(patterns.map((p) => p.slug))}`,
    'tags: [contest]',
    '---',
  ].join('\n');
  const body = [
    `# ${title}`,
    '',
    `**Winner:** ${winner ? `${winner.label} - ${winner.spec} - "${winner.concept}"` : (shortlist.length ? 'not declared - the owner sent a shortlist into another round' : 'not declared')}`,
    ...shortlist.map((x) => `**Shortlisted:** ${x.label} - ${x.spec} - "${x.concept}"`),
    runnerUp ? `**Runner-up:** ${runnerUp.label} - ${runnerUp.spec} - "${runnerUp.concept}"` : '',
    '',
    '## The idea',
    '',
    brief.trim(),
    '',
    '## Scoreboard',
    '',
    scoreboard,
    '',
    costs ? `## Seats\n\n${costs}\n` : '',
    winner ? '## Why the winner won' : '## The owner\'s review',
    '',
    decision.trim() || '_(no decision note)_',
    '',
    '## Patterns this contest surfaced',
    '',
    ...(patterns.length ? patterns.map((p) => `- [[Patterns#${p.slug}|${p.slug}]] - ${p.statement}${p.from ? ` _(${p.from})_` : ''}`) : ['_(none recorded)_']),
    '',
    ...(c.panelPatterns?.length ? ['## What the panel also named', '', ...c.panelPatterns.map((p) => `- ${p}`), ''] : []),
    '## Anti-patterns',
    '',
    ...(antiPatterns.length ? antiPatterns.map((p) => `- ${p}`) : ['_(none recorded)_']),
    '',
  ].filter((l) => l !== null).join('\n');
  return `${fm}\n\n${body}`;
}

/** The Contests.md index: one row per contest, newest first. Idempotent on the row's id. */
export function upsertIndex(existing, row) {
  const header = '# Contests\n\nOne row per contest, newest first. Each links its note; the winner column names the seat that produced it.\n\n| Date | Contest | Project | Winner | Seat | Participants |\n|---|---|---|---|---|--:|\n';
  const line = `| ${row.date} | [[contests/${row.id}\\|${row.title}]] | ${row.project} | ${row.winner} | ${row.winnerSeat} | ${row.participants} |`;
  let text = existing && existing.includes('| Date |') ? existing : header;
  const lines = text.split('\n').filter((l) => !l.includes(`[[contests/${row.id}\\|`));
  const at = lines.findIndex((l) => l.startsWith('|---'));
  if (at === -1) return `${header}${line}\n`;
  lines.splice(at + 1, 0, line);
  return `${lines.join('\n').replace(/\n*$/, '')}\n`;
}

/**
 * Patterns.md: a ledger of design philosophies with a win count. A pattern is a `## slug`
 * section with a statement, evidence lines and a count. Winner-attributed patterns gain a
 * win; others gain a sighting. Existing sections are updated in place; new ones appended.
 */
export function upsertPatterns(existing, contestId, patterns) {
  const header = '# Patterns\n\nDesign philosophies that recur across contests. `wins` counts contests a pattern helped win; `seen` counts contests where a judge named it. The brief of every new contest quotes the top of this ledger as the bar to surpass - not to copy.\n';
  let text = existing && existing.trim() ? existing.replace(/\r\n/g, '\n') : header;
  for (const p of patterns) {
    const re = new RegExp(`\\n## ${p.slug.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\n([\\s\\S]*?)(?=\\n## |$)`);
    const m = text.match(re);
    const inc = (block, key, by) => block.replace(new RegExp(`^${key}: (\\d+)$`, 'm'), (_, n) => `${key}: ${Number(n) + by}`);
    const evidence = `- ${contestId}: ${p.evidence ?? p.statement}${p.winner ? ' (winner)' : ''}`;
    if (m) {
      let block = m[1];
      if (!block.includes(`- ${contestId}:`)) {
        block = inc(block, 'seen', 1);
        if (p.winner) block = inc(block, 'wins', 1);
        block = `${block.replace(/\n*$/, '')}\n${evidence}\n`;
      }
      text = text.replace(re, `\n## ${p.slug}\n${block}`);
    } else {
      text = `${text.replace(/\n*$/, '')}\n\n## ${p.slug}\n\n${p.statement}\n\nwins: ${p.winner ? 1 : 0}\nseen: 1\n\n${evidence}\n`;
    }
  }
  return text.replace(/\n*$/, '\n');
}

/** Parse Patterns.md into rows for the brief: [{slug, statement, wins, seen}] sorted by wins then seen. */
export function readPatterns(text) {
  if (!text) return [];
  const out = [];
  for (const m of text.replace(/\r\n/g, '\n').matchAll(/\n## ([^\n]+)\n([\s\S]*?)(?=\n## |$)/g)) {
    const block = m[2];
    const statement = (block.split('\n').map((l) => l.trim()).find((l) => l && !/^(wins|seen):/.test(l) && !l.startsWith('- ')) ?? '').trim();
    const wins = Number(block.match(/^wins: (\d+)$/m)?.[1] ?? 0);
    const seen = Number(block.match(/^seen: (\d+)$/m)?.[1] ?? 0);
    out.push({ slug: m[1].trim(), statement, wins, seen });
  }
  return out.sort((a, b) => b.wins - a.wins || b.seen - a.seen || a.slug.localeCompare(b.slug));
}

export const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
