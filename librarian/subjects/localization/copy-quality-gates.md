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
   claims"). **Closed 2026-09-14** by its `native-copy` adoption (English half now gated).

## 2026-09-14 — waves 2 and 3: five techniques, and the review method run on a real tree

**Wave 2 (`900dad91`)**, 6 → 11 techniques: `format-aware-check-catalog` (with the
precondition graph — a failing check silently disables its dependents, the single largest
false-positive reducer the market has), `deterministic-repair-classes`,
`length-and-render-budgets`, `severity-as-declared-data`,
`source-defects-from-cross-language-agreement`; amendments to `layered-mechanical-gate`
(statistical verdicts never block; workflow-state checks) and `anchored-model-review` (the
deterministic veto layer; unique-span expansion). **A deliberate divergence from the market is
recorded in both files:** vendors keep even rule-based spelling and grammar checks at warning;
this subject lets such a rule block once its precision is counted at 95% on the catalog,
because a counted precision is the evidence the blanket rule lacks.

**Wave 3 built the instruments** (`ba65ad99`, native-copy 1.2.0: rule metadata as data, one
span one finding, the veto CLI, eight new rules; compatibility proven by diffing every finding
on all eight fleet trees) **and ran the method** on personas-web's money pages (`4445215`,
application `process--anchored-model-review`):

- 165 units, 1,784 words; a 72-question checklist over 65 rule IDs; three fresh reviewers raised
  35 / 28 / 31; 28 findings agreed at 2-of-3, 75% of them by all three; 11 language defects
  repaired, 17 escalated as claims or term decisions (10 need a fact the tree does not state);
  checker 276 → 270 errors with 0 new; baseline 601 → 596.
- **The veto layer's first real run suppressed four findings, and all four were the veto's
  own defects** hiding two findings the panel agreed on: a fix that kept one flagged word while
  deleting the empty claim was read as a synonym swap, and a keyless unit (a module-constant
  meta description) could never pass. Both sent to a fix pass the same session. The instrument
  meant to stop bad model findings needed its own calibration run — which is this subject's
  whole argument, turned on itself.
- **Idempotence failed its target for the wrong reason:** eight re-review findings, none on
  repaired text, no flip-backs, four new on untouched wording. The technique now splits the
  check into repair stability (target zero) and panel recall (expected above zero).
- **A brief overrode the skill:** the Director asked for every agreed language defect to be
  repaired; the skill's checklist leaves judgment-level minors unrepaired. The skill's rule is
  the one [clean strings stay untouched](../../../knowledge/localization/_laws.md) implies, and
  the exercise records the override as the Director's error, not the method's.

**Owed:** a gold set to measure reviewers' false-positive rate (none exists, so the review row
is `unmeasurable`); the precondition graph and repair ledger are described but not implemented
in the checker; page-level density rules cluster per unit instead of per page; the five
application count against the forge brief's 1–3 is read as a forging budget, not a ceiling.

## Impact (2026-09-14 map regeneration)

Joined to contexts in 5 projects - gravitone 2, politicas 1, personas 1, personas-web 1,
systedo-case 1 - all `unknown`. **Routing gap:** kp, the tree that supplied this subject's
own array incident, joins 0: its i18n gate context shares no vocabulary with the subject's
`use_when`. Return: the next deepen or librarian pass on this subject - widen `use_when`
toward catalog-gate wording and re-check the join, rather than hand-editing a map.

## Adoption findings that become conditions (from 8 trees)

- A new hook system beside an existing hook installer silently disables the installer's
  checks (personas-web) - extend what exists.
- Inline shell in a lefthook job fails on Windows; call a script.
- A fingerprint over a whole long-form string means editing one word re-opens every
  baselined finding in it (personas-web guide sections, blog posts) - candidate: span-level
  fingerprints for body-class units.
- A checker crash must not share the findings exit code (fixed: exit 2).
- Coverage reads "green" while a whole string class is unseen (dash-joined titles skipped as
  non-prose, 7 banned dashes in three trees) - the second sighting of this subject's own
  rendered-string-extraction lesson, in its own instrument, the same day.
