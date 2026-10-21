#!/usr/bin/env node
/**
 * voice-distance - how far apart two recordings' SPEAKERS are, for a render proof
 * whose observable is a voice.
 *
 *   node voice-distance.mjs --selftest
 *   node voice-distance.mjs <a.wav|a.mp4> <b.wav|b.mp4> [...]   # pairwise matrix
 *
 * The render-proof lane measures image arms with a pixel distance (sheet_distance.py).
 * A pair whose variable is an attached voice reference has no pixels to compare: the
 * question is whether the same character sounds like the same person in two clips, and
 * two clips of one speaker differ in every sample while sharing a vocal tract.
 *
 * So the distance is computed over what a speaker carries ACROSS utterances and not
 * over what the words carry: the long-term average spectrum of the voiced frames (the
 * vocal tract's standing shape) and the median fundamental (its pitch register). Both
 * are averaged over the whole clip, so different words do not themselves register as a
 * different speaker - which is the one failure this measure has to avoid, because every
 * clip in a real proof says a different line.
 *
 * It cannot say which voice is BETTER, only whether two are the same one; the operator's
 * blind listen is the verdict, exactly as for an image pair. It asserts itself before it
 * reports (--selftest, and the selftest runs on every invocation).
 *
 * Exit 0 with the matrix, 2 when it could not run (no ffmpeg, unreadable input).
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const SR = 16000, FRAME = 512, HOP = 256, NBANDS = 24;

function die(msg) { console.error('voice-distance: ' + msg); process.exit(2); }

function pcm(file) {                       // -> Float32Array, mono 16 kHz
  let buf;
  try {
    buf = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le',
      '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
  } catch (e) { die('ffmpeg could not decode ' + file + ': ' + String(e.message).slice(0, 200)); }
  if (buf.length < FRAME * 4) die(file + ' decoded to ' + buf.length + ' bytes - no audio track?');
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length >> 2);
}

function fft(re, im) {                     // in-place radix-2, len power of two
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { const tr = re[i]; re[i] = re[j]; re[j] = tr; const ti = im[i]; im[i] = im[j]; im[j] = ti; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

// autocorrelation pitch over 70-330 Hz; returns 0 when the frame is not voiced.
// `floor` is an energy gate: a frame far below the clip's own loud frames is silence or
// room noise, and autocorrelation finds a confident pitch in noise - measured on this
// stack, a 2.5 s tail that is 97% silence reported a 326 Hz "voice" for a 122 Hz speaker,
// which is the whole clip's identity moved by an octave and a half by nothing.
function f0(frame, floor) {
  const lo = Math.floor(SR / 330), hi = Math.floor(SR / 70);
  let e0 = 0; for (let i = 0; i < frame.length; i++) e0 += frame[i] * frame[i];
  if (Math.sqrt(e0 / frame.length) < floor) return 0;
  if (e0 < 1e-9) return 0;
  let best = 0, bestLag = 0;
  for (let lag = lo; lag <= hi && lag < frame.length; lag++) {
    let s = 0; for (let i = 0; i + lag < frame.length; i++) s += frame[i] * frame[i + lag];
    if (s > best) { best = s; bestLag = lag; }
  }
  return best / e0 > 0.45 ? SR / bestLag : 0;   // 0.45 = voicing threshold
}

// the clip's own loudness floor: a tenth of its 90th-percentile frame RMS. Relative,
// because a generated clip's absolute level is a mix decision and not a speaker property.
function energyFloor(x) {
  const r = [];
  for (let o = 0; o + FRAME <= x.length; o += HOP) {
    let e = 0; for (let i = o; i < o + FRAME; i++) e += x[i] * x[i];
    r.push(Math.sqrt(e / FRAME));
  }
  if (!r.length) return Infinity;
  r.sort((a, b) => a - b);
  return Math.max(r[Math.floor(r.length * 0.9)] * 0.1, 1e-4);
}

function features(x) {
  const floor = energyFloor(x);
  const bands = new Float64Array(NBANDS); let nVoiced = 0; const pitches = [];
  const re = new Float64Array(FRAME), im = new Float64Array(FRAME);
  const win = new Float64Array(FRAME);
  for (let i = 0; i < FRAME; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / FRAME);
  const mel = v => 2595 * Math.log10(1 + v / 700), imel = m => 700 * (Math.pow(10, m / 2595) - 1);
  const edges = [];
  for (let b = 0; b <= NBANDS; b++) edges.push(imel(mel(80) + (mel(7600) - mel(80)) * b / NBANDS));
  for (let o = 0; o + FRAME <= x.length; o += HOP) {
    const frame = x.subarray(o, o + FRAME);
    const p = f0(frame, floor);
    if (!p) continue;                      // unvoiced frames carry the words, not the speaker
    nVoiced++; pitches.push(p);
    for (let i = 0; i < FRAME; i++) { re[i] = frame[i] * win[i]; im[i] = 0; }
    fft(re, im);
    for (let b = 0; b < NBANDS; b++) {
      const k0 = Math.max(1, Math.round(edges[b] * FRAME / SR));
      const k1 = Math.min(FRAME / 2, Math.round(edges[b + 1] * FRAME / SR));
      let s = 0; for (let k = k0; k < Math.max(k1, k0 + 1); k++) s += re[k] * re[k] + im[k] * im[k];
      bands[b] += s / Math.max(1, k1 - k0);
    }
  }
  // 50 frames at a 256-sample hop is about 0.8 s of voiced speech. Below that the LTAS is a
  // handful of phonemes and the median pitch is one syllable, so the number would describe
  // the utterance rather than the speaker. Refuse rather than report it.
  if (nVoiced < 50) return null;
  const ltas = Array.from(bands, v => Math.log10(v / nVoiced + 1e-12));
  const m = ltas.reduce((a, b) => a + b, 0) / NBANDS;   // remove gain: level is not identity
  const centred = ltas.map(v => v - m);
  pitches.sort((a, b) => a - b);
  return { ltas: centred, f0: pitches[pitches.length >> 1], voicedFrames: nVoiced };
}

function distance(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < NBANDS; i++) { dot += a.ltas[i] * b.ltas[i]; na += a.ltas[i] * a.ltas[i]; nb += b.ltas[i] * b.ltas[i]; }
  const spec = 1 - dot / (Math.sqrt(na * nb) + 1e-12);             // 0 same shape, 2 opposite
  const pitch = Math.abs(Math.log2(a.f0 / b.f0));                   // in octaves
  return { spec: +spec.toFixed(4), pitchOct: +pitch.toFixed(4), d: +(spec + pitch).toFixed(4) };
}

function tone(f, secs, harmonics, formant) {   // synthetic voiced signal for the selftest
  const n = secs * SR, x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let h = 1; h <= harmonics; h++) {
      v += Math.exp(-Math.pow((h * f - formant) / 600, 2)) * Math.sin(2 * Math.PI * h * f * i / SR) / h;
    }
    x[i] = v * 0.3;
  }
  return x;
}

function selftest() {
  const a = features(tone(110, 2, 30, 800));
  const b = features(tone(110, 2, 30, 800));
  const c = features(tone(220, 2, 30, 800));   // same tract, octave up
  const d = features(tone(110, 2, 30, 2400));  // same pitch, different tract
  if (!a || !b || !c || !d) die('selftest: the feature extractor found no voiced frames in a synthetic voiced signal');
  const same = distance(a, b).d, pitchDiff = distance(a, c).d, tractDiff = distance(a, d).d;
  if (!(same < 0.02)) die('selftest: one signal against itself scored ' + same + ', expected ~0');
  if (!(pitchDiff > same * 5 + 0.1)) die('selftest: an octave of pitch scored ' + pitchDiff + ', not clearly above ' + same);
  if (!(tractDiff > same * 5 + 0.1)) die('selftest: a moved formant scored ' + tractDiff + ', not clearly above ' + same);
  return { same: +same.toFixed(4), pitchDiff: +pitchDiff.toFixed(4), tractDiff: +tractDiff.toFixed(4) };
}

const args = process.argv.slice(2);
const st = selftest();
if (args[0] === '--selftest') { console.log('selftest OK ' + JSON.stringify(st)); process.exit(0); }
if (args.length < 2) die('usage: voice-distance.mjs <a> <b> [...]   (or --selftest)');
for (const f of args) if (!existsSync(f)) die('no such file: ' + f);

const feats = args.map(f => {
  const ft = features(pcm(f));
  if (!ft) die(f + ': fewer than 50 voiced frames - silence, or speech the pitch tracker cannot see');
  return Object.assign({ f }, ft);
});
console.log('selftest OK ' + JSON.stringify(st));
for (const x of feats) console.log('  ' + x.f + '  f0=' + x.f0.toFixed(1) + 'Hz  voiced=' + x.voicedFrames);
console.log('pairwise (spec = LTAS cosine, pitch = octaves, d = sum):');
for (let i = 0; i < feats.length; i++) for (let j = i + 1; j < feats.length; j++) {
  const r = distance(feats[i], feats[j]);
  console.log('  ' + feats[i].f + ' <-> ' + feats[j].f + '  spec=' + r.spec + '  pitch=' + r.pitchOct + 'oct  d=' + r.d);
}
