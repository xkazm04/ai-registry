---
domain: localization
subject: null
last_swept: 2026-08-28
layout: nested
demand_known: unknown
---

# Localization

Coverage note for the `localization` bundle. Part of [[index]]; graded against
[[standard]]. First sweep — this bundle had no domain note before 2026-08-28,
and no `/deepen` run had ever touched it.

## Shape at this sweep (2026-08-28)

| | 2026-08-28 (close) | 2026-08-28 (open) |
| --- | --- | --- |
| Subjects | 14 | 14 |
| Techniques | 85 (2 amended) | 84 |
| Applications | 28 | 27 |
| `use_when` written | 85/85 | 84/84 |
| Version witness | 0/28 | 0/27 |
| Runtime-bearing applications | **0** | 0 |
| Expired / at-risk | 0 / 0 | 0 / 0 |
| Never swept | 13/14 | 14/14 |
| Attention points | 67 | 72 |
| Cap breaches / taxonomy errors | none / 0 | none / 0 |

A record of this sweep, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain localization`.

## The attention score cannot rank this bundle at all

The worklist came back a **13-way tie**: every language subject scored exactly
5, on exactly the same two clauses — *single stack (process)* and *never swept
by the librarian*. Not approximately flat; identical. The counter has no term
that separates Arabic from Spanish, because every language subject was forged
in one wave, to one template, against one tree.

That is not a defect in the subjects and it is not fixable by sweeping to clear
the flag. It means **the scan is structurally blind in this domain** and
ranking has to come from demand and judgment. Recorded here so the next run
does not spend a cycle re-deriving a tie.

The one subject that scored differently — `translation-pipeline-topology` at 2 —
did so only because it had been swept before.

## The four-bundle "zero version witness" claim is wrong here

[[2026-08-27-1]] grouped `localization` with `civic-intelligence`,
`grant-funding` and `recruiting` as bundles with zero version witnesses, and
concluded that *"drift there is not absent, it is uncomputable."* For the other
three that holds. For this one it does not: `check-currency.mjs` reports
`driftUnknown: 0` for `localization`, because **all 28 applications are
`process`-stack and none is runtime-bearing**. There is no runtime to drift
against. A version witness here would be a fabricated fact, not a missing one.

The corpus is craft — what a language demands of a translator — and it is
supposed to outlive every runtime it was read against. A backfill pass over
this bundle would be wrong. Left uncorrected in [[standard]] for now; the claim
is right about the class and wrong about this member.

## Demand: unknown, with a routing defect now fixed

No installation reports consulting this bundle. But the sweep found the
map itself wrong: `personas-web` ships a **thirteen-locale catalog matching this
bundle's thirteen language subjects exactly** (`ar bn cs de es fr hi id ja ko ru
vi zh`) and was registered against `software-engineering` only, in both halves
of the project bridge. A localization run had no way to find its own consumer.

Corrected this sweep in [[projects]] and the local bridge together. This does
not make demand *known* — demand is what an installation reports — but the
routing now exists for it to be reported through, and the first application
written off that tree landed the same day.

## What is owed

- **A second tree for all 14 subjects.** Every subject is single-stack
  `process`. The language subjects were forged against one product's catalogs;
  the transplant claim has never been tested. This is `/reconcile` work, and it
  is the whole of the bundle's attention score.
- **A maturity signal.** All 14 documents say `forged`. Nothing here has been
  reconciled or transplant-tested.
- **The 13 language subjects have never been deepened.** Round 1 went to the
  craft subject on demand grounds, not because the languages are done.

## Dispatched

### 2026-08-28 — three rounds, in-session, all landed

All three on [[translation-pipeline-topology]]; rounds 2 and 3 probed round 1's
own technique rather than surveying, per loop doctrine.

- **Round 1** — `source-identical-value-audit` earned on convergence between two
  independent trees plus a law that asks for it. Counter-evidence changed the
  finding twice: it killed the opening hypothesis with a measurement, and the
  field's i18n-testing literature turned out to cover a different problem.
- **Round 2** — refuted the new technique's own class 4. Two thirds of French's
  residue are **cognates**, not borrowings; a cognate is a fact, not a ruling,
  and the termbase must not receive it. Floor restructured to five classes cut
  two ways. `french/terminology-and-loanwords` gained **FR-COGNATE**.
- **Round 3** — refuted its class 2. "Pure skeleton" is locale-independent in
  LTR targets only; in RTL a wordless string can still need an isolate or a
  mark. **Arabic needed no edit** — `AR-BIDI-REVIEW` already owns the claim
  entirely, and the round's correct output was to leave the language subject
  alone and scope the craft one.

Yield ran high → moderate → confirmation-heavy, the curve the loop design
predicts. `dry_streak` 0; not saturated, but the cheap axes (format capability,
vocabulary stock, direction) are each spent once. The next honest probe is a
second *tree*, not a fourth round.

**The loop's own lesson this run:** two of three rounds landed by refuting the
run's own prior output, and both refutations came from sorting a measurement
that already existed rather than from new research. A technique minted in round
1 is the cheapest thing in the corpus to attack in round 2, and attacking it is
worth more than surveying a fresh subject.

## Banked from this sweep, not placed

- **The uniform six-technique template.** Twelve of thirteen language subjects
  carry exactly six techniques on the same axes (script/typography, quantity,
  register, terminology, de-anglicization, UI conventions); Czech carries seven,
  Indonesian five. That uniformity is a *forge template*, and the open question
  is whether it is also each language's real ceiling — whether some languages
  have a seventh axis that matters more than one of the six. Untested. **Return
  condition:** a language-subject deepen round, which should test this
  explicitly rather than assume the template.
- **Indonesian's five is earned, not a floor breach.** Checked against the file
  this sweep: the missing slot is typography, and the golden path justifies its
  absence in the opening paragraph (Latin script, no diacritics). The
  deterministic outlier was a false positive. Do not re-flag it.
- **A staleness instrument for hand-authored exceptions** still has a contract
  and no implementation anywhere in the fleet — carried forward from
  [[translation-pipeline-topology]]. Partially answered this sweep: the
  consuming tree *does* have one for its guide corpus (per-unit source-hash
  drift with a strict release gate). The gap is now specifically the **UI
  catalog**, whose format cannot record the fact.

## Instrument notes from this sweep

- **A `grep` run through the Bash tool returned zero matches for terms that
  occur 102 times in the bundle.** Reported as `PRIOR ART: none` it would have
  produced a duplicate technique. The dedicated search tool was correct. Fourth
  recorded instance of *verify the instrument before reporting a content gap*,
  and the first where the instrument was a shell built-in.
- **A concurrent session was writing into this checkout mid-run** (four
  untracked files appeared across `game-production` and `software-engineering`
  between two gate runs). `build-catalog.mjs` refused to publish disagreeing
  counts, which was the right call and is what surfaced it. `catalog.json`
  regeneration is owed once the tree settles; it was deliberately not committed
  by this run.
