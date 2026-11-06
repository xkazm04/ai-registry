# Lessons - shift

Append-only reflection lane. One entry per shift that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <scope>` followed by `- ` bullets.

Every number in `DEFAULTS` (`scripts/lib/shift-policy.mjs`) stays an unmeasured starting value until
the reports say otherwise. One run does not change that.

## 0.1.0 - 2026-11-06 - first real run, as reported by its director

- One action blocked parallel work. Evidence: `next` returned a single action, so the session ran one
  thing at a time while the box had room. Fixed in 0.2.0: `next` returns everything to start now, per lane.
- `resume` blocked siblings. Evidence: `next` returned `resume` while any cluster was `mining`, so a
  cluster waiting on a proof or a verdict held every other cluster. Fixed: `resume` is gone, a live seat
  means only "nothing to start here", and a cluster owing only a verdict is `waiting`.
- `AskUserQuestion` stalled the loop. Evidence: a verdict asked that way blocked the supervisor's turn,
  and no dispatch happened until it was answered. Fixed: questions wait for `/shift decisions`.
- Operator presence set width to 1 at 7 % CPU and 41 GB free. Evidence: `width()` collapsed to research 1,
  build 0 on any activity in the last 30 minutes, regardless of load. Fixed: presence only caps research,
  at a new starting value that is itself unmeasured.
- `harvest evaluate`, which is build-class, was offered at `width.build` 0. Fixed: it needs a free build seat.
- `--seats-mb` was manual and easy to forget, which silences the canary. Fixed: read from the ledger.
- A long seat lost its board claim, because claims reap at 45 minutes unless beaten. Fixed: beat every tick.
- A 5 s poll hid a 3x timing error in a proof. Time a proof from its execution timestamps, not by polling.
- A pair below the discrimination floor can still inform a lead, though it may not author a landing.
- The numbers from this run: H3-free GPU, CPU 6-17 %, 36-43 GB available through 12+ audio renders plus
  one research seat, no pressure fired, canary null. **That is one observation and does not validate the
  defaults.** The canary read null, so this run says nothing about the slowdown it measures.

## 0.2.0, 2026-11-06

- `--until opening` wakes on any width rise, so CPU swinging across the build ceiling wakes the session with nothing to start. Seen once, at 18:11.
- A lander committed past a red gate because its command did not stop on failure, then fixed it in a follow-up. The supervisor reads each lander's report for this before pushing.
- The operator's list took 18 GitHub repositories mid-shift. The instruments know only YouTube, so 0.3.0 adds a repository row and a RAM rule; `sync` still does not read those lines.

## 0.3.0 - 2026-11-06 - the verdict page

- 2026-11-06, operator: a verdict needs the tracks and the choice in one place, and the reason for the comparison.
