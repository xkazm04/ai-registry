---
subject: quality-gates
domain: software-engineering
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# quality-gates

First touch: 2026-08-28, `/deepen` loop round 2 over the software-engineering
domain. Selected as the top never-swept subject (27 attention points, 6
consumer deviations against 3 consults). Not single-stack — 4 `node`
applications and 1 `process`.

## State

10 -> 11 techniques, 5 applications. This is one of the densest subjects in the
bundle and the round was forecast confirmation-heavy before it started; it was
not, because the gap found sits in a layer the subject had never looked at.

Landed:

- `enforcement-binding` (new technique) — the join between the pipeline and the
  merge decision. The subject engineered gates thoroughly and treated the merge
  pipeline as the top of the ladder; the actual top rung belongs to the hosting
  platform, is configured outside the repository, and fails in ways no pipeline
  run can report.
- `quality-gates.md` — new golden-path section plus frontmatter and index
  wiring.
- `gate-laddering` amendment — its "the binding rung is the last one" blockquote
  now carries the qualification it cannot verify about itself: a check present
  on the merge rung and absent from the binding discovers, it does not refuse.

## Why it earned a technique rather than a paragraph

Two mechanics, neither reachable from anything the subject already held:

1. **The join is a name string.** Requirements name the checks that must
   report success. A job renamed, split, or moved emits under a different name;
   the requirement then matches nothing, and matching nothing reads as *absent*
   rather than failing — the platform's version of a glob walking zero files.
   Both sides look healthy on inspection and the seam between them is the
   defect.
2. **"Did not run" resolves to a definite verdict, and the direction depends on
   where the skip was written.** Condition the whole pipeline definition
   (path/branch filter) and nothing is ever reported, so the requirement hangs
   and the merge blocks indefinitely — fail-closed. Condition the unit inside
   it and the same intent is reported as *success*, satisfying the requirement
   with a check that did no work — fail-open. One indentation level apart, and
   the fail-open form is what every troubleshooting guide recommends, because
   the fail-closed form is unbearable in daily use. So the standard cure for a
   merge deadlock converts a gate that blocked everything into one that blocks
   nothing, and looks in every report like the deadlock was fixed.

The second is the find of the round. It is `unknown-is-not-a-value` at exactly
the boundary that law describes — an optional result meeting a non-optional
requirement, with the platform picking the default.

## Prior art checked before drafting (the LESSONS rule paid again)

Grep over the subject for the whole vocabulary of this area returned zero hits.
Three neighbours were close enough to need an explicit boundary written into
the technique's opening:

- `gate-laddering` **"the typical-commit fire set"** — replay recent history
  against trigger conditions to see which jobs actually fire on a median commit.
  Nearly the same territory from the pipeline's side. The new technique asks the
  next question: what the merge decision does with the ones that did not fire.
- `gate-laddering` **"one authority for the rule set"** — one config all rungs
  read. About rule *content* drifting across rungs, not about the protection
  configuration being a separate authority.
- `gate-liveness` — proves a gate red. Explicitly extended rather than
  duplicated: passing the seeded-failure exercise does not prove the refusal
  reaches the merge decision, and a red result nothing consumes is the exact
  state the new technique exists to find.

## Counter-evidence that confirmed (no edit — first-class results)

- **`hook-hygiene`'s "hooks observe, never mutate" is absolutist and the field
  disagrees loudly** — auto-formatting commit hooks are near-universal practice.
  Attacked directly and the corpus won on the merits: the popular tooling's own
  documentation concedes its restaging fix "doesn't work for partially-staged
  files", and the documented consequence is precisely the corpus's staging-
  contract bullet — a hook running an add commits changes the author
  deliberately withheld, including debugging code, and they may push before
  noticing. The corpus states the mechanism more precisely than the write-ups
  advocating the practice. No edit.
- **`gate-laddering`'s "permanent red is no gate"** got a live specimen during
  this very session: a registry gate (`check-skills`) exited 1 on trunk from a
  concurrent commit, and merging continued. Confirms the claim as written,
  which already carries a wild measurement (zero successes across hundreds of
  runs). No edit — and see the deviation below.

## Open leads (banked, with return conditions)

- **A true positive left standing on trunk is a distinct death mode from a
  false positive, and the subject only names the second.** `false-positive-
  economics` explains death-by-imprecision; `gate-laddering` names permanent
  red as "no gate" but treats it as a diagnostic reading, not as a process
  failure with its own craft (who owns a red gate, what the clock is, what
  happens to the ladder while it stays red). Not minted this round: the
  training-data lane reached it but the search lane produced no independent
  convergence, so it does not clear the bar. Return condition: a second
  independent sighting, or any run that opens `false-positive-economics`.
- **Gate result caching** — a cache key that omits an input makes a gate pass
  on stale evidence. Verified as *already owned* by the golden path's
  "stale intermediates" bullet under gate-sees-target. Do not re-propose.

## Deviations observed (registry-local, for whoever owns the gate lane)

- `scripts/check-skills.mjs` exits 1 on trunk as of 2026-08-28, on
  `skills/architect/SKILL.md:576` — an em-dash inside a fenced code block, from
  commit `6377bb9`. Not fixed here: another session was active in that file and
  scope discipline says a research round does not repair a neighbour's lane.
  Recorded because the subject this round swept is the one that says a red
  binding rung is the first number to check.
- The registry's own enforcement binding is unexamined. The new technique's
  inventory exercise — enumerate what the pipeline emits, enumerate what the
  merge decision requires, diff both directions — has never been run here, and
  this repository has the gate suite that would make the answer interesting.
  Return condition: any run with authority over CI configuration.

## 2026-08-29 - /intake, the repair-time oracle

Second touch, one day after the `/deepen` round above:
[[2026-08-29-ai-native-sdlc-and-ci-on-call]], intake of a vendor SDLC
playbook batched with a first-party on-call account. Gained
`oracle-frozen-during-repair` (12 techniques, with `enforcement-binding` above) and an amendment to
`gate-laddering`'s placement matrix (asking controls sit at stage boundaries).
Golden path gained one section after "The gate must see its target".

## What the gap actually was

A missing stage, the shape the 2026-08-22 findings had. The subject's law is that a
gate must *see* its target; the repair task adds that the gate must not be
*writable by* the party it gates, and no technique sat at the point where a fixer
holds write access to the test. The rule existed one stage later -
`proposal-not-push` reserves test deletion and gate configuration for a human at
the merge gate - so the technique is the same rule enforced early, and says so.

## Standing

Was the #2 attention point (27) and never swept. This run touched two techniques
and the golden path; it did not sweep the other nine. Six consumer deviations
remain unread.

## Declines

None.


## 2026-08-30 - intake, operator-control-plane

Gained `prose-rule-drift`, the subject's missing **stage one**. The subject was
thorough from stage two onward - a gate can be decorative
(`severity-by-construction`), dead (`gate-liveness`), or unbound from the
decision (`enforcement-binding`) - and the case of a rule *never mechanised at
all* was named in the golden path's opening sentence and owned by nothing.

The diagnostic is the absence of a symptom: the forbidden action succeeds
normally, so a violation is indistinguishable from compliance at every surface
anyone would check. Risk region: prohibitions, on rare setup-shaped actions,
whose violations land where no gate reads. Remedy: refuse at the action, not at
review.

The technique gained a third section **from its own apply step**, which is the
part worth remembering. Run against a managed project, the audit turned up a
state the drafted version did not have: a checker that exists, is correct, is
named in the standing document with its exact invocation, and that **nothing
invokes**. Distinct from `gate-liveness` (runs, checks nothing) and
`enforcement-binding` (runs, sees, verdict not joined). The audit question had
to be sharpened from "is there a check?" to "what invokes it, on what event?"

Measured on the tree: one unbacked rule with **zero** violations across 785
files - which confirmed the technique's *boundary*, since that rule sits outside
its stated risk region on all three axes - and one nominally-backed rule with
**27** violations across four projects, found by running its own checker once.

## Standing

Was the #2 attention point (52). This run added one technique and one
application and did not sweep the other twelve techniques.

## 2026-08-31 - `/intake` herdr (Rust/backend lens), run `intake-herdr-rust`

13 -> 14 techniques. Two landings and both came from the same root: **what a
gate's instrument actually reads of the source.**

New technique `operation-assertion-gates`. The subject already owned the axis
via `blocking-by-input-determinism`, which enumerates exactly two advisory
shapes - debt-shaped and input-shaped. A timing gate is neither: its variance
lives in the apparatus, not in any input, so the technique's own promotion test
("name the work that would make this safe to promote") has no answer for it.
That gap landed as a third-class section in `blocking-by-input-determinism`
plus a golden-path paragraph, and the mechanism - scoped denylists, normalising
comments and literals out before matching, and testing the scanner rather than
only the codebase - became the new technique.

Amendment to `gate-laddering`: **source the compiler removed.** Conditional
compilation excises regions before semantic analysis, so a local rung of
formatter, type checker, linter and full suite reports clean over a
configuration it never analyzed. Distinct from an untested platform cell, which
is execution coverage and belongs to `packaging`; this is analysis coverage.
Home was contested and `packaging`'s own boundary settled it - its jurisdiction
"begins where the build system declares victory," and this happens before that.
Also a fourth bullet in the golden path's "gate must see its target"
enumeration, which had carried three.

Applied against personas, `experiment`, **`not-better`**: 4 of 4 checkers
already refuse an empty scope, one stating the rule almost verbatim. The seam
did yield the technique's condition - 0 of 21 tree-based lint rules carry
tests against 3 of ~15 text checkers, with one untested rule holding 59% of all
custom-rule suppressions.

Contended with `omniroute-0831`, which held this subject live; golden-path
edits were made under the `content` lock.

## 2026-08-31 - the item side of the gate (`tc39-proposals-0831`)

Two techniques from a public standards committee's own tracking repository,
both landing on the same asymmetry: **all 14 prior techniques take the
checker as their subject** - its severity, input determinism, liveness, false
positives, projections - and **none takes the thing being gated.** The subject
modelled one-shot refusal exhaustively and had no model of an item that lives
for years and must carry accumulated evidence across many advancement
decisions.

`advancement-evidence-fields`: the record an item carries per obligation.
Schema is the ladder (the field is minted at the stage its obligation binds,
retired when discharged); the non-satisfied side needs a closed four-state
vocabulary because a blank merges "not yet", "done but unrecorded" and "nobody
looked". Supplies the resolution `unmeasurable-criteria` structurally cannot -
its three (skip / fail-closed / refuse) all vanish with the run, and a durable
record adds a fourth: **advance anyway, with the hole written into the row**,
which is the honest move for a gate whose verdict a vote can override.

`item-liveness`: the deliberate mirror of `gate-liveness`. A gate green for a
year is unverified machinery; an item in flight for a year whose owner stopped
speaking is unverified work. Ownership is the one entrance criterion that
decays after admission, so checking it once makes it a birth certificate.

Measured from the source's own record: 7 of 46 terminated items name owner
departure as the sole cause (largest named category, ahead of every technical
objection), three closed the same day - the signature of a once-in-a-decade
manual sweep. 30 of 92 in-flight items had been silent two years or more,
quietest since nine years earlier, all listed as active. The natural
experiment that carried `advancement-evidence-fields`: one board, two
obligations, two conventions - the field with explicit markers left 8 of 18
holes legible and attributable, the field with blanks left 16 of 29 (55%)
unreadable, **and the readable obligation is the one that gets discharged**
though neither blocks anything.

The fetch (1 of 3, on the process document) inverted the source rather than
confirming it: the process *requires* the test suite at the stage where the
tracker's column appears, and items sit one and two stages past it with the
cell openly non-satisfied. It also returned the sentence that made
`item-liveness` a technique instead of an observation - **no explicit rule
addresses stalled proposals or automatic removal**, and a departed owner is
replaced only if someone *volunteers*.

Applied: `advancement-evidence-fields` against personas, `experiment`,
**`better`** - 11 of 15 passport dimensions resolve from structured fields
under the shipped schema vs 15 of 15 under the four-state field, and 0 of 15
have an individually knowable evidence age against one collection-level date.
The predicted unreadable-blank population was **absent** (0 of 15), reported
as a negative: the discipline is the author's, not the schema's. Structural
fact worth more than either arm - the schema has no `reason` field anywhere,
so *absent-with-a-pointer-to-why*, the state the technique calls most
valuable, **is inexpressible**; `skippedByChoice` is a boolean, which is what
an absence state degenerates to when added as an afterthought.

`item-liveness` against this repo's own harvest queue and watchlist,
`experiment`, **`unmeasurable`** - and it earned the technique an amendment.
Its central claim is that last-touched is free because the trail already
exists; a flat status queue (177 entries, one status, one collection-level
date) has **no per-item trail at all**, so the diagnostic has no input at any
price. The technique now states that precondition and names the cost where it
fails. Effect unmeasurable because the queue is three days old; instrument
named (a per-entry `touched` date, or a join to the dated run ledgers), return
condition set at 90 days.

Contended with `whatwg-html-0831`, which held this subject live and landed
`fabrication-economics` into it mid-run without yet declaring it in the golden
path. Golden-path edits were made under the `content` lock; the index was
regenerated inside the `index` lock and consequently carries that sibling's
undeclared technique, so the generated artifacts were left unstaged for
whoever finishes last.

## 2026-08-31 — `whatwg-html-0831` (intake, `github:whatwg/html` @ `778afd9`)

Landed `fabrication-economics`, declared in the golden path (roster entry, prose
section "False compliance is how rules die", technique list entry) and applied
same-run — the mid-run state a sibling note recorded as undeclared was a Phase 7
snapshot, not the landing.

The technique is the **mirror of `false-positive-economics`**: that one is how a
*gate* dies (firing on correct content, bypass becomes reflex); this is how a
*rule* dies, leaving the gate healthy and the report green forever. Where a
requirement's satisfaction cannot be verified, the author with nothing true to
write is offered two moves and the fabrication is always cheaper — **the gate is
not fooled, it is the cause** — so no detector improvement helps and the fix
moves to the rule's design: a declared inability token, artifact stays
non-conforming, verdict silent, census counted elsewhere, token itself exempt.

Home found by the enumeration hunt against `unmeasurable-criteria`, which states
"there are exactly three honest resolutions" over a *missing* value. Here nothing
is missing — the gate reads the value perfectly and the undecidable part is the
requirement behind it — and the fourth state is **known-violating, deliberately
unreported, separately counted**. Two of that technique's rules invert (a skip
must be loud; this token must be silent in the verdict) and the discriminator is
written on both sides: does a louder report yield more information, or a worse
artifact?

Applied to `personas` as a paired experiment, `better`, and **the seam amended
the technique**. The tree has no accessibility linter at all — 21 hand-written
lint rules, none touching the field — and 55.6% of its 63 `<img>` elements still
carry the null-shaped value. So the technique now states that a gate is
*sufficient, not necessary*: the pressure comes from the requirement's shape and
propagates by convention and editor completion. Arm A raises 1 finding and it is
a false positive; the one site in the tree that declares its decorative intent
with the platform's real mechanism is the one site the standard rule reports.

Contended for the whole run with `tc39-proposals-0831`, which held this subject
and was mining the other major web standard's process repository. That routed
this source's change-admission gate (two-implementer interest plus filed
downstream obligations) **away** as untriaged rather than mined — the sibling's
source is the better authority for staged advancement. Golden-path edits under
the `content` lock; the re-read inside it found two techniques the sibling had
added between Phase 4 and Phase 7, and the insert preserved both.

The generated index and catalog were regenerated under the `index` lock and left
**unstaged**: three siblings held uncommitted or untracked content, so a
committed index would reference files absent from `HEAD`.

## 2026-08-31 - /intake, github:TkDodo/knip

Landed `excess-indicts-the-instrument` (new technique). The subject's
instrument-failure vocabulary was **one-directional**: `gate-liveness` enumerates
zero-files-walked, rules-failed-to-load, tool-absent, trigger-never-fired,
green-for-a-year - every one a *deficiency* signal. Nothing anywhere in 17
techniques treated a finding population that is too **large** as a signal about
the checker rather than the tree.

The trap is a composition of three existing techniques, and it is worth naming
because none of them is wrong alone: `blocking-by-input-determinism` says a
thousand pre-existing findings is "a statement about the backlog, not about the
check"; `ratchet-design` freezes that number as a baseline; `ratchet-design`
then guards only the *drop* below it. Baseline a population produced by a wrong
root set and the ratchet defends the misconfiguration permanently, because the
count only ever goes down and every subsequent run confirms it.

**The A/B refuted the technique's own discriminator and the correction shipped
with it.** Against a managed project's committed baseline - 230 unreachable files
of 982 walked, 23.4%, frozen 2026-08-24 - the distribution test fired on 7
clusters at 2.4-4.3x lift, several at 100% directory saturation, and **all 7 were
genuine dead code with 0 root errors.** Confound: dead code arrives in whole
features, so both hypotheses predict the same distribution. Clustering is a
sampler; a referrer check per cluster is the discriminator. Recorded
`not-better`, which is the honest verdict and the most useful row in the ledger.

Not landed, deliberately: the source's advisory-by-default plus one escalation
flag is `gate-laddering` and `severity-by-construction` already; only the
detail that the report's *rendering* follows the severity setting is novel, and
it is one sentence.


## 2026-08-31 — `/intake` icse-2026-seip: the spiral's unstated precondition

`false-positive-economics` opened by calling precision "the survival property"
and stated the death spiral unconditionally, with step 1 reading "The author,
knowing they are right, bypasses or suppresses it." **That author is a
precondition, not scenery**, and two independent industrial measurements from
one venue-year found the cases where they are absent.

This is the run's genuine within-index convergence, and it is worth recording
*how* it was earned, because the convergence the wave was actually ranked on
turned out to be fake (two benchmark papers where the second cites the first).
These two were admitted for unrelated reasons — one ranked as a gate technique,
one as a static-analysis measurement — and are independent by every test that
matters: different authors, institutions, countries, problem domains, and
neither cites the other.

- **Nobody was entitled to the artifact.** A repair pipeline ships its proposal
  filter at precision **0.30** against a population base rate of **0.19**, and
  is right to. The refused thing is a machine-generated candidate, so a false
  positive costs one wasted generation rather than a person's obedience.
- **The power to close was taken from the author.** A mandatory pre-integration
  detector ran at a **76%** false-alarm rate (above 90% counting exclusions) for
  ten months, unbypassed and undeleted, because an alarm the first reviewer
  calls false goes to a **second** reviewer before it may be closed.

Landed as an amendment section, plus two obligations the same sources measured:
read precision **against the population's prevalence** (the no-skill policy that
accepts everything has precision equal to the base rate, so 0.30 is a gain at
0.19 and a loss at 0.40), and grade a downstream suppressor on its **recall**,
not its suppression rate — the degenerate suppressor that calls everything a
false positive scores a perfect suppression rate and an accuracy equal to the
base rate.

Deliberately **not** landed, though both are real and both are recorded here so
a later run does not re-derive them:

- The same repair-pipeline source contradicts `fabrication-economics` head-on
  and then repairs it: it has a model *generate* a fix specification with no
  access to ground truth — textbook fabrication by that technique's own table —
  and measures it working (spec-based false-positive rate 0.28 vs 0.64 without).
  The boundary it implies is sharp and I did not have a second sighting for it:
  **a fabricated criterion is admissible when it ranks a population and
  inadmissible when it certifies an instance.** Ranking tolerates a wrong rubric
  statistically; certification does not. **Return condition:** one more
  independent source, or a project seam where a generated rubric ranks.
- `excess-indicts-the-instrument` offers a binary discriminator — debt
  distributed like the code, or misconfiguration clustering on a boundary. The
  static-analysis source is a **third shape**: excess by construction, from a
  deliberate soundness-over-precision design, where the volume indicts neither.
  The technique's standing rule would fire there and be wrong. One clause.
  **Return condition:** the next deliberate edit of that technique.

Applied to a consumer's governed-taxonomy proposal gate (`experiment`,
`unmeasurable`, no change owed): 12 sites setting the live flag hand-verified
to **0** production paths promoting a machine proposal without a human. The tree
already implements the amendment, for governance reasons, with the precision
economics falling out for free. Instrument named for the missing behavioural
arm: per-proposal review-outcome telemetry, which the project does not emit.

## 2026-08-31 — `/intake` (`semantica`)

18 -> 19 techniques. Landed `vacuous-by-evaluation`.

Found by the Phase 6 enumeration hunt against this subject's own golden path, which
declares its completeness: "a gate exists only if it can fail… name the input that
makes it block", followed by three ways a check fails that test. All three are
defects of **plumbing** and all three are found the same way — trace the exit-code
path. The source supplied a fourth that the prescribed discipline cannot find,
because the plumbing is correct: the rule is blocking, the exit code depends on it,
the engine reads the real target, and the **evaluation layer beneath the rule derives
the condition the rule tests**. A constraint asserting a value's declared type,
evaluated under a regime that infers the declared type onto every value, reports
conformant on non-conforming data.

Deliberately not folded into `severity-by-construction` (which owns "can this
severity ever fail a build" and traces the plumbing) or `unmeasurable-criteria`
(which owns a condition with no data to evaluate — here there is data, the rule is
evaluated, and it passes). The golden path's three-item enumeration now names the
fourth and links out.

Phase 7.5 (`personas`, code, `better`) — the strongest arm this run produced. The
project's conformance checker is wired to a merge gate and reports 92%, 0 fail. Two
arms over the same filesystem: a manifest declaring its three path pointers, and the
same manifest with the entire `paths:` block **deleted**. Both scored 100%, 0 fail, 0
warn, byte-identical, and the second printed `[OK] context index
.ai/context-index.json` — a path it never declared. The defaulting layer directly
above the predicate supplies the value before the existence check reads it, so three
checks labelled as manifest-pointer resolution are filesystem existence checks that
cannot fail with respect to the manifest. A separate observation — the only rule that
verifies capability commands actually work sits behind a flag CI does not pass — was
classified to `gate-liveness` rather than folded in to inflate the finding. Ship 0
(confirmation); the fix is ~6 lines and the fixture exists.

## 2026-09-01 — `/intake`, source `github:kunchenguid/firstmate`

19 -> 20 techniques, 11 -> 13 applications. One new technique and one
amendment, both from a multi-harness agent-supervision codebase whose
`docs/verification/` lane records dated measurements and explicitly-marked
uncovered surfaces.

- **`self-reported-gate-inputs` (new).** A fifth way a gate is unfireable,
  beside the three in `severity-by-construction` and the derived condition in
  `vacuous-by-evaluation`: severity real, exit code dependent, evaluation
  honest — and the input supplied by the party being judged, so the population
  it judges is exactly the one that did not need judging. The sharp form is
  structural inertness rather than evasion, and the recovery instinct is
  provably dead: no check keyed on the record can detect the record's absence.
  Carries the override half — where the gated party is machinery, after-the-fact
  attribution is circular, so the escape hatch needs a property of the
  **channel** (unwritable by the subject during the run it would authorize),
  which is a different discipline from `enforcement-binding`'s ledger.
- **`unmeasurable-criteria` (amendment).** Its three resolutions are correct for
  a gate standing *beside* the work; one branch inverts for a gate standing *in*
  it. Splits the previously-single "hole in the gate's own vision" into *the
  instrument did not run* and *the instrument ran and could not decide* — the
  first must not block an in-path actor, because the remedy path runs through
  the capability being denied; the second stays FAIL-CLOSED.

**Both applied `experiment`/`better`.** The amendment's own wording was
**refuted by the apply** before commit: a fleet turn-end hook already ships the
split with three exit codes, routing could-not-check to the operator as
non-blocking, which showed the draft's "fail-open, silently" was wrong —
withdrawing and going quiet are two decisions and only the first is licensed.
Rewritten to *open to the actor, loud to the operator, on a code of its own*.

The `self-reported-gate-inputs` application is this registry's own concurrency
board, whose `check` returns bytes indistinguishable between "an unclaimed
writer is mid-edit" and "nobody is here" — and whose failure the method's own
prose already names as an anti-pattern without mechanising it
(`prose-rule-drift`, with the reason now supplied).

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

Five leads (ascent, kp, personas). New technique `instrument-answers-only-its-own-question`:
a fast rung's green is no evidence for the slow rung's question, the disabling config is
invisible at the call site, and an automated author verifies with the instrument that owns
the question its edit raises. Amendments: `chokepoint-tag-registry` (location tables resolve
against the tree; never re-declare the prefixes in the suite; every door into a chokepoint is
an enumerated table whose names must resolve, failing as a broken instrument);
`self-reported-gate-inputs` (derive any gate's walked population; assert it found something)
with the reconciling sentence in `operation-assertion-gates`; `ratchet-design` (refusing
silence on a drop is not refusing the build - where editors are fewer than fixers the drop
is a loud counted note, and unattended downward recording is the one sanctioned exception).
Applications: `node--instrument-answers-only-its-own-question` (ascent), `node--ratchet-design`
(kp). Sibling intake touched this subject the same day; both diffs coexist.
## 2026-09-01 - prose-rule-drift gains its converse: the artifact rule enforced at the edit

Amendment landed by [[2026-09-01-awesome-game-security]] (run `intake-game-security`,
3 siblings live, none on this subject). The technique's own section says action-shaped
rules go unbacked because a gate has nowhere to read; the converse is a rule about an
**artifact's size** that gets its only check at the **edit** (append <=2 lines, touch
<=8 files, "short cite"), so every step is compliant and the sum is never read. The
violation is composed entirely of compliant actions. Two measured instances: an
external machine-maintained wiki at 13.6x its stated page cap after ~3,950 capped
ingests with the lint pass that alone read the sum starved by the ingest queue
(0 runs in 9 days), and a connected project's shared session-memory file over its
200-line cap for 13 days across 26 consecutive commits that all obeyed the 2-line
append cap. Applied `code`/`better` on that project, `ab-paired` over the same 59
commits with two checks (per-edit: 0/26 flagged since the crossing; artifact: 26/26),
calibrated first on a known-clean backlog and a known-over page. Shipped: an
artifact-reading check with the document's own prune remedy adjacent, wired at the end
of the per-CLI gate. Application `next--prose-rule-drift`. Left open: the per-CLI gate
is a per-edit quantifier by construction, which is exactly where the amendment predicts
the artifact rule has no home; the check sits at its end as the fail-closed fallback,
not in an appender that could refuse.


## 2026-09-02 - intake (dora, run intake-dora-0902)

`gate-liveness` gained "Assert the oracle, not only the instrument": a
score-shaped gate has two populations, the targets and the oracle that
judges them, and the oracle's default scope is silently narrower than the
tests that actually protect a target whenever those live in another
package, another runner or a spawned process. Two rules: declare the
oracle's population in the baseline's predicate; test a surprising number
against the smallest controlled experiment before believing it. This is
the deficient-direction twin of `excess-indicts-the-instrument`. Source:
a QA report's measured case (5.8% mutation score under package scope, 21
of 21 escaped mutants caught under workspace scope). New application
`next--gate-liveness` (experiment, better) against a coverage gate that
repaired its target population the day before and left the oracle at the
default, with eight spawn-driven scripts invisible to the instrument.

Catches recorded in the source note: the unwrap-ratchet founding baseline
that counted test code (second sighting of the trap
`excess-indicts-the-instrument` names); "what would fail if this job were
removed" (time since last red). Lead banked: verification tiers organised
by latency budget - check `gate-laddering` for the axis next time it is
open.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

`cpp--enforcement-binding` application only (a catch): an external linter module pinned by
hash in CI with findings posted as review comments. The review-comment half is the
reusable part; the fleet already keeps its lint rules in-repo.
### 2026-09-03 - `/intake`, from a vendor's official MCP server monorepo

`gate-laddering` gained the runtime rung. Source: [[2026-09-03-microsoft-mcp]].

The ladder ran editor -> commit -> push -> merge pipeline, sized by latency, with the
merge pipeline named as the binding rung. That enumeration is complete for checks running
in a development pipeline and has no rung for a check that runs when the *shipped artifact
starts* - which is where an integrity invariant over a hand-maintained mapping has to run,
because only the composed program can evaluate it.

What makes it a genuinely new rung rather than another column is that its severity splits
by **audience, not stage**: the same defect is fatal on a developer build (fastest possible
feedback, costs nothing) and advisory in the shipped artifact (refusing to start would take
down a service over one bad entry while every other entry is fine). Every other rung splits
severity by stage.

The cautionary half came from the source's own underpayment, and it is why the rung needs
`gate-liveness` more than any other: the assertions ran only in developer builds, were
additionally skipped under two commonly set flags, and the worst case - a group that lost
every one of its members - was short-circuited silently in all configurations. A rung whose
green nobody observes has no pipeline log to notice its absence.

**Contended**: a sibling run held this subject, but only a technique file was amended, so
no shared list was touched.

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+1 technique: **`deterministic-proxy-gate`**. This closes a hole the subject
*states and leaves open*. `operation-assertion-gates` says the two-class axis
offers only two honest configurations for a cost gate, rejects both, offers one
escape (restate the standard as source text) and admits it "holds the shape; it
does not hold the number."

The fourth resolution: keep the standard, swap the **apparatus**. A deterministic
count of work performed is a function of the tree — same revision, same number,
any machine, any load — so it satisfies `blocking-by-input-determinism` where
elapsed time fails. Priced: large constant-factor slowdown, blindness to
everything time measures that work-count does not. Inverts where the standard is
genuinely wall-clock (I/O-, syscall-, bandwidth- or parallelism-bound).

**Contradiction resolved against the source.** It says block the pull request on a
wall-clock regression at a guessed 20% threshold; `operation-assertion-gates` and
`noise-band-and-hysteresis` ("a guessed band is a censorship policy with no
evidence") rule that dishonest. Our verdict holds on the source's own evidence —
its mitigation concedes the apparatus is nondeterministic.

Reduces a measured attention point on the #2 worklist subject (52 points).

The subject also **gave up a stage**: invariant placement now lives in the new
`invariant-placement` subject, which is the rung-zero this golden path's
vocabulary could not describe.

## 2026-09-04 - [[2026-09-04-cargo-make]] (intake, run cargomake-0904)

`gate-liveness` gained a section: **reporting could-not-run and routing it are separate decisions.**

The technique's line "any check that folds could-not-run into pass has pre-committed to the worst failure mode" fuses two things. What decides the routing is *what this gate's green authorizes*: a green that authorizes shipping must route could-not-run to fail; a green that authorizes **skipping optional work** (is the installed helper new enough, is the cache still valid) routes it to pass - because there a false green means the system continues with the state it already had, and a false red is a permanent tax the team removes by deleting the check. Three obligations come with the routing: report it anyway, write the blast radius down, and keep it off the ladder and out of gate inventories.

**Corroborated by an asymmetry inside one external tree**, which is why this landed as a boundary rather than a correction: the same binary refuses outright when a document declares it needs a newer reader (a defect would escape) and proceeds when it cannot determine an installed dependency's version (only redundant work is at stake).

**Applied here and shipped:** the registry's catalog builder met obligations 1 and 3 and missed 2 - it drops an unparseable usage contributor and then publishes a derived count whose predicate omits how many files were attempted. Fixed; see the applied ledger. No application document - the node--gate-liveness filename is held by an unrelated tree, which is a real limit of the one-slot-per-(stack, technique) rule and is filed as a lesson.

## 2026-09-04 - `gamedev-res` (intake, `github:Kavex/GameDev-Resources` @ `f7c89aa`)

Amendment to `gate-liveness`: **"When the observable is absence rather than
green"** - plus `applications/process--gate-liveness.md`.

The trigger section closed with "the observable, in every case, is green," which
is an enumeration and invited exactly one question. The case it does not contain
is the gate **decommissioned from outside**: a hosted runner's free tier
withdrawn, a transport the code host removed, an upstream checker repository now
404. None produce a commit, so every repository-local signal stays healthy while
the gate stops existing. It does not go false-green - it leaves the inventory, and
the subject's standing metric (*time since last red, per gate*) is defined over
that inventory and so cannot fire.

Three obligations added: well-formed is not alive; give every gate a surface that
decays visibly; audit the inventory against the provider, not only the gates
against their targets. The last is the only one no repository-local check can
satisfy, which is why the class survived twelve techniques.

Evidence is a twelve-year public curated index that accepted **65 content commits**
under a gate that could not have run for any of them, with no badge and no required
check. The structural fact nobody designed: its only surviving in-repo evidence of
a gate is the gate's *tuning* - an accept list and a nine-host exemption list,
accreted from real diagnosed failures, now configuration for a program that cannot
be installed. Accumulated tuning reads as proof a gate runs; it is only proof one
once ran.

Applied here in this registry: `.github/workflows/knowledge.yml` gained a weekly
`schedule:` (it had none) so every job has a heartbeat, plus an advisory
`citations` job. Ship row in `librarian/applied.md`.

## 2026-09-04 — `/intake`, agentic-testing (run `agentic-testing-0904`)

Source: a weekly concept explainer on agentic testing (second-hand practitioner
listicle over four primaries). Expected yield stated as 1–2 landings and mostly
catches; that held — 13 candidates, 8 caught, 2 landed here, 3 untriaged.

**New technique: `renameable-detector-keys`.** The sibling of
`self-reported-gate-inputs`, one step earlier in the failure: the record can be
complete and honest and the gate still misses, because the *key the detector
matches on* is something the author can change without changing what the check
is about. The distinction that decides the remedy is accidental gap (extend the
list) versus concealable key (the list's length was never the constraint). Where
no invariant key exists — anything turning on reference or meaning — the
prescription is that the pass states its own predicate rather than the property
it proxies. Originated by a commenter on the source describing their own tool,
converging with the article's independent thesis that a name is a fragile key;
one root, two signs, two voices.

**Amendment: `blocking-by-input-determinism`** gains a third variance. Found by
the enumeration hunt against its own heading, "Two advisory-nesses, and only one
of them expires". Both of those are about the *input*; a gate can be
non-deterministic while its input is perfectly still, because the variance is in
the instrument. The technique's practical test is temporal and a sampled judge
does not move, it varies — so it was being sorted as permanently advisory, which
writes off a fixable gate and, worse, grades a statistically-varying check as
safe to block on one run. No standing sentence changed: the two advisory-nesses
remain a complete account of input variance, and the instrument is a second axis.

**Applied, both rows.** `renameable-detector-keys` A/B-paired against this
registry's own purity denylist (arm A named product → 1 violation; arm B same
product described and not named → 0 violations, gate green over an equally
impure document); shipped the one-line verdict predicate to `check-bundles.mjs`,
which changes no detection and removes an overclaim. The amendment walked as a
three-case simulation across this registry and two consumer trees, with the
falsifier stated first — all three sort differently under the third bucket, and
two of the trees had already implemented its prescription independently, so
nothing was shipped to them and that zero is a result.

State: 23 → 24 techniques, 21 → 23 applications. Still one of the densest
subjects in the bundle; both landings sit in the seam between it and the
`eval-harness` reliability lane, and the amendment now links across to
`reliability-aggregation` for the aggregation half.

## 2026-09-04 - a production reverse proxy (`/intake`, round 23)

One amendment to `ratchet-design` in two parts, and one sentence into
`blocking-by-input-determinism` that belongs to a boundary this subject shares
with `test-input-generation`.

**The second severity split.** `ratchet-design` splits one metric's two
*directions* by severity — a rise blocks, a drop is a loud counted note. A
ratchet carrying a **named allowlist** rather than a bare count admits a second
split along the *population*: the blocking consumer evaluates everything outside
the list, the advisory consumer evaluates the list itself and emits on every
run, so the retirement queue does not go dark while the gate is green. The
source's instance is a 60-line test that walks its own source tree, sharing its
scanner with a build-time warning emitter through a single included file
precisely so the gate and the advisory cannot diverge. The amendment states two
obligations: one implementation feeding both consumers (which is
`gate-laddering:188-195` applied inside one run rather than across two stages,
and is cited rather than restated), and the advisory must **count** rather than
enumerate — a per-entry warning stream with no total is invisible in any
non-interactive run.

**The retention case, which resolves a contradiction this corpus was already
carrying.** `ratchet-design`'s "endgame: graduation" instructs deleting an
emptied baseline; `ipc-contract`'s `node--command-registration` application
records the opposite decision with a reason ("the empty baseline is kept because
it *states* zero orphans is the standard"). The source is a third instance — an
empty `KNOWN_PREEXISTING_VIOLATIONS` list retained with a comment explaining
why — and a fourth turned up in the fleet during Phase 7.5: a mojibake ratchet
whose baseline is 14 buckets at zero, kept. Four instances against one
instruction is not a majority to resolve, it is a missing case, so the amendment
names both endings and prices the risk the original text worried about
(re-baselining "just this once") against whether edits to the list are reviewed.

**The catch worth recording**, because it was the run's most promising-looking
candidate and it is already owned: the dual-consumer detector. `gate-laddering`
holds all of it — one script wired into both layers, severity splitting by
audience, rungs differing in scope and severity but never in rule content. The
source's shared-scanner trick is a placement variant (split by tool inside one
build rather than by stage), not a mechanism, and no technique was spent on it.
Also caught: `prose-rule-drift:46-49` already owns which rules go unmechanised.
The residual — that even among artifact-shaped rules only the *syntactically
local* one gets a guard — is banked untriaged with anchors.

Apply: `not-better` on personas-web, whose all-zero retained baseline is the
retention case found in the fleet rather than argued. The population-split half
is `unmeasurable` there and the row says so: an empty allowlist has no
population to run an advisory over.
