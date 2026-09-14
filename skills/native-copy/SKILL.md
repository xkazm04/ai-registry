---
name: native-copy
description: "Write, check and review native-quality ENGLISH web copy where it lives: i18n JSON catalogs, TS dictionary modules, hardcoded JSX text, MDX. Records the product's declared English (US/UK spelling, dash system, quotes, case per element) in a copy contract counted against the real strings, gates changed copy with a zero-dependency checker whose every finding cites a registry EN-* rule ID (baseline ratchet, coverage printed), runs an anchored checklist review for judgment rules, and drafts page copy from a brief and fact sheet. Use when English UI or landing copy is written, reviewed, wired into pre-push, or reads non-native, translated or generated. Boundary: i18n-translate turns the source catalog into OTHER locales and treats it as truth; native-copy owns the English source copy itself. Invoke /native-copy <init|check|review|write|wire> [scope]."
category: workflow
memory: project
version: 1.3.0
tags: english, copy, microcopy, lint, gate, review
argument-hint: "<init|check|review|write|wire> [--changed | scope | page]"
---

# native-copy - English web copy that reads as written, not rendered

Most failing English copy is grammatical. It fails on collocation, information order,
register per surface, variant mixing, and patterns a human editor would cut regardless of
who wrote them. This skill holds English source copy to a declared standard with three
instruments of rising cost: a **contract** (what this product declared), a **mechanical
checker** (what a regex can prove, gated), and an **anchored review** (judgment, cited).

It owns the English copy itself - writing it, gating it, reviewing it. It does not
translate: `i18n-translate` turns a source catalog into other locales and consumes the source
as truth; when this skill fixes the English source, those locales inherit the fix.

## When to use

- English strings were added or changed (catalog keys, a landing component, an MDX page).
- A page is about to be written or rewritten.
- Copy "reads translated", "reads generated", or mixes `colour` and `optimize`.
- A project has no English gate yet, or its gate reports nothing about what it covered.

## When NOT to use

- Translating into another locale - `i18n-translate`.
- Persuasion strategy: page structure, positioning, proof policy, keyword strategy, brand
  voice profile. Those belong to the marketing knowledge; this skill flags the WORDING of a
  vague claim and defers its sourcing.
- Logs, telemetry, developer-facing errors.

## The knowledge it runs on (resolve, never hardcode)

The language rules live in the registry's `localization` bundle:

- `english` - rule IDs `EN-*`: variant and locale conventions, register, typography,
  interference constructions, false friends, de-translationese, generated-prose patterns,
  UI and landing microcopy.
- `copy-quality-gates` - the pipeline: contract before drafting, rendered-string extraction,
  the layered gate, anchored review, reviewer calibration, enforcement at the write seams.

Resolve the registry as `.ai/manifest.yaml` `registry.local` (default `../ai-registry`;
`$AI_REGISTRY_DIR` wins). Then read `knowledge/localization/index.json` and take
`subjects[<slug>].file` verbatim - bundles are nested; never build a path from a slug. The
subject's techniques sit in `techniques/` beside that file. If the registry or a subject is
missing, say so in the run header (`registry: english subject unavailable`) and run only the
mechanical checker, whose rules are built in. Never invent rule text.

`node ${CLAUDE_SKILL_DIR}/scripts/copy-check.mjs --list-rules --registry <registry>` prints
the checker's rules - status, kind, scope, and the counted precision with its date - and exits 1
if one is missing from the `english` subject (drift).

## The instrument: `scripts/copy-check.mjs`

Node builtins only; run from the project root.

| invocation | does |
| --- | --- |
| `copy-check.mjs` | lint every string the contract's sources hold (`--all`) |
| `copy-check.mjs --changed [--base <ref>]` | lint only strings changed against the merge-base with `<ref>` (default `origin/main`, then `main`), plus staged, unstaged and untracked files; a JSON catalog is diffed key by key |
| `copy-check.mjs --baseline write` | record current findings as fingerprints (the ratchet) |
| `copy-check.mjs --init [--write] [--source <glob>=<kind>]` | count conventions, print a proposed contract; writes only with `--write`, never over an existing one |
| `copy-check.mjs --strings` | print exactly the strings the rules would see (coverage audit) |
| `copy-check.mjs --veto <findings.json> [--registry <dir>]` | run a model review's findings through the deterministic veto layer; prints kept and suppressed findings as JSON, writes nothing |
| `copy-check.mjs --rules-md` | print the rule catalog that [references/rules.md](references/rules.md) holds |
| `--all-findings` | also list baselined errors and warnings; by default a run lists only NEW errors and counts the rest, so a push on a catalog with hundreds of baselined findings shows the one that blocks |
| `--json`, `--errors-only`, `--limit <n>`, `--contract <path>`, `--root <dir>` | output and location |

Exit `0` ok; `1` new error-severity findings not in the baseline, or an unreadable source
file; `2` config or usage failure, naming which. Every finding prints as
`file:line key — EN-ID (kind) message — "span"` (JSON adds `kind` and `anchor`, the span
widened until it occurs once in the string), and the last line states coverage:
`checked N strings (F fragments) in M files from S sources; X unreadable; errors E (new E2), warnings W`.

A green result with a coverage line that does not match the catalog is not green. The
contract schema, extraction per source kind, and baseline semantics:
[references/contract.md](references/contract.md).

## Modes

### `init` - declare before auditing

1. Read the overlay (below). Find the English sources: catalogs, dictionary modules, landing
   components, MDX. Ask the user only about scope that code cannot tell you.
2. Run `copy-check.mjs --init --source <glob>=<kind> ...` (repeat `--source`). It counts US vs
   UK spellings, em and en dashes, curly vs straight quotes, ellipsis forms and the Title Case
   share of heading-class strings. Count, never sample: a catalog that looks US from three
   files can be genuinely mixed.
3. Put the counts in front of the user and let them declare. Where authorities disagree
   (variant, dash system, case, quotes, serial comma, contractions) there is no better choice,
   only a held one - pick by audience and write the reason down.
4. Write `docs/i18n/copy-contract.json` (`--init --write`, then edit the declared values; fix
   `case.headingKeys`/`buttonKeys` to this repo's key names; seed `terms.accept` with product
   and third-party names).
5. Write a short `docs/i18n/style-en.md`: the declared mechanics table, each house ruling with
   its reason (a dash ban, a title-case element class), register per surface, money pages. It
   **cites** registry EN IDs and never restates their text - the subject is the rule, the
   style guide is the delta.
6. Run a full check, then `--baseline write`, so existing debt is recorded and new debt blocks.

### `check [--changed]` - the mechanical gate

Run `copy-check.mjs` (whole catalog) or `copy-check.mjs --changed` (the diff). Report the
coverage line verbatim and the findings grouped by rule. For each error: fix it if the fix is
mechanical and the span is unambiguous (spelling to the declared variant, spacing, a banned
dash to colon/comma/full stop by sense); otherwise list it with the suggested fix. Warnings
are candidates, not defects - each pattern has legitimate uses; confirm in `review` before
rewriting. Re-run until exit 0 and say what remained baselined.

Gate the diff; audit the whole on a schedule and whenever the contract or the checker version
changes.

### `review <scope>` - anchored judgment

`<scope>` is a key prefix, a file, or a page. Follow
[references/review-checklist.md](references/review-checklist.md):

1. Run `check` on the scope first; review never re-litigates a mechanical finding.
2. Build binary checklist questions from the `english` subject's technique files for the rules
   this string class can trigger.
3. Review in a **fresh context** - a subagent that did not write the copy, a different model
   family when one is available - given only the strings with keys and call-site role, the
   contract, the termbase, the exemplars and the checklist.
4. Keep only findings shaped `key · span · EN-ID · MQM path · severity · minimal fix`. Save
   them as JSON and run `copy-check.mjs --veto <file>`: the deterministic veto layer drops
   uncited or unknown rule IDs, spans that are not verbatim or not unique, locked and preserved
   keys, accepted names, skeleton-changing fixes, synonym swaps, authorship claims, and spans a
   recorded guard of the cited rule already covers - and counts what it dropped and why. Work
   only from its `kept` list; report `given`, `kept` and `counts`. Bulk sweeps keep findings
   reported by 2 of 3 independent samples.
5. Repair once, on flagged spans only; re-run `check`; re-review the repaired strings once.
   Repair stability (findings on repaired text, flip-backs) must be zero; new findings on
   untouched text are panel recall, not a failed repair. A string that flips back freezes and
   goes to a human.
6. Report strings given, strings judged, findings by severity, fixes applied, and what is
   queued for a human (money pages always are). **Language only.** Whether a claim is true
   (a feature, a price or plan, a privacy promise, a test result, a product name the product
   no longer uses) is not a language finding: list it after the report as a short
   **fact-check notice**, counted in no finding, agreement, repair or escalation total.

### `write <page|section>` - brief first, English first

1. **Before drafting**, load: the contract; the termbase (`terms`, plus any glossary); 3-5
   exemplars of this surface from the best reviewed copy (`docs/i18n/exemplars-en.md`, plus
   2-3 annotated anti-exemplars if the team has them); and a **brief** - audience, surface,
   register, the one job of the page, and a **fact sheet** that is the only permitted source
   of claims. No brief and fact sheet, no page copy: ask for them or draft them for approval.
2. Keep the writer's context short and positive: the brief, the exemplars, about ten
   verifiable constraints. Do not paste forbidden-word lists into the writer's prompt -
   the checker holds them.
3. **Draft English from the brief**, not by rendering source-language prose. If a source
   page exists, use it for facts only; translation carries over sentence shape and noun
   density. Transcreate persuasive strings (headline, tagline, CTA) from intent; keep
   functional strings literal.
4. Write the strings into the project's catalog shape, then `check --changed`, then `review`
   on the new keys. Clean strings stay untouched; repair flagged spans once.
5. Report which claims came from which fact-sheet line; a claim with no line is removed.

### `wire` - enforcement at the seams every write passes

1. Add to `package.json` scripts:
   `"copy:check": "node .claude/skills/native-copy/scripts/copy-check.mjs"`
   (adjust the path to where the skill is installed in this repo). The default is the whole
   catalog against the baseline: it sees strings that reached the catalog by any path, and it
   runs in seconds on catalogs of thousands of strings. Use `--changed` only where a full run
   is measurably too slow for a push.
2. Add it to the project's **existing** pre-push hook system - `lefthook.yml`, `.husky/`, or
   `.githooks/` with `core.hooksPath`. Never add a second hook system beside the first. If the
   repo has none and the owner has asked for the gate, create `.githooks/pre-push` and set
   `core.hooksPath` (local config - note it in `style-en.md`); otherwise propose one.
3. The hook step must **skip loudly** when the checker is absent - a fresh clone or a CI
   checkout has no link to the registry:
   `[ -f .claude/skills/native-copy/scripts/copy-check.mjs ] || echo "copy gate SKIPPED: native-copy not installed" >&2`.
   A silent skip that reads as a pass is the failure this gate exists to prevent.
4. Do **not** add it to an aggregate `verify`/`check:ci` script that mirrors CI's blocking set:
   the checker is not present in CI, and that aggregate must equal what CI runs. Wire CI only
   from a vendored or release installation of this skill; otherwise the pre-push hook is the
   seam, and the report says so.
5. Run a full check and `--baseline write`; commit `docs/i18n/copy-contract.json`,
   `docs/i18n/style-en.md` and `.ai/copy-baseline.json` together. Prove the gate once: plant a
   new error-level string, confirm exit 1 naming it, revert, confirm exit 0.
6. Record the escape hatch in `style-en.md`: a deliberate exception is made visible, never
   bypassed - an intentional string goes into the baseline in its own commit whose message
   says why; a rule wrong for this catalog is turned `off` in the contract with the reason in
   the style guide. An agent never uses `--no-verify` to pass this gate.

## Guardrails

- **Detectors never gate.** No finding rests on an "AI-written" score or a model's "sounds
  generated" verdict, and no finding alleges authorship. A finding names a text property and
  a span a human editor would cut regardless of who wrote it.
- **Count before blocking.** A rule blocks only after its precision is counted on this
  catalog; new rules enter as warnings. Promote a warning to an error only when its existing
  occurrences are zero.
- **Coverage is counted, not claimed.** Quote the checker's coverage line in every report. If
  a source kind is not extracted (a string built at runtime, a CMS), say so.
- **Clean strings stay untouched.** No drive-by rephrasing in `check`, `review` or `write`.
- **A vocabulary finding is fixed by removing the empty claim**, not by renaming the word.
- **The contract is the authority for choices; the subject is the authority for language.**
  A house ruling that overrides a subject rule is recorded with its reason, not silently
  applied.

## Why these defaults

Each default is a technique of the `copy-quality-gates` subject, read through the index:

- Undeclared mechanics are `any`, and `init` counts before proposing -
  `copy-contract-before-drafting`: the authorities contradict each other; the defect is
  mixing.
- Arrays walked, ICU expanded, the coverage line printed - `rendered-string-extraction`: a
  fleet gate that skipped arrays missed the only banned character left in its catalog while
  reporting green.
- Deterministic rules block, style patterns warn, judgment is advisory; fingerprints, not
  counts; the diff is gated and the whole audited - `layered-mechanical-gate`.
- Checklist questions per rule ID, fresh-context reviewer, 2-of-3, one repair pass -
  `anchored-model-review` and `reviewer-calibration-and-sampling`.
- `wire` targets the push hook and the aggregate verify task rather than path-scoped
  instructions - `enforcement-at-the-write-seams`: those are the seams every write path
  crosses.
- A rule's disposition, precision and false positives are data beside its ID -
  `severity-as-declared-data`; the catalog is enumerable and each check sees the text it is
  about - `format-aware-check-catalog`.
- Findings carry an offset, a suggestion and a unique anchor, so a mechanical class can be
  repaired and recorded rather than re-reported - `deterministic-repair-classes`.
- Model findings pass a rule-based veto before anyone reads them, and spans are made unique
  before they are matched - `anchored-model-review` (the deterministic veto layer).

## The rule catalog is data

Every rule in `scripts/lib/rules.mjs` is a record, and
[references/rules.md](references/rules.md) is generated from it (`--rules-md`; a test fails
when it is stale). Read it before promoting a warning or turning a rule off.

- **`kind`** - the issue type (terminology, mistranslation, grammar, style, register,
  locale-convention, typography, markup, whitespace, redundancy, regionalism,
  inclusive-language, usage), printed on every finding.
- **`precision`** - `{ value, sample, date, note }`: the accepted share the last time someone
  counted. `null` means nobody has; a null is honest, an invented number is not.
- **`guards`** - the known false positives as `{ pattern, reason, seen, example }`. An
  executable pattern suppresses matches in the checker and vetoes model findings citing the
  same rule; every guard's example is a negative control the tests run.
- **`status`** - `on` or `temp_off`. `temp_off` retires a noisy rule without deleting it: it
  keeps its guards, examples and tests and never fires, whatever the contract says. Deleting a
  rule loses the false positives it was taught.
- **`priority`** - resolves overlaps: **one span, one finding**. When a phrase rule claims a
  span, a lower-ranked word-level warning on the same span is dropped (rank is severity, then
  priority, then length), so a puffery word inside a cliche or a hedge inside a participle tail
  raises one alert. An error is never dropped, and typography never competes with wording.
- **`examples`** - a positive fixture and a negative control per rule, run for every rule by
  enumeration: a rule cannot ship untested.

New rules enter as `warn` with at least one guard. The fingerprint (`rule|file|key|sha1(text)`)
ignores message, kind and anchor, so metadata changes never invalidate a project's baseline.

## Project overlay

Per-repo facts live in **`.claude/native-copy/config.md`** in the consuming repo (tracked).
The skill runs with no overlay; when a default is in force, say so in the report.

| Key / section | What it carries | Default when absent |
| --- | --- | --- |
| `## Contract` | path of the copy contract | `docs/i18n/copy-contract.json` |
| `## Style guide` | path of the house English style guide | `docs/i18n/style-en.md` |
| `## Termbase` | glossary file beyond `terms` in the contract | `docs/i18n/glossary.md` if present, else the contract's `terms` |
| `## Exemplars` | reviewed voice exemplars per surface | `docs/i18n/exemplars-en.md` if present; else ask for 3-5 before `write` |
| `## Money pages` | keys, files or routes that always get 100% review and a human | home, pricing, sign-up, checkout, auth and payment errors, transactional email |
| `## Base ref` | ref `--changed` diffs against | `origin/main`, then `main` |
| `## Review model` | how the fresh-context reviewer is run (subagent, other model family) | a fresh subagent that did not write the copy |
| `## Installed path` | where the skill's scripts sit in this repo, for `wire` | `.claude/skills/native-copy` |
| `## Skill improvement log` | dated project-lane observations (Skill Reflection) | created on first entry |

ARGUMENTS: `<mode> [scope]` - e.g. `init`, `check --changed`, `review landing.hero`,
`write pricing page`, `wire`. With no mode: `check --changed` if a contract exists, else
`init`.

---

<!-- clause: skill-reflection v4 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Project learning.** Put a dated observation in the consuming project's configured
overlay under `## Skill improvement log`, when local edits are within scope. Use the
location in this skill's `## Project overlay` section. If none is configured, use
`.agents/native-copy/config.md` for Codex or `.claude/native-copy/config.md` for Claude.
If the harness is unknown, propose the note in the response instead of guessing a path.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
