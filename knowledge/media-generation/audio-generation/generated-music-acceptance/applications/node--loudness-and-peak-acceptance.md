---
layer: application
type: application
subject: generated-music-acceptance
technique: loudness-and-peak-acceptance
status: forged
stack: node
verified_on: 2026-11-16
verified_against: node@24
applied: simulation
ab_verdict: better
---

# Node — a destination-profiled acceptance judge, a measured limiter margin, and two paths that skip the judge

`gravitone-gcloud` (branch `main`, read at `fc26e172`, 2026-11-16; files
read with `git show`, nothing run) has the scripted acceptance pass the
subject note's 2026-08-26 lead said did not exist anywhere in the fleet. It
landed on 2026-10-24 (`da2b8b63`, "WP0 ... the acceptance judge") and cites
this technique in its header.

## The judge: the target belongs to the destination

`packages/domain/src/audio.accept.ts` is pure (no I/O) and holds two
profiles (:17-22):
- `voice-take`: -28..-10 LUFS, -1 dBTP. A stem entering a mix, held to a
  usable range, because the export's loudnorm sets the target anyway.
- `youtube`: -15..-13 LUFS, -1 dBTP. The delivered file.

The header says why (:12-16): holding a raw take to -14 "would fail nearly
every take for a number the export's loudnorm sets anyway". That is the
technique's "the target is a property of the destination, not of the
track" turned into a type.

`judgeAcceptance` (:62-74) is the unmeasured-is-not-pass law in code:
- a null loudness or a null true peak is a reason ("loudness not
  measured"), never a pass;
- clipped samples fail;
- a silent tail over `TAIL_SILENCE_MAX_S = 1.5` fails as a broken ending
  (:49);
- length is checked only when the take committed to one (`expectedS`
  null = "verify what was committed and nothing more", citing
  structure-verification-against-plan, :60-61).

LRA is measured (`AudioMeasureFull.lra`) and never judged, matching the
technique's "a diagnostic, not a compliance number". The verdict is
advisory by operator decision (2026-10-24, :7-8): recorded as a ledger
event, not read by the cut gate.

## The limiter margin is a measurement

`lib/cut/narrationMix.ts:27-38` records why the export limiter is set to
-1.5 dBTP when the ceiling is -1:
- through `loudnorm=...:TP=-1`, speech-shaped test audio measured
  -0.9 dBTP as PCM and **-0.8 dBTP after the 192k AAC encode**. The limiter
  lands a hair over its own line, and the codec adds about 0.2 dB;
- at TP=-1.5 the delivered file measured -1.2 dBTP / -14.8 LUFS;
- at -2 it measured -1.8 / -15.0, the loudness edge.

`EXPORT_LOUDNORM` (:61) ships the -1.5. This is the evidence behind the
technique's 2026-11-16 amendment: the ceiling belongs to the encoded file,
and the limiter is set below it by the overshoot measured on your own
chain.

## The delivered file is measured, then judged

`lib/cutExport.ts:320-331` (`measureDelivered`) runs `ebur128=peak=true`
on the finished mp4, parses it (`lib/adRender.ts:458` `parseEbur128`),
and judges it at the `youtube` profile. A failed measurement falls through
to "loudness not measured" (:326).

## Two delivery paths that skip the judge (defects, read not run)

1. **A music-only cut is never measured.** `cutExport.ts:378` measures
   only when `sound.narrated > 0`. The header says so (:22-23: "A cut with
   no narration renders exactly as before, unmeasured"). The music bus also
   has no loudnorm (`narrationMix.ts:7-12`). So the one path whose whole
   soundtrack is generated music delivers at whatever level the takes
   arrived at, with no verdict. The technique says nothing on the delivery
   path skips this gate.
2. **The ads finish gate judges loudness only.**
   - `lib/cut/ads/finish.ts:165-176` builds the `loudness` check from
     `integratedLufs` within ±1 LU (`AD_LOUDNESS_TOLERANCE_LU`, :40).
   - The record carries `truePeakDb` (`lib/ads/types.ts:308-311`), and
     the finish never reads it (no `peak` in the file).
   - The ad is limited at `TP=-1` (`adRender.ts:76`) and encoded to
     192k AAC (`adRender.ts:450`). That is the configuration
     `narrationMix.ts` measured landing at -0.8 dBTP.
   - So the ads finish can show `pass` on a file that `judgeAcceptance`
     at the `youtube` profile would fail on true peak.
   - Fix: judge the ad through `judgeAcceptance(..., "youtube", null)`,
     the way `cutExport` does, and move `AD_LOUDNORM` to the -1.5 margin.
     `narrationMix` already derives that margin from the same target.

## Platform figures, re-checked 2026-11-16

- Spotify's loudness page: -14 LUFS default (Loud -11, Quiet -19). It
  says to keep true peak below -1 dBTP, and below -2 dBTP when the master
  is louder than -14 LUFS. The `youtube` profile's -14 ±1 / -1 dBTP sits
  inside that.
- YouTube's own target was not confirmed from a YouTube page today (the
  help URL tried returned 404). The profile's name is a destination label,
  not a sourced YouTube figure.
- EBU R 128 (v5.0, 21 Nov 2023): -23 LUFS, from the EBU's page. The
  technique's broadcast "-23/-24" stands. The -24 (ATSC A/85) is from
  secondary sources only.
