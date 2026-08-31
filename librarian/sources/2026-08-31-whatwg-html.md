---
source: github:whatwg/html
kind: standard repository (living specification)
url: https://github.com/whatwg/html
title: HTML Standard
author: WHATWG (multi-editor, ~20 years of revisions)
commit: 778afd942c67b78335a4becc28c1c725a25d1cab
words: 302 landing page / 717,109 in-tree (source 711,540 + FAQ 5,472 + README 97)
read_fraction: 2374x — the sharpest the ledger holds
extracted: 13
accepted: 2
declined: 0
leads: 2
already_covered: 3
untriaged: 6
dispatched: 0
applied: 2
shipped: 0
fetches: 0 of 3
run_id: whatwg-html-0831
siblings: 2 live at claim, 5 by Phase 7
---

# The HTML Standard — a source that can authorize, mined for how it governs itself

## Class and expected yield

**Standard repository** — a class the ledger has not held before, and the top
tier of the corroboration table. Every prior repository run has been a
practitioner codebase that could *originate* a finding and needed something else
to authorize it. This one authorizes directly: it is a primary normative
document, and the constraints it states about its own conformance model are
facts rather than opinions.

Expected yield read at Phase 2, before the triage table: **low count, high
altitude.** A standard's subject matter is almost entirely un-strippable — its
substance *is* proper nouns, element names, attribute names, algorithms for one
format — so the ordinary extraction lane returns nothing. What survives the
strip test is the layer nobody reads it for: **how a specification is engineered
as an artifact.** Two or three findings, at doctrine level, was the prediction.
Two landed.

Phase 2b applied. Landing page 302 words; the tree holds 717,109. A README-only
read would have been a **0.04% sample of the advertisement** — the extreme of
the read-fraction tell, and worth recording as the class's calibration point.

## What was swept

`source` (7.9 MB, 711,540 words — the standard itself, in a dialect of the
format it defines), `FAQ.md` (5,472 words — the operating doctrine: why there
are no versions, what conformance is for, why features are refused),
`.github/CONTRIBUTING.md` (the style guide, the algorithm markup contract, the
audience-projection rules), `.github/pull_request_template.md` (the change
admission checklist), `.github/workflows/build.yml` (the whole CI — a container
invocation and an rsync), `Makefile` (two lines, pointing at CONTRIBUTING).
`review-drafts/` (109 MB) is snapshots of the same text and was not read.

The README was read last and contributed nothing, as it has in every repository
run since 2026-08-27.

## Board

2 live siblings at claim; 5 by Phase 7. `tc39-proposals-0831` — the process
repository of the *other* major web standard — held `quality-gates` for the whole
run, which **changed what this run mined**. The obvious extraction from this
source's PR template is its change-admission gate ("at least two implementers
are interested (and none opposed)", plus a filed obligation in the test suite,
in each engine's tracker, in the two accessibility mapping specifications, and
in the documentation site). That is the canonical staged-advancement material
and the sibling's source is the better authority for it, so it was routed away
and is recorded untriaged below rather than mined. Both landings came from
material that source does not carry.

`quality-gates`'s golden path was edited under the `content` lock with a
re-read inside it, and the re-read paid: the sibling had added two techniques to
the roster between Phase 4 and Phase 7. The insert preserved both.

## Landed

### 1. `fabrication-economics` — quality-gates (new technique)

**Anchor:** `source:35186-35245`, the guidance for markup generators and
conformance checkers around an image's alternative-text requirement.

The standard mints a non-conforming, machine-readable attribute meaning *this
generator could not obtain the required value*, and then requires conformance
checkers to **silently ignore** the resulting error — with the reason stated in
the normative text: *"This is intended to avoid markup generators from being
pressured into replacing the error of omitting the attribute with the even more
egregious error of providing phony alternative text, because state-of-the-art
automated conformance checkers cannot distinguish phony alternative text from
correct alternative text."* And the doubling rule beside it: a checker that
suppresses the missing-value error **must also not report the marker's
presence**, or the pressure has been relocated rather than removed.

Stripped, that is a general law of enforcement economics and the mirror of a
technique the subject already has. `false-positive-economics` says a gate dies
of firing on correct content. This says a **rule** dies of false compliance,
which leaves the gate perfectly healthy and the report permanently green. The
gate is not fooled by the fabrication — **the gate causes it**, so no
improvement to the detector can help, and the fix moves to the rule's design: a
third value, in band, that the verdict channel ignores and a census counts.

Second half of the technique, from `source:2114-2118`: the standard *names its
own undecidable clauses* — "Automated conformance checkers are exempt from
detecting errors that require interpretation of the author's intent" — which
makes a checker's denominator a property of the standard rather than an accident
of the implementation. That is what `pass-ratio-comparability` needs and could
not previously get.

**Home found by the enumeration hunt, twelfth consecutive pay.**
`unmeasurable-criteria` states "there are exactly three honest resolutions"
(SKIP / FAIL-CLOSED / REFUSE) on the axis *does the absence describe the
subject's world or the gate's own vision?* This case has **no absence at all** —
the value is present and the gate reads it with total reliability; the
undecidable part is the requirement behind it. The fourth state the enumeration
does not contain is **known-violating, deliberately unreported, separately
counted**. Two of that technique's rules also invert here, and saying so is the
boundary: a skip must be loud, a fabrication-relief token must be silent in the
verdict, and the discriminator is whether a louder report yields more
information or a worse artifact.

**Prior art read and cited, not duplicated.** `generated-from-provenance` in
`repo-manifest-standard` already holds the authoring half ("leave a marker,
never invent") and states that the placeholder is detectable "**so the checker
can report the field as unfilled**" — the exact opposite of what this source
requires, for a reason the corpus had not reached. The new technique cites it
and carries the disagreement explicitly.

### 2. `declared-deviation-register` — conformance-checking (new technique)

**Anchor:** nine marked instances in `source` (`2264` defines the term as a
linkable concept imported from the family's shared foundational document; uses
at `5301`, `5319`, `52024`, `98322`, `98378`, `150413`), plus two boundary
cases: `150363` marks a weaker class ("not strictly a violation... but it does
contradict the spirit"), and `38455` carries an editors' source comment
*rejecting* a candidate ("but not really a willful violation since it's not that
the types are not being ignored, just that...").

A specification that claims conformance to other specifications and deliberately
breaks six of them, **in its own normative text, in its own conformance
vocabulary, per site**, each entry naming the document, the clause, the
motivation stated as a cost, and — twice — the upstream issue where the
conflict is being negotiated. The refs carry `<!-- note: version matters for
this ref -->`: a deviation is pinned to a revision.

`research-map` returned **PRIOR ART: none** for `"intentional nonconformance"`
and for `"why we deviate"` across 341 subjects in 8 bundles. That is a real
hole, not a slug miss — checked against the four nearest subjects by opening
them.

The corpus-shaped consequence is arithmetic, and it lands on
`pass-ratio-comparability`: an accepted deviation must be a **third finding
class**, never a suppression (which inflates the ratio by exactly the number of
failures the team accepted — the incentive backwards) and never an ordinary
failure (which puts permanent red in a report, and a team calibrated to a
non-zero floor cannot see anything new arrive). Reported as its own class it
supplies the distinction no checker can compute: *this failure is new* versus
*this failure is a decision*.

Boundary drawn from the source's own discipline: being stricter where the
upstream permits latitude is not a deviation, a special case ahead of a general
rule is not a deviation, and the rejected candidates are worth recording because
the argument gets re-derived otherwise. Six entries over 711,540 words is what a
maintained register looks like.

**Shared root with #1, stated in both files and not merged.** Both are a true,
known violation that must be declared in band and must not be reported as news.
They were kept apart because the decision rules do not overlap: an author who
*could not comply* versus a maintainer who *chose not to*, with different
failure modes (a fabrication nobody can detect; a repair that reintroduces the
avoided problem) and different required fields.

## Applied — 2 rows for 2 landings, both `better`

### `fabrication-economics` → `personas`, **experiment**, `better`, `ab-paired`

63 rendered `<img>` elements across 2,152 component files at `e7fbae7bb`, one
population, one instrument, two predicates.

| arm | predicate | findings |
| --- | --- | --- |
| A | the rule as teams adopt it — does the element carry the attribute? | **1**, and it is a false positive |
| B | is the *no-content claim* one the markup can support? | **35** (55.6%) |

Arm B: 30 sites where the empty value sits on a runtime-computed source
(`src={user.avatar_url}`, `src={customSrc}`, `src={r.thumbnailDataUrl}`) — an
assertion that the image carries no information, written where what the element
will show is not yet known — plus 5 where the file's own name was used as the
description.

**The run's premise was disproved and the result got stronger.** The tree has no
accessibility linter at all: 21 hand-written lint rules, none touching the
field, and the ecosystem's standard plugin not installed. The fabrication is
there anyway, at a clear majority of the population, with nothing enforcing it.
So the technique gained a measured correction rather than a confirmation: **the
gate is sufficient, not necessary** — the pressure comes from the requirement's
shape and propagates by convention and editor completion; a gate industrialises
it and makes it countable.

**The structural fact is the good kind.** The single site in the tree that
documents its decorative intent — in prose, with the platform's actual
remove-from-the-tree mechanism — is the single site arm A reports, and it is
correct as written. Every one of the 43 sites that used the cheap token is
silent and passes. Nobody designed that inversion; it falls out of the two
mechanisms being different markup with opposite gate treatment.

### `declared-deviation-register` → `personas`, **simulation**, `better`, `structural-only`

Population: 8 behavioural conformance claims to external specifications, after
excluding ~200 incidental format references (citing a timestamp format is not a
claim about behaviour). **Declared deviations: 1 of 8. Enumerable without
reading implementation code: 0 of 8.** No register exists in any surface.

The one entry (`variableSanitizer.ts:25`, a deliberately simple address pattern
chosen to avoid catastrophic backtracking) scores 2 of the technique's 4 fields
— document and motivation, no clause, no version — and lives as a doc comment
on a constant in a sanitizer module.

The structural fact: a module header claiming a named remote-procedure protocol,
whose entry point takes one line, reads one method member and returns at most
one response, over a line-delimited transport. **No array handling exists in
either file** — the vocabulary was exhausted. The cited specification's §6
requires batch support. The deviation is very probably correct (the layered
protocol has been retiring batching) and is exactly why it needs an entry: as
the tree stands, a maintainer cannot tell a decision from an omission, and the
two lead to opposite actions.

Three of the eight sites are near misses the register would have to *refuse* — a
conforming check that quotes its clause back to the user, a defence of a
behaviour the upstream is silent on, and a deliberately-stricter choice — which
is where the technique's boundary earned its place rather than being asserted.

**Ship 0.** Both are read-only assessments; neither proposes a change small
enough for Phase 8's few-readable-lines rule, and the operator has not confirmed
a cross-repo commit. The register's first change is a *declaration* rather than
code, and the attribute work needs the token separated before any rule is added
— sequencing the arms make explicit.

## Already covered — 3 catches

- **A validity error for contradictions between two declared semantic layers**
  (`source:1276-1285`: a separator that claims to be a cell, a radio button
  claiming to be a progress bar). `a11y-verification` layer 1 already lists
  "invalid role/state combinations" among the mechanical violations a rule
  engine decides. Corpus is level with the standard here.
- **A green automated audit is a floor, not a claim.** The source's whole
  conformance-checker section rests on it; `a11y-verification` states it with a
  denominator discipline the source does not have.
- **The living-standard model** (`FAQ.md:23-30`: no snapshots, because
  implementers who follow a frozen snapshot implement its known bugs, "which
  has resulted in serious differences between browsers"). `versioning-snapshots`
  and `dated-corrections` hold this ground; the source adds a good sentence and
  no new rule.

## Untriaged — 6, with anchors, unverified

Nobody judged these. Recorded so a later run does not re-derive them.

1. **Change admission by independent-implementer interest plus filed downstream
   obligations** (`.github/pull_request_template.md`). Routed to
   `tc39-proposals-0831`, which holds the better authority for it. Anchor: "At
   least two implementers are interested (and none opposed)" + tests + a bug
   filed per engine + both accessibility mapping specifications + the
   documentation issue.
2. **Producer/consumer conformance decoupling** (`source:2019-2024`): "There is
   no implied relationship between document conformance requirements and
   implementation conformance requirements. User agents are not free to handle
   non-conformant documents as they please; the processing model applies
   regardless of the conformity of the input." The producer's rule set is a
   freely-revisable subset of what the consumer must accept forever. Mapped
   thinly (`"versionless"` returned 1 hit corpus-wide) and no home was verified.
3. **Invalid on purpose, to reserve extension space** (`source:1242-1248`):
   "attributes in end tags are ignored currently, but they are invalid, in case
   a future change to the language makes use of that syntax feature without
   conflicting with already-deployed (and valid!) content." The gap between what
   you refuse to emit and what you must accept *is* the extension budget. Pairs
   with 2 and is probably one finding with it.
4. **Audience-scoped projection from one source** (`.github/CONTRIBUTING.md`):
   per-span inclusion attributes cut four different audience editions from one
   document, plus a `subdfn` mechanism that designates a substitute definition
   anchor when the real one lives in an excluded span. Carries a paid-for
   failure recorded in the operating doc: *"for a long period the developer's
   edition was not working and so we made a lot of changes without properly
   considering their impact on it"* — a derived view that stopped building was
   neither removed nor fixed, and the debt is now undiscoverable.
5. **A linter over prose** (`.github/CONTRIBUTING.md`): variables in
   specification algorithms are scope-checked by the build — an unscoped
   variable is an error, a variable appearing exactly once inside an algorithm
   is a warning, and there is an explicit `ignore` suppression. A document
   treated as code, with a declared-scope construct and a named escape hatch.
6. **The feature cost ledger** (`FAQ.md:351-365`): eleven enumerated costs of
   adding one platform feature — implementation, tests, QA, refactoring,
   tutorials, cognitive load, reduced exploration, page maintenance, spec
   writing, bug fixing, binary size. Almost none paid by the proposer.

## Leads — 2, with return conditions

- **Conformance-checker strictness tiers as a published product**
  (`source:1252-1256`): the standard invites checkers to offer modes enforcing
  conventions *stricter than the standard* — always quoting attributes, never
  omitting optional tags. The corpus has the declared-strictness-tier amendment
  on `checked-vs-skipped-denominators` from the 2026-08-31 anydoc run; this is
  the same idea shipped as a checker feature by the standard's own author.
  **Return when a second source shows a checker whose strictness tier is
  declared by the standard rather than by the checker's config.**
- **The last-resort branch as a designed choice** (`source:35168-35176`): a
  generator that cannot obtain the value is told to pick between two *specific*
  wrong answers — assume decoration, or assume the content is essential — and
  the standard states which assumption each carries. A rule for choosing a
  default when both defaults are wrong in opposite directions. **Return when a
  second source states the choice-between-two-wrong-defaults rule explicitly**;
  one instance is not a technique.

## Notes for the next run on this source

- **A standard repository's yield is the meta-layer, and the ratio is extreme.**
  711,540 words of normative text produced zero landings; 5,472 words of FAQ and
  contributor guide produced most of the extraction, and the two landings came
  from ~120 words of `<p class="note">` scattered through the big file. Grep the
  normative text for its *annotation vocabulary* (the marked-up concept classes:
  deviations, privacy-relevant features, checker guidance) rather than reading
  it — those markers are where the engineering doctrine is, and they are
  enumerable in one command.
- **Do not re-mine this for its subject matter.** The strip test kills it by
  construction, and a run that forgets this will produce a bundle full of
  restated element semantics.
- The index was regenerated under the lock and the gate is green, but
  **index.json and catalog.json were not committed**: three siblings held
  uncommitted or untracked content at Phase 10, so a committed index would
  reference files absent from `HEAD`. Same call as the 2026-08-31 herdr run.
