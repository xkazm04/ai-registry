---
subject: copy-quality-gates
domain: localization
last_touched: 2026-09-14
touched_by: deepen (forge-sized: coverage hole)
dry_streak: 0
---

# copy-quality-gates

**Forged 2026-09-14** (`e86f41e8`) beside [[english]], as the craft sibling of
[[translation-quality-measurement]]: the pipeline that proves source-language copy meets its
language standard, for the case the fleet actually has — coding agents writing catalog copy.
6 techniques (5 `stage: solo`, calibration `team`), 2 applications. Depth rung **L2**, with two
L3 field observations measured in this run.

## The two measured incidents it carries

- **kp's gate skipped arrays.** `flatten()` stored arrays as leaves and every content check
  early-returned for non-strings: 14 arrays / 62 strings per locale outside the em-dash ban,
  message-syntax compile and placeholder parity; the catalog's only banned em dash sat in one
  of them (`landing.voice.transcript[0]`). personas' `check-escapes` recursed and printed a
  count; personas-web recursed without one. → `rendered-string-extraction`.
- **The registry's own rules never loaded.** Rule files installed as symlinks to the
  generated source outside each project were never loaded by the harness (2.1.270, paired
  InstructionsLoaded probe; kp 0 of 4), while the installer's `--check` called them healthy.
  Fixed `84f4b6aa` (copies + drift check); re-probe 4 of 4. → `enforcement-at-the-write-seams`.

## Worker corrections to the dossier

Antislop's ~2,000-pattern ceiling is decoding-time token banning, not prompt bans; the 23.5x
style-matching figure compares few-shot with zero-shot, not with rule summaries; IFScale kept
only the verified 68%-at-500; CheckEval's +0.45 and ISO 17100 clause numbers dropped as
unverified. The subject is better for each.

## Owed (from the applications, with return conditions)

1. `link-registry --check` sits at no seam — rule copies go stale silently after a rules
   rebuild. Return: next registry tooling pass; candidate a SessionStart or post-rebuild hook.
2. The load-telemetry probe is manual. Return: the next harness upgrade (script it then).
3. The installer's byte-exact `.gitignore` comparison rewrites CRLF checkouts (seen in two
   projects). Return: next edit to `link-registry.mjs`.
4. systedo-case's i18n gate tracks em dashes in the Czech column only — the English half of
   its "identical" dash rule is unenforced (second instance of "a gate checks less than it
   claims"). Return: its `native-copy` adoption closes it.
