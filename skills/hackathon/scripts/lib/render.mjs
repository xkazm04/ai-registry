// render.mjs - every text /hackathon writes for a person or a seat: briefs, board, judging pack.
//
// WHY renderTemplate throws: a brief with a literal `{{deadline}}` in it reaches a seat that then
// guesses its own clock. A placeholder the caller has no value for is a bug in the caller, found
// at render time instead of five hours later. Only the optional blocks may render empty.
//
// WHY the pages are hand-written HTML with no external request: the owner opens them from disk,
// sometimes offline, and the board must not leak a seat through a font or script URL either.
// Every value is escaped; the markdown renderer handles only what DEMO.md needs.

export const EMPTY_OK = new Set(['taste', 'repo_law', 'owner_note', 'dossier', 'session_line']);

/** Fill `{{name}}` placeholders in one pass. Throws on a placeholder with no (or an empty, non-optional) value. */
export function renderTemplate(template, vars, { allowEmpty = EMPTY_OK } = {}) {
  const missing = [];
  const empty = [];
  const out = String(template).replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (whole, name) => {
    if (!Object.prototype.hasOwnProperty.call(vars, name) || vars[name] === null || vars[name] === undefined) { missing.push(name); return whole; }
    const v = String(vars[name]);
    if (v === '' && !allowEmpty.has(name)) empty.push(name);
    return v;
  });
  if (missing.length) throw new Error(`template placeholder(s) with no value: ${[...new Set(missing)].join(', ')}`);
  if (empty.length) throw new Error(`template placeholder(s) rendered empty but not optional: ${[...new Set(empty)].join(', ')}`);
  return out;
}

/**
 * Push markdown headings down `by` levels (max h6), outside code fences: a TRACK.md that opens
 * with `# Track` is quoted under the brief's own `## The track` and must not outrank it.
 */
export function demoteHeadings(md, by = 2) {
  let fenced = false;
  return String(md ?? '').split('\n').map((line) => {
    if (/^\s*```/.test(line)) { fenced = !fenced; return line; }
    if (fenced) return line;
    const m = line.match(/^(#{1,6})(\s.*)$/);
    return m ? `${'#'.repeat(Math.min(6, m[1].length + by))}${m[2]}` : line;
  }).join('\n');
}

export const escapeHtml =(s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const inline = (s) => escapeHtml(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

/** Minimal markdown: headings, lists, fenced code, paragraphs, inline code and bold. Everything escaped. */
export function markdownToHtml(md) {
  const lines = String(md ?? '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = [];
  let list = null; // 'ul' | 'ol'
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fence = line.match(/^\s*```/);
    if (fence) {
      flushPara(); closeList();
      const body = [];
      for (i += 1; i < lines.length && !/^\s*```/.test(lines[i]); i += 1) body.push(lines[i]);
      out.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushPara(); closeList(); const lvl = Math.min(6, h[1].length + 2); out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); continue; }
    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const kind = ul ? 'ul' : 'ol';
      if (list !== kind) { closeList(); out.push(`<${kind}>`); list = kind; }
      out.push(`<li>${inline((ul ?? ol)[1])}</li>`);
      continue;
    }
    if (!line.trim()) { flushPara(); closeList(); continue; }
    if (list && /^\s+\S/.test(line)) { out[out.length - 1] = out[out.length - 1].replace(/<\/li>$/, ` ${inline(line.trim())}</li>`); continue; }
    closeList();
    para.push(line.trim());
  }
  flushPara(); closeList();
  return out.join('\n');
}

// ---------------------------------------------------------------- idea card as markdown

export function ideaMarkdown(idea, { heading = '###' } = {}) {
  const list = (xs) => (xs.length ? xs.map((x) => `- ${x}`).join('\n') : '- (none)');
  return [
    `${heading} ${idea.id ? `${idea.id} - ` : ''}${idea.title}`,
    '',
    `**Surface:** ${idea.surface}`,
    '',
    `**Pitch.** ${idea.pitch}`,
    '',
    `**User moment.** ${idea.user_moment}`,
    '',
    `**Insight.** ${idea.insight}`,
    '',
    `**Baseline.** ${idea.baseline}`,
    '',
    `**Mastery.** ${idea.mastery}`,
    '',
    `**Risks.** ${idea.risks}`,
    '',
    '**Stretch**',
    '',
    list(idea.stretch ?? []),
    '',
    '**Grounding**',
    '',
    list(idea.grounding ?? []),
    '',
  ].join('\n');
}

// ---------------------------------------------------------------- shared page shell

const CSS = `
:root{--bg:#f7f7f5;--panel:#ffffff;--ink:#1d1d1b;--muted:#5d5d58;--line:#dcdcd6;--accent:#2f5bd3;--accent-ink:#ffffff;--chip:#ecece7;--pick:#1f7a4d;--fe:#7a4fd0;--be:#b0601a;--both:#2f7f8f;--warn:#a33b2b;--code:#f0f0ec}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#141413;--panel:#1d1d1b;--ink:#ecece7;--muted:#a8a8a0;--line:#34342f;--accent:#7d9cf0;--accent-ink:#0d0d0c;--chip:#2a2a26;--pick:#4cc38a;--fe:#b294f2;--be:#e39a5a;--both:#69bccb;--warn:#ef8a78;--code:#262622}}
:root[data-theme="dark"]{--bg:#141413;--panel:#1d1d1b;--ink:#ecece7;--muted:#a8a8a0;--line:#34342f;--accent:#7d9cf0;--accent-ink:#0d0d0c;--chip:#2a2a26;--pick:#4cc38a;--fe:#b294f2;--be:#e39a5a;--both:#69bccb;--warn:#ef8a78;--code:#262622}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:1560px;margin:0 auto;padding:0 16px 48px}
header.top{padding:24px 0 8px}
h1{font-size:1.6rem;line-height:1.2;margin:0 0 4px}
.meta{color:var(--muted);margin:0}
h2{font-size:1.15rem;margin:28px 0 4px}
h2 .n{color:var(--muted);font-weight:400;font-size:.95rem}
.note{color:var(--muted);margin:0 0 12px;max-width:80ch}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr));gap:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 16px;min-width:0;overflow-wrap:anywhere}
.card.picked{border:2px solid var(--pick)}
.card .head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.card .id{font-size:1.9rem;font-weight:700;line-height:1;letter-spacing:-.02em;margin-right:4px}
.badge{font-size:.75rem;padding:2px 8px;border-radius:99px;background:var(--chip);border:1px solid var(--line)}
.badge.frontend{color:var(--fe)}.badge.backend{color:var(--be)}.badge.both{color:var(--both)}
.seat{font-size:.75rem;padding:2px 8px;border-radius:6px;background:var(--chip);font-family:ui-monospace,Consolas,monospace}
.pick{font-size:.75rem;font-weight:600;color:var(--pick)}
.card h3{font-size:1.05rem;margin:10px 0 4px;line-height:1.3}
.pitch{margin:0 0 8px}
dl{margin:0}
dt{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-top:8px}
dd{margin:2px 0 0}
.card ul{margin:2px 0 0;padding-left:18px}
.card ul.ground{list-style:none;padding:0;font-size:.85rem}
.card ul.ground li{border-top:1px dashed var(--line);padding:2px 0}
.card ul.ground code{font-size:.82rem}
code{font-family:ui-monospace,Consolas,monospace;background:var(--code);padding:0 4px;border-radius:4px}
pre{background:var(--code);padding:10px;border-radius:8px;overflow-x:auto}
pre code{padding:0;background:none}
.filters{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.filters button{font:inherit;font-size:.9rem;padding:6px 12px;border-radius:99px;border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer;min-height:36px}
.filters button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.filters input{font:inherit;flex:1 1 200px;min-width:0;padding:6px 12px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--ink);min-height:36px}
.filters .count{color:var(--muted);font-size:.85rem}
.hidden{display:none !important}
section.entry{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px;margin:18px 0;overflow-wrap:anywhere}
section.entry h2{margin-top:0}
table{border-collapse:collapse;width:100%;font-size:.9rem;display:block;overflow-x:auto}
th,td{border-bottom:1px solid var(--line);padding:4px 8px;text-align:left;vertical-align:top}
.pass{color:var(--pick);font-weight:600}.fail{color:var(--warn);font-weight:600}
.shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:10px}
.shots img{width:100%;height:auto;border:1px solid var(--line);border-radius:8px}
details{margin:8px 0}
summary{cursor:pointer;font-weight:600}
.demo{border-left:3px solid var(--accent);padding-left:12px}
`;

const page = (title, body, script = '') => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
${body}
</div>
${script ? `<script>${script}</script>` : ''}
</body>
</html>
`;

// ---------------------------------------------------------------- board

const FILTER_JS = `
(function(){
  var cards=[].slice.call(document.querySelectorAll('.card'));
  var groups=[].slice.call(document.querySelectorAll('section.group'));
  var buttons=[].slice.call(document.querySelectorAll('.filters button'));
  var input=document.getElementById('q');var count=document.getElementById('count');
  var surface='all';
  cards.forEach(function(c){c.dataset.text=c.textContent.toLowerCase();});
  function apply(){
    var q=(input.value||'').trim().toLowerCase();var shown=0;
    cards.forEach(function(c){
      var ok=(surface==='all'||c.dataset.surface===surface)&&(!q||c.dataset.text.indexOf(q)!==-1);
      c.classList.toggle('hidden',!ok);if(ok)shown++;
    });
    groups.forEach(function(g){g.classList.toggle('hidden',!g.querySelector('.card:not(.hidden)'));});
    count.textContent=shown+' of '+cards.length+' ideas';
  }
  buttons.forEach(function(b){b.addEventListener('click',function(){
    surface=b.dataset.surface;buttons.forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});apply();});});
  input.addEventListener('input',apply);apply();
})();
`;

function cardHtml(idea, { seat = null, pick = null } = {}) {
  const field = (label, v) => `<dt>${label}</dt><dd>${escapeHtml(v)}</dd>`;
  const list = (xs, cls = '') => (xs.length ? `<ul${cls ? ` class="${cls}"` : ''}>${xs.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>` : '<dd>(none)</dd>');
  return `<article class="card${pick ? ' picked' : ''}" data-surface="${escapeHtml(idea.surface)}" id="${escapeHtml(idea.id)}">
<div class="head"><span class="id">${escapeHtml(idea.id)}</span><span class="badge ${escapeHtml(idea.surface)}">${escapeHtml(idea.surface)}</span>${seat ? `<span class="seat">${escapeHtml(seat)}</span>` : ''}${pick ? `<span class="pick">Shortlisted - ${escapeHtml(pick)}</span>` : ''}</div>
<h3>${escapeHtml(idea.title)}</h3>
<p class="pitch">${escapeHtml(idea.pitch)}</p>
<dl>${field('User moment', idea.user_moment)}${field('Insight', idea.insight)}${field('Baseline', idea.baseline)}${field('Mastery', idea.mastery)}${field('Risks', idea.risks)}
<dt>Stretch</dt><dd>${list(idea.stretch)}</dd>
<dt>Grounding</dt><dd>${list(idea.grounding, 'ground')}</dd></dl>
</article>`;
}

/**
 * The board page. `reveal` = { seatOf: {ideaId: spec}, pickOf: {ideaId: entryId} } for the revealed
 * copy; without it the page is blind and carries no seat string at all.
 */
export function boardHtml({ title, generated, groups, ideas, seatCount, reveal = null }) {
  const byId = Object.fromEntries(ideas.map((i) => [i.id, i]));
  const sections = groups.map((g) => `<section class="group">
<h2>${escapeHtml(g.name)} <span class="n">(${g.ideas.length})</span></h2>
${g.note ? `<p class="note">${escapeHtml(g.note)}</p>` : ''}
<div class="grid">
${g.ideas.map((id) => byId[id]).filter(Boolean).map((i) => cardHtml(i, reveal ? { seat: reveal.seatOf[i.id], pick: reveal.pickOf[i.id] } : {})).join('\n')}
</div>
</section>`).join('\n');
  const body = `<header class="top"><h1>${escapeHtml(title)}</h1>
<p class="meta">${ideas.length} ideas from ${seatCount} seats - ${reveal ? 'seats revealed' : 'blind board: seats are letters'} - generated ${escapeHtml(generated)}</p></header>
<div class="filters" role="toolbar" aria-label="Filter ideas">
<button type="button" data-surface="all" aria-pressed="true">All</button>
<button type="button" data-surface="frontend" aria-pressed="false">Frontend</button>
<button type="button" data-surface="backend" aria-pressed="false">Backend</button>
<button type="button" data-surface="both" aria-pressed="false">Both</button>
<input id="q" type="search" placeholder="Search ideas" aria-label="Search ideas">
<span class="count" id="count"></span>
</div>
<main>
${sections}
</main>`;
  return page(`${title} - board${reveal ? ' (revealed)' : ''}`, body, FILTER_JS);
}

export function boardMarkdown({ title, generated, groups, ideas, reveal = null }) {
  const byId = Object.fromEntries(ideas.map((i) => [i.id, i]));
  const out = [`# ${title} - board${reveal ? ' (revealed)' : ''}`, '', `${ideas.length} ideas, generated ${generated}.`, ''];
  for (const g of groups) {
    out.push(`## ${g.name} (${g.ideas.length})`, '');
    if (g.note) out.push(g.note, '');
    for (const id of g.ideas) {
      const i = byId[id];
      if (!i) continue;
      out.push(ideaMarkdown(i));
      if (reveal) out.push(`_Seat: ${reveal.seatOf[id] ?? '?'}${reveal.pickOf[id] ? ` - shortlisted as ${reveal.pickOf[id]}` : ''}_`, '');
    }
  }
  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

// ---------------------------------------------------------------- judging pack

/**
 * entries: [{ entry, title, builder, pitch, worktree, port, branch, sessions, commits: [line],
 *   shortstat, files: [path], filesTotal, gates: [{ cmd, ok, exit, timed_out, tail }], demo, hacklog,
 *   shots: [relPath], dirty }]
 */
export function judgingHtml({ title, generated, base, entries }) {
  const sessionsTable = (ss) => (ss.length
    ? `<table><thead><tr><th>#</th><th>Kind</th><th>Outcome</th><th>Wall</th><th>Started</th><th>Commit after</th></tr></thead><tbody>${ss.map((s) => `<tr><td>${s.n}</td><td>${escapeHtml(s.kind)}</td><td>${escapeHtml(s.outcome ?? 'running')}</td><td>${s.wall_s != null ? `${Math.round(s.wall_s / 60)} min` : '-'}</td><td>${escapeHtml(String(s.started ?? '').slice(11, 16))}</td><td><code>${escapeHtml(s.sha_after ?? '-')}</code></td></tr>`).join('')}</tbody></table>`
    : '<p>No sessions ran.</p>');
  const gates = (gs) => (gs === null ? '<p>Gates skipped (--skip-gates).</p>' : gs.length
    ? gs.map((g) => `<details${g.ok ? '' : ' open'}><summary><span class="${g.ok ? 'pass' : 'fail'}">${g.ok ? 'PASS' : 'FAIL'}</span> <code>${escapeHtml(g.cmd)}</code>${g.timed_out ? ' (timed out)' : ''}</summary><pre><code>${escapeHtml(g.tail)}</code></pre></details>`).join('\n')
    : '<p>No gates declared.</p>');
  const sections = entries.map((e) => `<section class="entry" id="${escapeHtml(e.entry)}">
<h2>${escapeHtml(e.entry)} - ${escapeHtml(e.title)}</h2>
<p class="meta">Built by <span class="seat">${escapeHtml(e.builder)}</span> - ${e.pack ? `pack (${escapeHtml(e.pack.focus)}) fusing ` : 'idea '}${escapeHtml(e.ideas ? e.ideas.join(', ') : e.idea)} - branch <code>${escapeHtml(e.branch)}</code></p>
<p>${escapeHtml(e.pitch)}</p>
${e.pack ? `<details><summary>Fusion brief (${escapeHtml(e.pack.focus)})</summary><div>${markdownToHtml(e.pack.brief)}</div>${e.pack.note ? `<p><strong>Owner's note:</strong> ${escapeHtml(e.pack.note)}</p>` : ''}</details>` : ''}
<p><strong>Run it:</strong> worktree <code>${escapeHtml(e.worktree)}</code>, port <code>${escapeHtml(e.port)}</code>${e.dirty ? ` - <span class="fail">${e.dirty} uncommitted file(s)</span>` : ''}</p>
<h3>Demo</h3>
<div class="demo">${e.demo ? markdownToHtml(e.demo) : '<p>No DEMO.md was written.</p>'}</div>
${e.shots.length ? `<h3>Screenshots</h3><div class="shots">${e.shots.map((s) => `<a href="${escapeHtml(s)}"><img src="${escapeHtml(s)}" alt="${escapeHtml(s)}" loading="lazy"></a>`).join('')}</div>` : ''}
<h3>Sessions</h3>
${sessionsTable(e.sessions)}
<h3>Change</h3>
<p>${escapeHtml(e.shortstat || 'no change against the base')}</p>
${e.files.length ? `<details><summary>${e.filesTotal} changed file(s)${e.filesTotal > e.files.length ? `, first ${e.files.length}` : ''}</summary><ul>${e.files.map((f) => `<li><code>${escapeHtml(f)}</code></li>`).join('')}</ul></details>` : ''}
${e.commits.length ? `<details><summary>${e.commits.length} commit(s)</summary><ul>${e.commits.map((c) => `<li><code>${escapeHtml(c)}</code></li>`).join('')}</ul></details>` : '<p>No commits.</p>'}
<h3>Gates</h3>
${gates(e.gates)}
${e.hacklog ? `<details><summary>HACKLOG.md</summary><div>${markdownToHtml(e.hacklog)}</div></details>` : ''}
</section>`).join('\n');
  const toc = entries.map((e) => `<a href="#${escapeHtml(e.entry)}">${escapeHtml(e.entry)} - ${escapeHtml(e.title)}</a>`).join(' &middot; ');
  const body = `<header class="top"><h1>${escapeHtml(title)} - judging pack</h1>
<p class="meta">${entries.length} entries against base <code>${escapeHtml(String(base).slice(0, 12))}</code> - collected ${escapeHtml(generated)}</p>
<p>${toc}</p></header>
<main>
${sections}
</main>`;
  return page(`${title} - judging`, body);
}

export function judgingMarkdown({ title, generated, base, entries }) {
  const out = [`# ${title} - judging pack`, '', `Base \`${String(base).slice(0, 12)}\`, collected ${generated}.`, ''];
  for (const e of entries) {
    out.push(`## ${e.entry} - ${e.title}`, '', `- Builder: ${e.builder}`, `- ${e.pack ? `Pack (${e.pack.focus}) fusing` : 'Idea:'} ${e.ideas ? e.ideas.join(', ') : e.idea}`, `- Branch: \`${e.branch}\``, `- Worktree: \`${e.worktree}\`, port ${e.port}`,
      `- Sessions: ${e.sessions.map((s) => `${s.n} ${s.kind} ${s.outcome ?? 'running'}`).join('; ') || 'none'}`,
      `- Change: ${e.shortstat || 'none'}`, `- Commits: ${e.commits.length}`);
    if (e.dirty) out.push(`- Uncommitted files: ${e.dirty}`);
    out.push('', e.pitch, '', '### Gates', '');
    if (e.gates === null) out.push('Skipped.');
    else if (!e.gates.length) out.push('None declared.');
    else for (const g of e.gates) out.push(`- ${g.ok ? 'PASS' : 'FAIL'} \`${g.cmd}\`${g.timed_out ? ' (timed out)' : ''}`);
    out.push('', '### Demo', '', e.demo ? e.demo.trim() : '_No DEMO.md._', '');
    if (e.shots.length) out.push('### Screenshots', '', ...e.shots.map((s) => `- ${s}`), '');
  }
  return `${out.join('\n').trim()}\n`;
}
