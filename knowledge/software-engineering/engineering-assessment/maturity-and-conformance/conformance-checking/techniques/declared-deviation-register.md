---
layer: technique
type: technique
subject: conformance-checking
technique: declared-deviation-register
status: forged
laws: [absent-guard-is-loud, one-authority-per-vocabulary, count-carries-predicate, identity-survives-reuse]
shared_with: []
use_when: [an implementation deliberately differs from a specification it claims to follow, a checker keeps re-reporting a failure somebody already decided to accept, deciding where an intentional non-conformance is written down, a maintainer cannot tell a deliberate difference from a bug]
---

# The declared-deviation register

Anything that claims conformance to an external specification eventually stops
conforming on purpose. The upstream document is wrong, or is right about a case
that does not exist here, or is right and the compatible behaviour is
unaffordable, or two specifications this artifact must satisfy simultaneously
contradict each other. The deviation is a legitimate engineering decision and
usually a good one.

What is never legitimate is where it gets written down, which is normally
nowhere. The decision lives in the pull-request thread that is now closed, in a
comment on the line that implements it, or purely in the head of whoever made
it — and the artifact continues to advertise plain conformance. **An
undeclared intentional deviation is indistinguishable from a defect**, and it
is treated as one at the next contact: the maintainer who finds it "fixes" it
and reintroduces the problem the deviation was avoiding; the integrator who
trusted the conformance claim debugs a difference nobody told them about; the
conformance run reports it as a fresh failure every time, which is how a
report acquires findings everyone has been trained to scroll past.

The move is small and it is a *publication* move rather than a process one:
**every deliberate deviation is recorded in the artifact's own normative text,
in the same vocabulary the conformance claim uses, at the site where it
happens.** The claim and its exceptions travel together, or the claim is
false.

## What one entry contains

An entry is not a note; it is a record with four fields, and each of them is
load-bearing because each answers a question the next reader will otherwise
answer wrongly.

- **The document deviated from, with its version.** "We differ from the
  address-syntax standard" is not actionable; the standard has revisions, and a
  deviation from one may be conformance with another. A conformance claim is a
  claim against a specific text
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate) —
  the predicate of a conformance statement includes which document, at which
  revision).
- **The clause.** A section reference, not a topic. Whoever needs this entry is
  holding the upstream document open and needs to know which paragraph to stop
  believing. A topic-level entry sends them to read the whole thing, which they
  will not do.
- **The motivation, in one sentence, stated as a cost.** Not "for
  compatibility" but what breaks if the compliant behaviour is restored. This
  is the field that survives the author leaving, and it is the field that makes
  the entry re-decidable later when the cost changes.
- **The state of the reconciliation, when there is one.** Where an upstream
  discussion exists, the entry points at it. A deviation with a live upstream
  thread is provisional and will end; one without is permanent by default, and
  the reader should be able to tell those apart without asking.

Two conventions keep the register usable at scale. **The term is shared, not
invented per artifact** — one name for the construct across every document in a
family, so the whole set is enumerable with one query
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
a register whose entries are prose is a register only to the person who wrote
it. And **entries are per site, not per cause**: one decision applied in three
algorithms is three marks. The reader arrives at a location, not at a rationale,
and a deduplicated register is silent at two of the three places somebody stands.

## The boundary is part of the discipline

A register that admits everything becomes a changelog and is abandoned. Mature
ones are notably small — single digits over a document of hundreds of
thousands of words — because a boundary is enforced, and the boundary is worth
stating because the near misses are where the judgment lives:

- **A deviation is a difference in *required behaviour*.** Being stricter than
  the upstream where it permits latitude is not a deviation; neither is
  declining to implement an optional feature. Those are profile choices and
  belong in the conformance claim itself, as scope.
- **A special case ahead of a general rule is not a deviation.** Handling one
  input differently *before* dispatching to the specified algorithm leaves the
  algorithm intact. This is the most common false entry and the most common
  argument.
- **"Contradicts the spirit but not the letter" is its own state.** Where the
  upstream text permits what you do and its authors would not have, say so and
  mark it as the weaker class. Collapsing it into full deviation inflates the
  register; leaving it out loses the only warning an integrator gets.
- **Record the rejected candidates too**, at least in the source. The reasoning
  for why something is *not* a deviation is the boundary, and it is re-derived
  every time somebody proposes an entry.

## What the register does to a checker

The register is not documentation the checker ignores; it changes the
arithmetic. A conformance run against a registered deviation produces a
**third outcome**, beside the four in this subject's ladder: *known, accepted,
dated*. Wire it as its own class, never by either of the two available shortcuts:

- **Not as a suppression that removes it from the denominator.** That inflates
  the pass ratio by exactly the number of things you decided not to do, and the
  score then improves every time the team accepts a failure — the incentive is
  precisely backwards ([pass-ratio-comparability](./pass-ratio-comparability.md)
  owns why the denominator must not move for policy reasons).
- **Not as an ordinary failure.** Then the number can never reach clean, the
  report has permanent red in it, and the team calibrates to a non-zero floor,
  which costs the report its ability to signal anything new.

Reported as its own class, the register also gives the run something no
checker can compute: the difference between *this failure is new* and *this
failure is a decision*, which is the only distinction that makes a red build
actionable. And it converts a recurring true finding into a reviewable list
with dates on it, so the accepted set can be swept for entries whose stated
cost has expired — a deviation nobody re-reads is a permanent one, and
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) applies to a
waiver as much as to a check.

## Key the entry by the finding's identity, never by its position

A register is only as durable as the key that joins an entry to the finding
it accepts, and the natural key — the one a tool prints and a maintainer
pastes — is a *position*: file, line, column. It is an index-based key, and
it fails under exactly the operation source files undergo constantly
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)):
an unrelated edit above the site shifts the line, the entry silently stops
matching, and the accepted finding reappears as a fresh failure with no
cause anyone can see — a score "regresses," a red build names a decision
someone already made, and the investigation lands on the innocent commit
that moved the lines. The register was correct on the day it was written
and wrong on the first unrelated edit, which is the same shape as a
suppression that never fired: nothing announced the drift.

Key by what the finding *is*, not where it sits: the rule plus the symbol,
the mutation's name inside its function, the clause reference — whatever
the checker emits that survives a reflow. Where the identity is not unique
within a file, qualify it by the enclosing declaration before reaching for a
line. And when a position genuinely cannot be avoided, the entry must be
loud about not matching: a register entry that joins to nothing is a
finding about the register
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)) and is
reported as such, never dropped as a no-op — otherwise the day the site
moves is also the day the acceptance quietly expires.

## Related shapes, and how this one differs

[checker-false-positive-discipline](./checker-false-positive-discipline.md)
handles findings that are *wrong*. Register entries are findings that are
**right and accepted**, and merging the two is how a real defect ends up in the
tuning file: the first is repaired by narrowing a detector, the second must
never narrow anything, because the day the deviation is reverted the check has
to fire again.

[vendored-fork-ledger](../../../../security/supply-chain/techniques/vendored-fork-ledger.md)
records that you copied and patched somebody's code; this records that you did
not, and still do not behave as their document says. The two are neighbours
because both name a state where a mechanical test reports nothing and the
silence means the opposite of compliance — but the fork ends the guards, and
the deviation ends only the claim.

And where the un-satisfiable requirement is on the *authoring* side rather than
the specifying side — a rule nobody can comply with here, whose cheap fix is a
plausible fabrication — the technique is
[fabrication-economics](../../../../engineering-process/standards-and-gates/quality-gates/techniques/fabrication-economics.md).
The shared root is worth naming because it recurs: both are a true, known
violation that must be declared in band and must not be reported as news. They
differ in who decided — an author who could not comply, versus a maintainer who
chose not to — and therefore in what the entry has to carry.

## Decision rules

- **A conformance claim with no exception list is a claim nobody has audited.**
  Where an artifact states that it implements a named protocol, the first
  question is which parts it does not, and the answer belongs beside the claim.
- **The register lives in the published surface, not the issue tracker.** An
  integrator reading the artifact must reach it without an account
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud): a record
  that must be looked for is a record that is not there).
- **A deviation discovered by reading the implementation is a missing entry**,
  even when the code comment beside it is excellent. The test is enumerability:
  can somebody list every one without reading the whole tree?
- **When an entry's stated cost no longer holds, close it or restate it.** The
  register is a set of live decisions; entries whose motivation has expired are
  what turn it back into a changelog.
- **Version the claim, not just the code.** When the upstream document revises,
  every entry against it is re-checked; a deviation from a paragraph that no
  longer exists is the most confusing artifact in this whole design.
