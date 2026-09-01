---
subject: quality-gates
domain: software-engineering
last_touched: 2026-09-01
touched_by: librarian-inbox-writer
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
