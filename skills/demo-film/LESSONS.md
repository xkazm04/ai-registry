# Lessons - demo-film

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 0.1.0 - 2026-10-18 - ai-registry

- **A library voice pick is not a stable identity unless it is written down.** The clip hash includes the voice id, so a voice chosen from the account library on each run would invalidate every clip the day the library ranking shifts. narrate saves the pick to `audio/voice.json` and reads it back before asking the library again; pinning `voice.voiceId` in film.json is still the finished state.
- **A dry run must not need the key, and the spend guard must fire before the key is looked up.** The budget test proves both: `--budget 10` exits 4 with no `key:` line in the output, so the guard cannot be reached only after a credential was read.
- **The file is the duration, not the manifest.** Current clips are re-measured with ffprobe on every run; the test seeds a manifest with `ms: 7` beside one-second mp3s and expects ~1000.
- **Music length depends on narration.** A cue spans beat edges on the hold timeline, so its hash includes the computed length: re-narrating a line inside the cue's span regenerates the bed. Run music after narrate, not before.

## 0.1.6 - 2026-10-28 - athena-portable

- **Method, a native desktop shell as the consumer.** The in-app sync mark the first consumer drew does not carry over: a shell whose windows are composited has no safe corner to paint, and a screen grab shows the desktop. The consumer's capture drew a full-window flash at the start and the end of the take, found both in the frames, and put every beat on the video clock with the two (offset and scale). Over takes of 15 to 40 s the measured drift was 0.05 to 0.15 percent. Proposal: describe the two-flash clock in SKILL.md as the alternative to the corner mark, and have `check` accept a take that carries `offsetUncertaintyMs` of one frame.
- **Method, the stage.** A screen grab recorded unrelated windows on the operator's desktop on the first try, because the application's main window was behind them. The capture has to lay out and restore the windows itself (exact region, topmost for the take, the window's invisible 8 px shadow border cut off) and the first frame has to be looked at before the take. The gate should not be able to pass on a driver that reports success while the picture shows something else.
- **Doc gap, target keys.** `rects` are keyed by the full target string as written in `capture.targets` (`window|selector`); a Callout's `selector` prop must equal that string, not the part after the bar. Neither the contract comment nor SKILL.md says so.
- **Doc gap, figures on motion-only beats.** A hero on a beat with no `capture` reads `ctx.record(key)` from the nearest earlier take beat that has the key. The consumer therefore carried every figure on the last captured beat. Worth stating in the consumer contract, since it decides where an adapter writes a record that only motion beats use.
- **Missing capability, one voice per film.** `voice` is a single spec, so a film with a narrator and a second speaker cannot be narrated in one run. Proposal: an optional per-beat `voiceId`, included in the clip hash. Not built; the consumer's film is single-voice for now.
- **Walk the flow before the voice.** A line written from memory ("nothing on the shelf fits, so she writes a command") was wrong against the real app, which offered a fitting library chore and a ten-question case form. Found by driving the beats once, after narration for those lines had been synthesised, so two clips were spent on a premise the product did not have. A dry walk with the capture's own driver, before `narrate`, would have found it for free.
- **Not yet measured.** The consumer's heroes pass `check` (seek lint) but have not been rendered, and the full take has not been recorded; nothing in this entry says the render lane is clean.

## 0.1.6 - 2026-10-29 - athena-portable (second round)

- **Audition the narrator on the film's own lines.** The first narration was accepted at the kit's default delivery settings and heard as monotone only after the whole film was cut. Five voices read one thirty-second passage of the real script at looser settings (stability 0.35, style 0.4); the operator chose one by ear. Cost was a few hundred characters per voice. See the technique narrator-chosen-by-audition.
- **Script for speech.** No "Part one" announcements, an introduction and a thank-you sign-off, short transitions spoken over the section plates. The plates stayed; only the spoken line changed.
- **A music bed made after narration.** The cue spans the first beat start to the last beat end; the kit sizes it to the hold timeline plus a 2 s tail (170.1 s for a 168.1 s film) and regenerates it when narration moves. Set gainDb to -20 (about 10 percent) on top of the kit's ducking. Operator verdict: the bed improved the feel. The final master came out at -14.84 LUFS, peak-limited, inside tolerance.
- **Missing capability, music candidates.** Generation accepts two concurrent requests per subscription; five candidates needed two passes. A kit command that auditions N candidates at a given length, mixed under a sample, would remove the hand-written script this round used.
- **Doc gap, per-beat settle versus clip.** A beat whose clip is shorter than its settle holds on the settle; the film length is the sum of holds, not of clips. Worth one sentence in SKILL.md because it decides how long a bed must be.
- **Method, an existing install is a stage.** When the product's own pages already show the capability, a retake through those pages (a hub page, a studio with finished steps, a settings page) needs no first-run state and no second instance of the app.
