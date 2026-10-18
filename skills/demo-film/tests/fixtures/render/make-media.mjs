#!/usr/bin/env node
// Generates the render fixture's media with ffmpeg (no network, deterministic):
//   take/take.mp4      9 s testsrc2 1920x1080 30 fps with "UI" boxes drawn at the logged rects
//   take/take.json     the take record (rects, clicks, run record) per contract.ts
//   audio/<beat>.mp3   silent narration clips (anullsrc) of fixed lengths
//   audio/music-bed.mp3 a soft synthetic pad (so the loudness gate has something to measure)
//   audio/manifest.json measured with ffprobe
// Usage: node tests/fixtures/render/make-media.mjs [--force]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const force = process.argv.includes('--force');
const run = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const probeMs = (f) =>
  Math.round(Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim()) * 1000);

mkdirSync(path.join(dir, 'take'), { recursive: true });
mkdirSync(path.join(dir, 'audio'), { recursive: true });

const rects = {
  '#ask': { x: 240, y: 300, w: 560, h: 96 },
  '#offer': { x: 1180, y: 420, w: 420, h: 120 },
  '#ceiling': { x: 1180, y: 600, w: 420, h: 120 },
};

const takeMp4 = path.join(dir, 'take', 'take.mp4');
if (force || !existsSync(takeMp4)) {
  const boxes = [
    'drawbox=x=0:y=0:w=1920:h=1080:color=0x0e1c1f@0.82:t=fill',
    'drawbox=x=0:y=0:w=1920:h=88:color=0x15292d@1:t=fill',
    'drawbox=x=0:y=88:w=200:h=992:color=0x112326@1:t=fill',
    ...Object.values(rects).map((r) => `drawbox=x=${r.x}:y=${r.y}:w=${r.w}:h=${r.h}:color=0x1f8a84@0.9:t=fill`),
    `drawbox=x=${rects['#ceiling'].x}:y=${rects['#ceiling'].y}:w=12:h=${rects['#ceiling'].h}:color=0xe3b341@1:t=fill`,
    'drawbox=x=240:y=460:w=820:h=420:color=0x15292d@1:t=fill',
    'drawbox=x=280:y=820:w=740:h=6:color=0x8aa09e@0.6:t=fill',
    "drawbox=x='280+t*60':y=780:w=24:h=24:color=0xe3b341@1:t=fill",
  ].join(',');
  run(['-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=30:duration=9', '-vf', boxes, '-c:v', 'libx264', '-crf', '30', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-an', takeMp4]);
}

const take = {
  video: 'take/take.mp4',
  width: 1920,
  height: 1080,
  fps: 30,
  offsetUncertaintyMs: 0,
  beats: [
    {
      id: 'haggle-open', startMs: 500, endMs: 4900, rects,
      clicks: [{ x: 1390, y: 480, atMs: 2400 }, { x: 1390, y: 660, atMs: 3900 }],
      record: { askMe: 250, ceiling: 340, offers: [285] },
    },
    {
      id: 'haggle-close', startMs: 5200, endMs: 8600, rects: { '#offer': rects['#offer'], '#ceiling': rects['#ceiling'] },
      clicks: [{ x: 1390, y: 660, atMs: 6400 }],
      record: { askMe: 250, ceiling: 340, offers: [285, 310, 330] },
    },
  ],
};
writeFileSync(path.join(dir, 'take', 'take.json'), `${JSON.stringify(take, null, 2)}\n`);

const clipSec = { open: 3.0, 'haggle-open': 4.3, 'haggle-close': 3.9, end: 2.8 };
const clips = {};
for (const [id, sec] of Object.entries(clipSec)) {
  const f = path.join(dir, 'audio', `${id}.mp3`);
  if (force || !existsSync(f)) run(['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(sec), '-c:a', 'libmp3lame', '-b:a', '64k', f]);
  clips[id] = { file: `audio/${id}.mp3`, ms: probeMs(f), hash: `fixture-${id}` };
}

const bed = path.join(dir, 'audio', 'music-bed.mp3');
if (force || !existsSync(bed)) {
  const pad = "0.18*sin(2*PI*220*t)+0.12*sin(2*PI*277.18*t)+0.10*sin(2*PI*329.63*t)+0.06*sin(2*PI*440*t)";
  run(['-f', 'lavfi', '-i', `aevalsrc='(${pad})*(0.75+0.25*sin(2*PI*0.5*t))':s=44100:d=19`, '-af', 'lowpass=f=1800,afade=t=in:d=0.5', '-c:a', 'libmp3lame', '-b:a', '128k', bed]);
}
const manifest = { clips, music: { bed: { file: 'audio/music-bed.mp3', ms: probeMs(bed), hash: 'fixture-bed' } }, estimated: [] };
writeFileSync(path.join(dir, 'audio', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log('fixture media ready:', JSON.stringify({ clips: Object.fromEntries(Object.entries(clips).map(([k, v]) => [k, v.ms])), bedMs: manifest.music.bed.ms }));
