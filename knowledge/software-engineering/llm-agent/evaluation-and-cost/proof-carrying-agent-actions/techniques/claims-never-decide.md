---
layer: technique
type: technique
subject: proof-carrying-agent-actions
technique: claims-never-decide
status: forged
laws: [claimant-does-not-adjudicate, gate-sees-target, silent-state-is-ungoverned]
shared_with: []
use_when: [a proof block has fields the agent filled in, a checker reads anything from the change it judges, deciding which parts of an agent's report a gate may consume]
---

# Claims never decide

An agent that opens a change also describes it: a title, a summary, a list of
what it fixed, often a structured block that looks like evidence — the test it
added, the finding it closed, the class of change it believes it made, the
scan it ran. Every one of those is a claim. This technique is the rule that no
claim is an input to the verdict, and the procedure for finding the claims that
have become inputs without anyone deciding they should.

## Why "the check is what matters" is not enough

The obvious form of the violation is rare: nobody writes a gate that merges
because the summary says "fixed". The common form is a claim that chooses what
the checker looks at. The block names a test identifier, and the checker runs
that test — so the agent chose the test. The block names the action class, and
the checker applies that class's envelope — so the agent chose the envelope.
The block carries a scanner report, and the checker parses it — so the agent
supplied the scan. The block states a tolerance, a scope, a list of files that
"should" change. None of these is the verdict; each one shapes it before it is
made ([_laws: claimant-does-not-adjudicate_](../../../../_laws.md#claimant-does-not-adjudicate)).

## The procedure: list every input and name its author

Write down every value the checker reads, and beside each the party that could
have written it. Four answers are possible.

- **The checker computed it** from the commits — the diff, the files touched,
  the test identifiers present at base and head, the scanner's output on a run
  the checker started. Usable.
- **An authority upstream of the change recorded it** — the finding as the
  scanner filed it before the agent existed, the policy file at the base
  commit, the scanner version pinned by the platform. Usable, read from that
  authority, not from a copy inside the change.
- **The agent wrote it, and the checker can recompute it.** Recompute it, and
  treat a mismatch as a finding about the agent: a declared class that differs
  from the derived class, a cited test that does not exist, a claimed rescan
  whose output the checker cannot reproduce.
- **The agent wrote it, and the checker cannot recompute it.** It is display.
  It goes to the reviewer and nowhere else.

The fourth row is where the discipline is tested. A field that is useful and
unverifiable — "the vector is a second-order injection through the export
path" — is genuinely useful to a person, and it stays useful as display. It
never becomes a lookup key.

## Pointers are allowed; their targets are verified

A proof block legitimately points at things: the exploit test the agent added,
the finding identifier it addresses. Pointing is fine when the checker treats
the pointer as a question rather than an answer. The cited test must exist at
head, must be absent or failing at base, and must have been added or left
unweakened by the diff. The cited finding must be one the scanner filed against
the base. A pointer the checker resolves against its own observations is a
hint; a pointer the checker follows into data the agent produced is a claim
with extra steps.

Two pointers deserve a floor. A *needle* the checker searches for — the attack
vector a base failure should mention, the quoted text a review finding says
sits in the diff — is supplied by the claimant, and its specificity decides
whether the search can fail. A blank string is a substring of every output; a
one- or two-character vector nearly is. So the needle is trimmed, compared
after normalising whitespace and nothing else (not case-folded into
coincidence, not fuzzily matched), and refused below a minimum length, with a
needle under the floor making the observation inconclusive rather than
matched. A *parameter* the evidence supplies — a tolerance, a run count, a
sample size — is capped by a ceiling the policy owns, and an input above the
ceiling fails the check, because an evidence job that can widen its own limit
has decided its own verdict.

## The verdict field is a claim too

A proof block carries a verdict, and whoever wrote the block wrote that field.
The consumer does not read it. It recomputes the verdict from the block's checks
with the same pure function the producer used, and a block whose stated verdict
differs from its derived one is refused, not corrected — a mismatch means the
block was edited, assembled by something other than the checker, or produced by
a checker with a bug, and none of those earns a merge. The same holds for shape:
where the checker expects a list of findings and receives an object, it refuses
the input rather than reading it as an empty list, because an empty list of
claims checks vacuously and passes.

## Configuration the change can edit is a claim

The quietest claims are not in the block at all. If the change edits the
pipeline definition that runs the evidence jobs, the policy file that defines
envelopes, the scanner's configuration, or the list of tests marked flaky, the
change has authored part of its own evidence. Read those from the base commit,
and treat a change that touches them as a different action class — one whose
proof is a person's review — rather than as a fix whose proof happens to look
green. A variable injected at pipeline start that outranks the evidence job's
own settings is the same thing at run time, and is refused for the same reason.

## Decision rules

- When the checker reads a value, it can name who authored it; values the agent
  authored are recomputed or displayed, never trusted.
- When the agent's declaration and the checker's derivation disagree, the
  derivation decides and the disagreement is recorded as a finding.
- When the change edits the configuration, policy or pipeline that produces its
  own evidence, the change does not earn a proof from that evidence.
- When the agent supplies a needle or a parameter, floor the needle's
  specificity and cap the parameter from policy; below the floor is
  inconclusive, above the cap is a failure.
- When a block arrives with a verdict, recompute it from the checks and refuse
  the block on a mismatch.
- When a model reads the change to help a reviewer, its output joins the
  display channel. Surfacing an agent's reasoning is what makes it governable
  ([_laws: silent-state-is-ungoverned_](../../../../_laws.md#silent-state-is-ungoverned));
  surfacing it does not make it evidence, and a model's reading of the agent's
  reasoning is not promoted to an input because a second model produced it.

## When not to use this

Where no checker exists for an action class, there is no verdict to protect,
and pretending otherwise — running a thin check and calling its output a proof
— is worse than routing the change to a person openly. The rule binds the
checker; it does not require a checker for every class.
