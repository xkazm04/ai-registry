// Disk growth walk: where did the bytes written since a date go?
//
//   node growth-walk.mjs walk <root> <since YYYY-MM-DD> <out.json>   (~20 min for C:\, 11M files)
//   node growth-walk.mjs report <out.json> [prefix ...]              (top prefixes, or children of each prefix)
//
// Never follows symlinks or junctions. Skips Windows, the Recycle Bin and System Volume
// Information. Aggregates all bytes and bytes of files modified or created since the date,
// per directory prefix up to MAXDEPTH levels below <root>; walk a subfolder as its own root
// to see deeper.
import fs from 'node:fs';
import path from 'node:path';

const MAXDEPTH = 5;
const SEP = String.fromCharCode(92);
const SKIP = new Set(['c:\\windows', 'c:\\$recycle.bin', 'c:\\system volume information']);
const G = b => (b / 1e9).toFixed(1).padStart(7);

function walk(root, since, out) {
  const cutoff = Date.parse(since);
  const agg = new Map(); // prefix -> [allBytes, newBytes, newFiles]
  const add = (parts, bytes, isNew) => {
    for (let d = 1; d <= Math.min(parts.length, MAXDEPTH); d++) {
      const k = parts.slice(0, d).join(SEP);
      let a = agg.get(k);
      if (!a) agg.set(k, (a = [0, 0, 0]));
      a[0] += bytes;
      if (isNew) { a[1] += bytes; a[2]++; }
    }
  };
  let files = 0, errs = 0;
  const t0 = Date.now();
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    if (SKIP.has(dir.toLowerCase().replace(/\\$/, ''))) continue;
    let ents;
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { errs++; continue; }
    const rel = path.relative(root, dir);
    const parts = rel ? rel.split(path.sep) : [];
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        // A junction can surface as a plain directory Dirent: lstat to be sure.
        try { if (fs.lstatSync(p).isSymbolicLink()) continue; } catch { errs++; continue; }
        stack.push(p);
      } else if (e.isFile()) {
        let s;
        try { s = fs.lstatSync(p); } catch { errs++; continue; }
        files++;
        add(parts.length ? parts : ['<root files>'], s.size, Math.max(s.mtimeMs, s.birthtimeMs) >= cutoff);
        if (files % 1000000 === 0) console.error(`${files} files, ${((Date.now() - t0) / 1000) | 0}s`);
      }
    }
  }
  const rows = [...agg.entries()].map(([k, [all, nw, nf]]) => ({ k, all, nw, nf, depth: k.split(SEP).length }));
  fs.writeFileSync(out, JSON.stringify({ root, since, files, errs, secs: ((Date.now() - t0) / 1000) | 0, rows }));
  console.log(`done files=${files} errs=${errs} secs=${((Date.now() - t0) / 1000) | 0} -> ${out}`);
}

function report(file, prefixes) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`root=${j.root} since=${j.since} files=${j.files} errs=${j.errs}  (columns: new GB, all GB, new files)`);
  if (!prefixes.length) {
    for (const depth of [1, 2, 3, 4]) {
      console.log(`\n## depth ${depth}`);
      j.rows.filter(r => r.depth === depth).sort((a, b) => b.nw - a.nw).slice(0, 20)
        .forEach(r => console.log(G(r.nw), G(r.all), String(r.nf).padStart(9), r.k));
    }
    return;
  }
  for (const pre of prefixes) {
    const d = pre.split(SEP).length + 1;
    console.log('\n##', pre);
    j.rows.filter(r => r.depth === d && r.k.startsWith(pre + SEP)).sort((a, b) => b.nw - a.nw).slice(0, 15)
      .forEach(r => console.log(G(r.nw), G(r.all), String(r.nf).padStart(9), r.k.slice(pre.length + 1)));
  }
}

const [mode, ...args] = process.argv.slice(2);
if (mode === 'walk') walk(args[0], args[1], args[2]);
else if (mode === 'report') report(args[0], args.slice(1));
else { console.error('usage: growth-walk.mjs walk <root> <since> <out.json> | report <out.json> [prefix ...]'); process.exit(2); }
