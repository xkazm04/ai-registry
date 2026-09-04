---
subject: test-input-generation
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# test-input-generation

First touch: [[2026-08-31-tigerbeetle-blog]] — **subject created**, XL specced
and forged in the same session
(`docs/subject-proposal-test-input-generation.md`, EXECUTED). Six techniques:
`generator-bounds-the-space`, `swarm-feature-sampling`,
`negative-space-generation`, `exhaustive-when-bounded`, `model-based-oracle`,
`inside-out-invariants`. One application (`rust--generator-bounds-the-space`).

Placed beside `test-harness` on that subject's **own stated boundary** — "the
tests themselves assert facts; the harness decides which facts get checked" —
which excludes input generation by design. Adding these there would have
falsified the neighbour's opening paragraph.

The hole was corpus-wide and invisible to `research-map`: zero hits for
`deterministic simulation`, `swarm test`, `property-based`, `generative test`,
while all 56 `fuzz` hits are *fuzzy matching*. Established by concept grep with
proper nouns removed, not by the slug map.

`swarm-feature-sampling` is written from **Groce et al., ISSTA 2012**, not from
the source: the practitioner post states no limits, the paper states the
decisive one (omission loses when a defect needs several features at once).

## Open leads

- **Seed management** — recording, replaying and minimising a failing seed.
  Named as open question 4 in the spec and deliberately not absorbed. Adjacent
  to `flake-lifecycle` and to reproducibility; currently homeless.
- **A portfolio technique for generator classes.** The source's five-fuzzer
  taxonomy contributed two rows; the idealized-lab, single-subsystem-hammer and
  whole-system-performance rows are recorded untriaged in the source note.
- **Assertion discipline** as its own subject would be this subject's nearest
  new neighbour; two sightings so far, both one organisation, so it stays a
  lead.

## Single-stack debt

One application, `rust`. The techniques are language-neutral and the subject
would benefit from a `node` or `process` realization — a property suite in a
scripting ecosystem, or a generator design walked as a method.

## 2026-08-31 wave 3 — two techniques and an amendment

[[2026-08-31-tigerbeetle-blog]] wave 3 (rows 25, 26, 20 of the ranked table).
Gained `liveness-needs-a-quiet-period`, `seed-is-not-a-reproduction`, and a
fourth-rung amendment inside `model-based-oracle`. Subject is now **8
techniques**.

Three of wave 3's four real findings landed here, which is the best available
evidence that the wave-2 boundary was drawn correctly — the subject absorbed
new material without a home argument.

- **`liveness-needs-a-quiet-period`** — the sharpest of the wave. A
  fault-injecting run cannot observe a system that never finishes, because the
  next random draw rescues it; so a safety-only suite does not merely fail to
  test liveness, it **erases** liveness defects. The remedy is a phase change
  *inside* the run: freeze the fault set, heal it among the subset that is
  supposed to finish, make the rest permanent, assert monotone progress against
  a bound. The failure class it reaches — two individually reasonable policies
  that phase-lock — is invisible to component testing by construction, because
  neither component has a bug.
- **`seed-is-not-a-reproduction`** — closes the **seed-management lead** banked
  when this subject was created. Landed with a **cross-bundle convergence**
  recorded in prose (links across bundles are forbidden): a procedural-content
  subject in another bundle states the same four-term dependence from the other
  side. The **discriminator** is what each domain does when a term moves — that
  one keeps the seed and states the drift honestly, because the seed is the
  artifact's *identity*; a test suite cannot, because the recorded case is
  *evidence* and exists precisely to survive the change that fixes it. Recorded
  here so a later run recognises the shape instead of re-litigating it.
- **The oracle ladder gained a fourth rung** (recorded expected output) rather
  than a competing technique. It sits *between* invariants and a model, not
  above either: it answers "same as last time", never "right". The disciplines
  that keep it honest are all on the update path, not the comparison.

**A slug collision worth remembering.** `research-map` scored "snapshot testing"
against `versioning-snapshots` at 9 — an entirely unrelated concept (entity
versions you restore to). Second instance in two waves of this territory being
invisible to the slug map, after all 56 `fuzz` hits turning out to be *fuzzy
matching*. For this subject, map on mechanism, never on the word.

## Open leads

- **Seed management is now CLOSED** (was the standing lead from wave 2).
- **The generator portfolio** remains open — the idealized-lab,
  single-subsystem-hammer and whole-system-performance generator classes are
  still recorded untriaged in the wave-2 source note.
- **Snapshot/recorded-output has no seam anywhere in the fleet** — zero files
  across seven projects use any recorded-output assertion. Return when one does;
  the amendment is unapplied by absence, not by judgement.


## 2026-08-31 - intake(pgrust): what the reference oracle cannot be asked

`model-based-oracle` was forged the same day by a sibling run and is strong. Its
disqualifier list ends with "when the behaviour is the reference… compare against
that one rather than writing a third" - correct about cost, and silent about reach.
That silence is the amendment.

A model written from the specification fails **independently**, so its being wrong
is a visible event. A reference implementation cannot: the artifact was derived from
it, so every faithfully reproduced defect produces agreement, and agreement is what
correctness produces too. `one-authority-per-vocabulary` at its degenerate case - the
reference became the sole authority and nothing left in the system can contradict it.
The consequence for reporting is narrow and load-bearing: a campaign of this shape
establishes **no divergence from the reference**, never correctness, and N behaviours
"proved equivalent" is N behaviours proved equal to something whose own correctness
was never tested.

Remedy from the source and written against the mechanism rather than its vendor
claims: **make the reference disagree with itself** by running the same comparison
under a condition it is not invariant to - a second platform, toolchain or version.
Where behaviour is implementation-defined rather than specified, the two runs
disagree with each other while each stays faithful to its local reference, and that
split is visible to the harness already in hand.

**Three real cases from a managed project's history decided it**, and the first
hypothesis was wrong: I expected the non-default backends to be env-gated out of CI;
the workflow runs all three and marks two required, which one command settled. Case 1
is the discriminator - usage caps rode a trait's default check-then-insert, **the
embedded backend overrode that default and was green**, and the hosted backend
admitted 8/8 against a cap of 4 under a live burst. A single arm there is not merely
silent, it is *actively reassuring*, because the implementation it exercises has
already fixed the defect privately. **Negative structural fact**: that tree has no
designated reference at all - its authority is a written suite, the configuration
this technique calls correct - so the amendment's ledger clause has nothing to
attach to. The mechanism transferred; the vocabulary did not.

## 2026-09-03 - intake run `intake-boa-0903` (source: a language engine's fuzz targets)

New technique **`stage-ordered-fuzz-targets`**, the ninth: one target per pipeline stage
whose input type differs from its predecessor's, each with the strongest oracle that
stage admits, triaged in pipeline order because a crash at stage k masks every defect
behind it on that input (masking by stage - the cousin of `swarm-feature-sampling`'s
masking by feature), the upstream stages doubling as the deep target's normaliser, and a
deterministic budget on the deepest stage so non-termination is a finding and
time-over-budget a diagnostic rather than a flake. Amendment to **`model-based-oracle`**
("normalise once, then round-trip"): when a structural generator over-approximates,
consume once and discard rejections, then assert the round trip on the second hop - the
system's own output is its fixed point - and report the discard fraction as the
generator-health number. Applications: `rust--stage-ordered-fuzz-targets` (the fleet's
scraping service as the applied tree - **simulation, better**, three real e2e cases, a
falsifier, and the tree's own prior encounter with stage masking at a never-loaded
predicate that read as a pass; the source engine as the origin with its three targets
anchored). The amendment is **unapplied**: no fleet project feeds a structural generator
into a rejecting consumer; return when one grows one. Direction proposed in the scraping
service's own tree (a per-stage harness, S), gate skipped - unattended run.
