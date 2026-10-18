#!/usr/bin/env node
// demo-film render: the cut is a command.
//
//   node tools/render.mjs <film-dir> --balance overlay|sandwich|led [--out <file.mp4>] [--dry] [--stills s,s,...]
//
// check.mjs first (non-zero on any failure) -> bundle (cached by source hash) -> selectComposition ->
// renderMedia h264 CRF 18 yuv420p, AAC 192k, 1920x1080 30 fps -> ffmpeg loudnorm two-pass to -14 LUFS
// integrated / -1 dBTP -> ffprobe gate (duration within 1 frame of the timeline, video + audio) ->
// blackdetect gate (fails on > 0.5 s of FULL black; darker spans are reported, not failed).
// Media: the film dir is served on a loopback HTTP port for the render (props.baseDir).
// --stills renders PNG stills at the given seconds to <film-dir>/out/stills-<balance>/ instead of a video.
// Exit: 0 ok, 1 check failed, 2 render error, 3 gate failed.
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { KIT_REMOTION, runCheck } from './check.mjs';

const execFileP = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const KIT = path.resolve(here, '..');
const req = createRequire(import.meta.url);

export const LOUDNESS = { I: -14, TP: -1, LRA: 11 };
// loudnorm aims below the ceiling: the AAC encode after it overshoots true peak by a few tenths
const TP_AIM = -1.5;

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'film';

function parseArgs(argv) {
  const a = argv.slice(2);
  const val = (k) => {
    const i = a.indexOf(k);
    return i >= 0 ? a[i + 1] : undefined;
  };
  return {
    filmDir: a.find((x, i) => !x.startsWith('--') && !['--balance', '--out', '--stills'].includes(a[i - 1])),
    balance: val('--balance'),
    out: val('--out'),
    stills: val('--stills'),
    dry: a.includes('--dry'),
  };
}

// ---- bundle cache: one bundle per (kit sources, local sources, local path)
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((x, y) => x.name.localeCompare(y.name))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules') walk(p, out);
    } else out.push(p);
  }
  return out;
}

export function bundleKey(localEntry) {
  const h = createHash('sha256');
  const files = [...walk(KIT_REMOTION), ...walk(path.join(KIT, 'tools', 'src')), path.join(KIT, 'package-lock.json')];
  if (localEntry) files.push(...walk(path.dirname(localEntry)));
  h.update(`local:${localEntry ?? '-'}\n`);
  for (const f of files) if (existsSync(f)) h.update(f).update(readFileSync(f));
  return h.digest('hex').slice(0, 16);
}

async function getBundle(localEntry, log) {
  const { bundle } = req('@remotion/bundler');
  const key = bundleKey(localEntry);
  const root = path.join(os.tmpdir(), 'demo-film-bundles');
  const outDir = path.join(root, key);
  if (existsSync(path.join(outDir, 'index.html'))) {
    log(`bundle: cached ${key}`);
    return outDir;
  }
  mkdirSync(root, { recursive: true });
  log(`bundle: building ${key}`);
  const kitNodeModules = path.join(KIT, 'node_modules');
  const empty = path.join(KIT_REMOTION, 'local-empty.ts');
  return bundle({
    entryPoint: path.join(KIT_REMOTION, 'index.ts'),
    outDir,
    enableCaching: true,
    webpackOverride: (c) => ({
      ...c,
      resolve: {
        ...c.resolve,
        alias: {
          ...(c.resolve?.alias ?? {}),
          '@film/local$': localEntry ?? empty,
          '@film/kit$': path.join(KIT_REMOTION, 'kit.ts'),
        },
        // consumer heroes live outside the kit: let their imports (zod, @remotion/*) fall back to the kit's deps
        modules: [...(c.resolve?.modules ?? ['node_modules']), kitNodeModules],
      },
    }),
  });
}

// ---- media: the film dir over loopback HTTP (Range-capable, CORS open)
const TYPES = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf' };

export function serveDir(root) {
  const server = createServer((rq, rs) => {
    const rel = decodeURIComponent(new URL(rq.url, 'http://x').pathname).replace(/^\/+/, '');
    const file = path.resolve(root, rel);
    if (!file.startsWith(path.resolve(root) + path.sep) || !existsSync(file) || !statSync(file).isFile()) {
      rs.writeHead(404, { 'Access-Control-Allow-Origin': '*' }).end();
      return;
    }
    const size = statSync(file).size;
    const headers = { 'Access-Control-Allow-Origin': '*', 'Accept-Ranges': 'bytes', 'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream' };
    const m = /bytes=(\d*)-(\d*)/.exec(rq.headers.range ?? '');
    if (m) {
      const start = m[1] ? Number(m[1]) : 0;
      const end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      rs.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
      if (rq.method === 'HEAD') return rs.end();
      createReadStream(file, { start, end }).pipe(rs);
      return;
    }
    rs.writeHead(200, { ...headers, 'Content-Length': size });
    if (rq.method === 'HEAD') return rs.end();
    createReadStream(file).pipe(rs);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}/` })));
}

// ---- media outside the film dir: the loopback server only serves the film dir, so a StyleLock logo
// that lives elsewhere in the repo (contract: "relative to the script file", e.g. ../branding/logo.svg)
// would 404 and fail the render. Inline it as a data: URI (mediaResolver passes data: through).
export function inlineOutsideMedia(script, filmDir) {
  const logo = script.style.logo;
  if (/^(https?:|data:|blob:)/.test(logo)) return script;
  const root = path.resolve(filmDir);
  const abs = path.resolve(root, logo);
  if (abs.startsWith(root + path.sep)) return script;
  if (!existsSync(abs)) throw new Error(`style.logo not found: ${abs}`);
  const mime = TYPES[path.extname(abs).toLowerCase()] ?? 'application/octet-stream';
  return { ...script, style: { ...script.style, logo: `data:${mime};base64,${readFileSync(abs).toString('base64')}` } };
}

// ---- fx: a procedural whoosh (band-limited pink noise, swelled into the cut); no downloaded assets
async function ensureWhoosh(filmDir) {
  const rel = 'out/.fx/whoosh-v1.wav';
  const f = path.join(filmDir, rel);
  if (existsSync(f)) return rel;
  mkdirSync(path.dirname(f), { recursive: true });
  await execFileP('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'anoisesrc=d=0.8:c=pink:r=48000:a=0.9:seed=7',
    '-af', 'highpass=f=350,lowpass=f=5200,afade=t=in:st=0:d=0.36:curve=exp,afade=t=out:st=0.38:d=0.42:curve=qsin,volume=0.9', '-ac', '2', f]);
  return rel;
}

// ---- audio mastering + gates
export async function measureLoudness(file) {
  const { stderr } = await execFileP('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-vn', '-af', `loudnorm=I=${LOUDNESS.I}:TP=${LOUDNESS.TP}:LRA=${LOUDNESS.LRA}:print_format=json`, '-f', 'null', '-'], { maxBuffer: 64 * 1024 * 1024 });
  const json = stderr.slice(stderr.lastIndexOf('{'), stderr.lastIndexOf('}') + 1);
  return JSON.parse(json);
}

async function master(raw, out) {
  const m = await measureLoudness(raw);
  const I = Number(m.input_i);
  if (!Number.isFinite(I) || I < -60) {
    // silence (or near): normalising would only amplify noise; copy through and say so
    await execFileP('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-c', 'copy', '-movflags', '+faststart', out]);
    return { skipped: `input ${m.input_i} LUFS is silence; not normalised` };
  }
  const pass2 = (linear) =>
    execFileP('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-c:v', 'copy', '-af',
      `loudnorm=I=${LOUDNESS.I}:TP=${TP_AIM}:LRA=${LOUDNESS.LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=${linear}:print_format=summary`,
      '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { maxBuffer: 64 * 1024 * 1024 });
  // linear (one gain, the mix untouched) when the peaks allow it; when the true-peak ceiling caps the
  // gain short of the target, fall back to loudnorm's dynamic mode rather than ship a quiet film
  await pass2(true);
  const got = Number((await measureLoudness(out)).input_i);
  if (Math.abs(got - LOUDNESS.I) <= 0.5) return {};
  await pass2(false);
  return { mode: `linear reached ${got} LUFS (peak-limited); re-mastered in dynamic mode` };
}

export async function probe(file) {
  const { stdout } = await execFileP('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,pix_fmt,sample_rate,bit_rate:format=duration', '-of', 'json', file]);
  return JSON.parse(stdout);
}

export async function blackSpans(file, pixTh, picTh = 0.98) {
  const { stderr } = await execFileP('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-vf', `blackdetect=d=0.5:pix_th=${pixTh}:pic_th=${picTh}`, '-an', '-f', 'null', '-'], { maxBuffer: 64 * 1024 * 1024 });
  return [...stderr.matchAll(/black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)/g)].map((m) => ({ start: Number(m[1]), end: Number(m[2]), dur: Number(m[3]) }));
}

export async function gates(file, timeline) {
  const failures = [];
  const info = await probe(file);
  const v = info.streams.find((s) => s.codec_type === 'video');
  const a = info.streams.find((s) => s.codec_type === 'audio');
  if (!v) failures.push('no video stream');
  if (!a) failures.push('no audio stream');
  const frames = v ? Number(v.nb_frames) : 0;
  if (v && Math.abs(frames - timeline.totalFrames) > 1) failures.push(`duration: ${frames} frames, timeline ${timeline.totalFrames} (> 1 frame off)`);
  if (v && (v.width !== timeline.width || v.height !== timeline.height)) failures.push(`size ${v.width}x${v.height} != ${timeline.width}x${timeline.height}`);
  if (v && v.r_frame_rate !== `${timeline.fps}/1`) failures.push(`fps ${v.r_frame_rate} != ${timeline.fps}`);
  const full = await blackSpans(file, 0.02, 0.999);
  for (const s of full) failures.push(`full black ${s.dur.toFixed(2)} s at ${s.start.toFixed(2)} s`);
  const dark = (await blackSpans(file, 0.1)).filter((s) => !full.some((f) => f.start === s.start));
  if (v && v.pix_fmt !== 'yuv420p') failures.push(`pixel format ${v.pix_fmt} != yuv420p`);
  const loud = await measureLoudness(file);
  const I = Number(loud.input_i);
  // a silent mix (fixtures, estimate-only drafts) is reported, not failed; anything audible must hit the target
  if (Number.isFinite(I) && I > -60) {
    if (Math.abs(I - LOUDNESS.I) > 1) failures.push(`loudness ${I} LUFS, target ${LOUDNESS.I} +/- 1`);
    if (Number(loud.input_tp) > LOUDNESS.TP) failures.push(`true peak ${loud.input_tp} dBTP > ${LOUDNESS.TP}`);
  }
  return { failures, info: { frames, durationS: Number(info.format.duration), video: v, audio: a }, dark, loudness: { I: Number(loud.input_i), TP: Number(loud.input_tp), LRA: Number(loud.input_lra) } };
}

async function main() {
  const o = parseArgs(process.argv);
  if (!o.filmDir || !o.balance) {
    console.error('usage: node tools/render.mjs <film-dir> --balance overlay|sandwich|led [--out <file>] [--dry] [--stills s,s]');
    return 2;
  }
  const log = (s) => console.log(`[render] ${s}`);
  const chk = runCheck(o.filmDir, o.balance);
  for (const w of chk.warnings) console.log(`  warn  ${w}`);
  for (const e of chk.errors) console.log(`  FAIL  ${e}`);
  if (!chk.ok) {
    console.error(`[render] check failed (${chk.errors.length}); not rendering`);
    return 1;
  }
  const { film, timeline } = chk;
  log(`check ok: ${timeline.beats.length} beats, ${timeline.moments.length} moments, ${timeline.totalFrames} frames (${(timeline.totalMs / 1000).toFixed(2)} s) at ${o.balance}`);
  if (o.dry) {
    for (const b of timeline.beats)
      log(`  ${String(b.startFrame).padStart(5)} +${String(b.durFrames).padEnd(4)} ${b.id}${b.capture ? ' [footage]' : ' [motion]'}${b.transitionIn ? ` <${b.transitionIn.component}` : ''}  ${timeline.moments.filter((m) => m.beatIndex === b.index).map((m) => m.component).join(', ')}`);
    return 0;
  }

  const outFile = path.resolve(o.out ?? path.join(film.dir, 'out', `${slug(film.script.title)}-${o.balance}.mp4`));
  mkdirSync(path.dirname(outFile), { recursive: true });
  const localEntry = ['index.tsx', 'index.ts', 'index.jsx', 'index.js'].map((f) => path.join(film.localDir, f)).find((f) => existsSync(f));
  const fx = timeline.fx.length ? { whoosh: await ensureWhoosh(film.dir) } : undefined;
  const { server, url } = await serveDir(film.dir);
  try {
    const { ensureBrowser, renderMedia, renderStill, selectComposition } = req('@remotion/renderer');
    await ensureBrowser();
    const serveUrl = await getBundle(localEntry, log);
    const inputProps = { script: inlineOutsideMedia(film.script, film.dir), manifest: film.manifest, ...(film.take ? { take: film.take } : {}), balance: o.balance, baseDir: url, ...(fx ? { fx } : {}) };
    const composition = await selectComposition({ serveUrl, id: 'Film', inputProps, logLevel: 'warn' });
    if (composition.durationInFrames !== timeline.totalFrames) throw new Error(`composition ${composition.durationInFrames} frames != timeline ${timeline.totalFrames}`);

    if (o.stills) {
      const dir = path.join(film.dir, 'out', `stills-${o.balance}`);
      mkdirSync(dir, { recursive: true });
      for (const sec of o.stills.split(',').map(Number)) {
        const frame = Math.min(composition.durationInFrames - 1, Math.max(0, Math.round(sec * composition.fps)));
        const output = path.join(dir, `f${String(frame).padStart(5, '0')}.png`);
        await renderStill({ composition, serveUrl, inputProps, frame, output, logLevel: 'warn' });
        log(`still ${output}`);
      }
      return 0;
    }

    const raw = `${outFile}.raw.mp4`;
    let last = -1;
    const t0 = process.hrtime.bigint();
    await renderMedia({
      composition, serveUrl, inputProps, outputLocation: raw,
      codec: 'h264', crf: 18, pixelFormat: 'yuv420p', colorSpace: 'bt709', audioCodec: 'aac', audioBitrate: '192k', logLevel: 'warn',
      onProgress: ({ progress }) => {
        const p = Math.floor(progress * 10);
        if (p !== last) {
          last = p;
          log(`render ${p * 10}%`);
        }
      },
    });
    const secs = Number(process.hrtime.bigint() - t0) / 1e9;
    log(`rendered in ${secs.toFixed(1)} s; mastering to ${LOUDNESS.I} LUFS / ${LOUDNESS.TP} dBTP`);
    const tmp = `${outFile}.master.mp4`;
    const m = await master(raw, tmp);
    if (m.skipped) log(`loudness: ${m.skipped}`);
    if (m.mode) log(`loudness: ${m.mode}`);
    rmSync(raw, { force: true });
    renameSync(tmp, outFile);

    const g = await gates(outFile, timeline);
    for (const d of g.dark) log(`dark span (reported, not failed): ${d.dur.toFixed(2)} s at ${d.start.toFixed(2)} s`);
    const report = {
      out: outFile,
      balance: o.balance,
      frames: g.info.frames,
      durationS: Math.round(g.info.durationS * 1000) / 1000,
      timelineFrames: timeline.totalFrames,
      video: g.info.video ? `${g.info.video.codec_name} ${g.info.video.width}x${g.info.video.height} ${g.info.video.r_frame_rate} ${g.info.video.pix_fmt}` : 'none',
      audio: g.info.audio ? `${g.info.audio.codec_name} ${g.info.audio.sample_rate} Hz` : 'none',
      loudnessLUFS: g.loudness.I,
      truePeakDbtp: g.loudness.TP,
      gates: g.failures.length ? g.failures : 'pass',
    };
    writeFileSync(`${outFile}.json`, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report, null, 2));
    if (g.failures.length) {
      console.error(`[render] gate failed: ${g.failures.join('; ')}`);
      return 3;
    }
    return 0;
  } catch (err) {
    console.error(`[render] error: ${err?.stack ?? err}`);
    return 2;
  } finally {
    server.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
