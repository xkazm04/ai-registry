// Pure half of the router: one page that links every BLINDED variant of one or more contests.
//
// The owner reviews in a browser, across contests, and the gallery cannot serve that: it names the
// seats. The router links only the redacted copies under judging/entries, shows each variant's
// state through a reveal round (kept and mastered, or eliminated by its own author), and keeps
// eliminated variants clickable until the owner decides the contest. Nothing here touches the
// filesystem; contest.mjs gathers the rows and writes the file.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** An absolute path as a file:// URL a browser opens from any other file. */
export const fileHref = (abs) => `file:///${String(abs).replace(/\\/g, '/').replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/').replace(/^([A-Za-z])%3A/, '$1:')}`;

const STATE = {
  open: '',
  kept: '<em class="tag kept">kept</em>',
  eliminated: '<em class="tag cut">eliminated</em>',
  winner: '<em class="tag win">winner</em>',
  'runner-up': '<em class="tag kept">runner-up</em>',
  combined: '<em class="tag win">in the combined design</em>',
  shortlisted: '<em class="tag kept">shortlisted</em>',
};

function card(letter, v, closed) {
  if (!v.present) return `<div class="card empty"><b>${letter}/${v.n}</b><span>not delivered</span></div>`;
  // Eliminated variants stay clickable until the owner decides the contest, then only their names remain.
  if (closed && v.state === 'eliminated') return `<div class="card cut"><div class="main"><b>${letter}/${v.n} ${STATE.eliminated}</b><span>${esc(v.concept || 'untitled')}</span><small>cut by its author; contest decided</small></div></div>`;
  const cls = v.state === 'eliminated' ? 'card cut' : 'card';
  const mastered = v.mastered
    ? `<a class="sub strong" href="${esc(v.mastered.href)}" target="_blank">mastered in reveal &rarr; ${esc(v.mastered.concept || '')}</a><a class="sub" href="${esc(v.mastered.notesHref)}" target="_blank">reveal notes</a>`
    : '';
  const score = v.score ? `<small class="score">panel ${v.score.mean.toFixed(2)} &middot; #${v.score.rank} of ${v.score.of} &middot; spread ${v.score.spread.toFixed(1)}</small>` : '';
  return `<div class="${cls}"><a class="main" href="${esc(v.href)}" target="_blank"><b>${letter}/${v.n} ${STATE[v.state] ?? ''}</b><span>${esc(v.concept || 'untitled')}</span>${score}<small>${Math.round((v.bytes ?? 0) / 1024)} KB${v.state === 'eliminated' ? ' &middot; cut by its author, open until the verdict' : ''}</small></a>${mastered}<a class="sub" href="${esc(v.notesHref)}" target="_blank">notes</a></div>`;
}

function section(c, i) {
  const phase = c.closed ? 'decided' : c.shortlisted ? 'shortlisted, decision pending' : c.reveal === 'collected' ? 'reveal collected' : c.reveal === 'pending' ? 'reveal running' : c.collected ? 'round one collected' : 'building';
  const links = [c.designHref && `<a class="design" href="${esc(c.designHref)}" target="_blank">final design</a>`, c.noteHref && `<a class="design" href="${esc(c.noteHref)}" target="_blank">what it waits on</a>`, c.briefHref && `<a href="${esc(c.briefHref)}" target="_blank">brief</a>`, c.materialHref && `<a href="${esc(c.materialHref)}" target="_blank">material</a>`].filter(Boolean).join(' &middot; ');
  const head = `<header><span class="num">${i + 1}</span><div><h2>${esc(c.title)}</h2><p class="meta">${esc(c.project ?? '')} &middot; <code>${esc(c.id)}</code> &middot; <span class="phase">${phase}</span>${links ? ` &middot; ${links}` : ''}</p></div></header>`;
  if (!c.collected) return `<section>${head}<p class="pending">Not collected yet.</p></section>`;
  const rows = c.entries.map((e) => {
    const delivered = e.variants.filter((v) => v.present).length;
    return `<div class="row"><div class="letter">${e.letter}${delivered ? '' : '<small>no entry</small>'}</div><div class="cards">${e.variants.map((v) => card(e.letter, v, c.closed)).join('')}</div></div>`;
  }).join('');
  return `<section>${head}${rows}</section>`;
}

/** contests: [{ id, title, project, collected, closed, reveal, briefHref, materialHref, entries: [{ letter, variants: [{ n, present, concept, bytes, href, notesHref, state, mastered? }] }] }] */
export function renderRouter({ title, contests, generated = new Date().toISOString() }) {
  const count = contests.reduce((s, c) => s + (c.entries ?? []).reduce((t, e) => t + e.variants.filter((v) => v.present).length, 0), 0);
  const cut = contests.reduce((s, c) => s + (c.entries ?? []).reduce((t, e) => t + e.variants.filter((v) => v.state === 'eliminated').length, 0), 0);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--bg:#f6f4ef;--panel:#fff;--ink:#1d1d1b;--muted:#6b6a64;--line:#e2ded4;--accent:#9a4d1c;--empty:#f0ede6;--kept:#2f7a4f;--cut:#a23b2a}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#15171a;--panel:#1e2125;--ink:#ecebe7;--muted:#9a9890;--line:#30343a;--accent:#e0a36e;--empty:#1a1c1f;--kept:#6cc28f;--cut:#e0826f}}
:root[data-theme="dark"]{--bg:#15171a;--panel:#1e2125;--ink:#ecebe7;--muted:#9a9890;--line:#30343a;--accent:#e0a36e;--empty:#1a1c1f;--kept:#6cc28f;--cut:#e0826f}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1180px;margin:0 auto;padding:32px 16px 64px}h1{font-size:28px;margin:0 0 4px}.lede{color:var(--muted);margin:0 0 28px;max-width:780px}
section{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:20px 22px;margin-bottom:22px}
header{display:flex;gap:16px;align-items:flex-start;margin-bottom:14px}
.num{flex:none;width:34px;height:34px;border-radius:50%;background:var(--accent);color:var(--panel);display:grid;place-items:center;font-weight:700}
h2{margin:0;font-size:21px}.meta{margin:2px 0 0;color:var(--muted);font-size:14px}.meta a,.sub{color:var(--accent)}code{font-size:13px}.phase{font-weight:600;color:var(--ink)}
.row{display:flex;gap:14px;align-items:stretch;padding:10px 0;border-top:1px solid var(--line)}
.letter{flex:none;width:44px;font-size:24px;font-weight:700;display:flex;flex-direction:column;justify-content:center}.letter small{font-size:11px;font-weight:400;color:var(--muted)}
.cards{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.card{border:1px solid var(--line);border-radius:10px;display:flex;flex-direction:column;overflow:hidden}
.card .main{flex:1;display:flex;flex-direction:column;gap:2px;padding:12px 14px;color:inherit;text-decoration:none}
.card .main:hover{background:color-mix(in srgb,var(--accent) 10%,transparent)}
.card b{color:var(--accent);font-size:14px}.card span{font-size:17px;font-weight:600}.card small{color:var(--muted);font-size:13px}
.sub{font-size:14px;padding:6px 14px;border-top:1px solid var(--line);text-decoration:none}.sub.strong{font-weight:600;color:var(--kept)}
.card.cut{opacity:.55}.card.cut span{text-decoration:line-through}.card.cut:hover{opacity:1}
.card.empty{background:var(--empty);padding:12px 14px;color:var(--muted)}.card.empty span{font-size:15px;font-weight:400}
.tag{font-style:normal;font-size:12px;font-weight:600;padding:1px 7px;border-radius:9px;margin-left:4px;border:1px solid currentColor}
.tag.kept{color:var(--kept)}.tag.cut{color:var(--cut)}.tag.win{color:var(--panel);background:var(--kept);border-color:var(--kept)}
.card small.score{color:var(--ink);font-weight:600}.meta a.design{font-weight:700;color:var(--kept)}
.pending{color:var(--muted);font-style:italic;margin:0}footer{color:var(--muted);font-size:14px}
@media (max-width:760px){.cards{grid-template-columns:1fr}.row{flex-direction:column}.letter{flex-direction:row;gap:8px;align-items:baseline}}
</style></head><body><main>
<h1>${esc(title)}</h1>
<p class="lede">${count} variant(s) across ${contests.length} contest(s)${cut ? `, ${cut} eliminated in reveal` : ''}. Every link opens a blinded copy: no model or vendor names, and letters are shuffled per contest, so B in one contest is not B in another. The scoreboard and gallery are not linked because they name the seats; panel scores appear as a mean, spread and rank only. An eliminated variant stays clickable until the owner decides the contest.</p>
${contests.map(section).join('\n')}
<footer>Generated ${esc(generated.slice(0, 16).replace('T', ' '))} by contest.mjs</footer>
</main></body></html>
`;
}
