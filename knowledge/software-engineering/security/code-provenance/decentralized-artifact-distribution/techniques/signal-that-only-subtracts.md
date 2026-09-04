---
layer: technique
type: technique
subject: decentralized-artifact-distribution
technique: signal-that-only-subtracts
status: forged
laws: [verdict-survives-boundary, absent-guard-is-loud, silent-state-is-ungoverned]
shared_with: []
use_when: [one moderation service is being asked to judge both listing text and artifact bytes, deciding whether an automated classifier may approve a listing, scoping what a content-assessment service is allowed to fetch, a positive outcome exists in a type but no code path can reach it]
---

# A signal that only subtracts

Two claims get made about a third-party artifact and they are routinely served
by one instrument:

- **Display safety** — this listing's text, images and links are not a scam, not
  impersonation, not something that must not be shown to a browsing user.
- **Artifact integrity** — these bytes are the bytes the publisher signed, this
  provenance chain checks out, this manifest declares these capabilities.

They differ in the party best placed to judge them, in the evidence each needs,
and — decisively — in what a compromise of the judge buys an attacker. Merge
them into one service with one verdict and the merged service can *admit*, which
means compromising the softer half of the system yields the stronger half's
power.

**Split the instruments and make the softer one structurally unable to admit.**

## The scope rule, stated as a prohibition list

The content-assessment side judges only publisher-controlled listing metadata
and the media displayed beside it. Everything else is off-limits, and the
prohibition is *enumerated and tested*, not described in a design document:

- It **never fetches** the artifact, the bill of materials, the provenance
  document, or the source archive. Not to analyse them — not at all. A fetch is
  a capability, and a service that can reach those URLs can be made to reach
  them on an attacker's behalf.
- It **never models** their contents. A classifier that has read an archive can
  be prompted by an archive.
- Its output **cannot supply** any verified record, checksum, permission entry,
  or executable byte. There is no field in its result type through which such a
  thing could travel.

That last clause is the one that makes the split real rather than procedural. If
the assessment service's result can only ever *remove* a listing from the visible
set, then its full compromise costs the registry availability and costs it
nothing else — and availability loss from a compromised safety service is a
trade any operator will take.

Write the prohibition list as a fixture and assert against it. A scope stated in
prose drifts on the first feature that "just needs the manifest"; a scope stated
as an enumerated list that a test compares against fails loudly on that feature,
which is the point at which somebody has to justify it.

## The automated path may recommend or fail, never admit

The second half is the same asymmetry applied to automation. An assessment
pipeline that runs models over listing text and images produces, at best, three
useful outcomes:

- **error** — required coverage was unavailable. A stage failed, an image could
  not be fetched, the model was down. Not a pass, not a finding: the check did
  not run, and that is a third state with its own name
  ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
- **review** — the pipeline has something to say, or has nothing to say and the
  policy still requires a person.
- **pass** — reachable only through a human decision naming the exact revision.

The rule is that **no machine-reachable branch produces the positive outcome.**
Not "the model must be confident"; not "two models must agree". No branch. A
classifier can be argued into anything by a publisher who controls the text being
classified, and the class of attack — text in a listing that instructs the
assessor — has no reliable defence at the model layer. It has a complete defence
at the policy layer: the positive verdict simply has no automated path to it.

Two structural details make this hold in practice:

- **Enforce it in the policy resolver, not in the prompt.** A prompt asking a
  model not to approve is a request. A resolver whose every return statement for
  a model-derived input is `review` or `error` is a property. The difference is
  auditable by reading one function.
- **Refuse verdict-shaped model output.** A model asked for findings will
  eventually emit something shaped like a verdict. The parser rejects it as
  malformed rather than mapping it, or the whole discipline is one schema change
  from being decorative.
- **Coverage gaps are errors, not passes.** If the text stage was unavailable, or
  media coverage was partial, the outcome is `error` — before any finding logic
  runs. A pipeline that reports "no findings" when it could not look is the
  empty-success lie in its most convincing form.

## Mark the dead branch, or it reads as a bug

There is an honesty cost to this design and it is worth paying attention to,
because it is where a deliberate decision becomes indistinguishable from a
defect.

The positive outcome usually remains in the result type — the type is shared
with the human decision path, which does produce it. So the codebase contains an
enumerated value that no automated code path returns, and a policy resolver with
a branch that always yields the same non-positive answer. To the next reader,
and to every static-analysis tool, that is an unreachable case: dead code, a
missing branch, a bug someone should fix. Somebody will "fix" it.

State the intent where the code is:

- A named reason code on each non-positive return that says *why* it is
  non-positive — a manual decision is required by policy, or a model result may
  never be promoted — rather than a single generic `review`. The reason code is
  the difference between "the pipeline had nothing to say" and "the pipeline is
  forbidden from saying it", and only the second is a design decision worth
  protecting ([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
- A test asserting that the positive outcome is unreachable from every
  automated input, which fails the moment somebody adds a path to it.
- A comment at the type declaration saying which paths may produce the positive
  value, because the type is where the reader forms their expectation.

An unreachable branch with nothing marking it as intentionally dead is a
deliberate design that looks exactly like an oversight, and the ways it gets
removed — a refactor, a lint fix, a well-meaning pull request — all look like
improvements ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## Decision rules

- **One instrument per claim.** Display safety and artifact integrity are
  separate services with separate inputs and separate compromise consequences.
- **The softer signal may only subtract.** Its result type contains no field
  through which a record, a checksum, a permission or a byte could travel.
- **Enumerate what the assessor may never fetch and never model**, as a tested
  fixture rather than as documentation.
- **No automated branch reaches the positive verdict.** Enforce it in the policy
  resolver; a prompt is not an enforcement point.
- **Missing coverage is an error outcome, evaluated before findings.**
- **Reject verdict-shaped model output** at the parser.
- **Mark the intentionally unreachable positive branch** with a reason code, a
  test, and a comment at the type — all three, because each protects against a
  different way of removing it.

## When not to use it

- **When one party legitimately owns both claims** — a first-party store that
  builds, signs and reviews everything it lists. There is no trust boundary
  between the two judgements to protect.
- **When the automated assessor is the only assessor and the alternative is no
  check at all.** A recommend-only pipeline with nobody to receive the
  recommendation is a queue that grows forever. Either staff the decision or
  narrow the catalogue; do not close the gap by letting the model promote.
- **When the signal has no admission role by construction** — a rating, a
  popularity score, a badge. The asymmetry is already there and formalizing it
  costs more than it returns.
</content>
