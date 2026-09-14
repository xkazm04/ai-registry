// report.mjs - human and JSON output. Builtins only.

const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** A short span gets its context so "—" is readable: "...before [—] after...". */
export function showSpan(f) {
  const span = f.span || '';
  if (span.length >= 12 || !f.text) return `"${clip(span.replace(/\s+/g, ' '), 90)}"`;
  const from = Math.max(0, f.index - 28);
  const to = Math.min(f.text.length, f.index + span.length + 28);
  const pre = (from > 0 ? '…' : '') + f.text.slice(from, f.index);
  const post = f.text.slice(f.index + span.length, to) + (to < f.text.length ? '…' : '');
  return `"${`${pre}[${span}]${post}`.replace(/\s+/g, ' ')}"`;
}

export function summaryLine(s) {
  return `checked ${s.strings} strings (${s.fragments} fragments) in ${s.files} files from ${s.sources} sources; ${s.unreadable} unreadable; errors ${s.errors} (new ${s.newErrors}), warnings ${s.warnings}`;
}

export function formatHuman(findings, summary, { errorsOnly = false, limit = 0, allFindings = false } = {}) {
  const lines = [];
  // Default: print what can block (new errors) and what is new to the reader (warnings are
  // counted, not listed). A pre-push run on a catalog with 865 baselined errors must show the
  // one new error, not bury it; --all-findings prints everything for triage.
  const shown = findings.filter((f) => {
    if (errorsOnly && f.severity !== 'error') return false;
    if (allFindings) return true;
    return f.severity === 'error' && !f.baselined;
  });
  const hiddenBaselined = allFindings ? 0 : findings.filter((f) => f.severity === 'error' && f.baselined).length;
  const hiddenWarnings = allFindings || errorsOnly ? 0 : findings.filter((f) => f.severity !== 'error').length;
  if (hiddenBaselined || hiddenWarnings) lines.push(`not listed: ${hiddenBaselined} baselined error(s), ${hiddenWarnings} warning(s) - add --all-findings to print them`);
  const byFile = new Map();
  for (const f of shown) { if (!byFile.has(f.file)) byFile.set(f.file, []); byFile.get(f.file).push(f); }
  let printed = 0;
  outer: for (const [file, list] of [...byFile.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(file);
    list.sort((a, b) => (a.line - b.line) || a.rule.localeCompare(b.rule));
    for (const f of list) {
      if (limit && printed >= limit) { lines.push(`  ... ${shown.length - printed} more finding(s) not printed (--limit ${limit}; use --json for all)`); break outer; }
      const mark = f.severity === 'error' ? (f.baselined ? 'e' : 'E') : 'w';
      const sugg = f.suggestion ? ` -> "${f.suggestion}"` : '';
      lines.push(`  ${mark} ${file}:${f.line} ${f.key || '-'} — ${f.rule} ${f.message} — ${showSpan(f)}${sugg}`);
      printed += 1;
    }
  }
  if (shown.length) lines.push('', 'legend: E new error (blocks), e baselined error, w warning');
  const byRule = new Map();
  for (const f of findings) {
    const r = byRule.get(f.rule) || { e: 0, w: 0 };
    if (f.severity === 'error') r.e += 1; else r.w += 1;
    byRule.set(f.rule, r);
  }
  if (byRule.size) lines.push(`by rule: ${[...byRule.entries()].sort((a, b) => (b[1].e + b[1].w) - (a[1].e + a[1].w)).map(([id, r]) => `${id} ${r.e ? `${r.e}E` : ''}${r.e && r.w ? '/' : ''}${r.w ? `${r.w}W` : ''}`).join(', ')}`);
  for (const n of summary.notes || []) lines.push(`note: ${n}`);
  lines.push(summaryLine(summary));
  return lines.join('\n');
}

export function formatJson(findings, summary) {
  return JSON.stringify({
    summary,
    findings: findings.map(({ record, ...f }) => { void record; return f; }),
  }, null, 2);
}
