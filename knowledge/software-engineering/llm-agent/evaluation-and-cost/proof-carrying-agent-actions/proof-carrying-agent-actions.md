---
layer: golden-path
type: golden-path
subject: proof-carrying-agent-actions
status: forged
use_when: [an agent opens a change that a gate must accept or refuse, deciding what evidence an agent-authored fix must carry to merge, a verifier for agent work reads the agent's own summary, designing a checker that must be able to say no]
techniques:
  - claims-never-decide
  - proof-class-bound-to-action-class
  - test-not-weakened-check
  - evidence-binds-to-the-measured-change
  - inconclusive-routes-to-wait
  - negative-fixtures-prove-the-verifier
---

# Proof-carrying agent actions

A proof-carrying action is an agent's change that arrives with a typed block of
evidence, and a verdict on that change that a checker with no model in it
re-derives from the evidence alone. The idea is old. Proof-carrying code made an
untrusted producer ship a proof beside its binary so that the consumer, holding
only a small and trusted checker, could accept the binary without trusting the
producer; the expensive work moved to the party that wanted to be believed, and
the cheap, auditable work stayed with the party that had to decide. The same
shape fits an agent that opens a merge request. The agent is the untrusted
producer. The gate is the consumer. The proof is not a theorem but a fixed set
of observations that the gate can re-run or re-read, and the verdict is
computed from those observations by code that does not call a model. The
asymmetry survives the translation: producing the evidence takes the agent a
session, while re-deriving the verdict is parsing, string comparison and
arithmetic — milliseconds, with no model call per claim — which is what lets
the gate re-derive every verdict instead of sampling some.

For a security fix the proof has a recognisable shape. An exploit test fails on
the base commit, and it fails naming the vector the finding described. The same
test, by identifier, passes on the head commit. No test that existed at base
was weakened to get there. The finding is gone when the same scanner, at the
same version, rescans the head. The diff stays inside the envelope the policy
declares for that kind of action. Five observations, each mechanically
decidable, none of them a sentence the agent wrote. The agent's description of
what it did is shown to the reviewer and read by nobody who decides.

The boundary with the neighbours, stated up front. Checking whether a
delegated worker's "done" is true — receipts the runtime stamps, decidable
leaves, a run inside the worker's own shell proving nothing — is
[fleet-orchestration](../../orchestration/fleet-orchestration/fleet-orchestration.md)'s
completion-claim verification; it decides whether *work happened*, inside an
orchestrator, and its verdict feeds the next dispatch. This subject decides
whether a *change may land*: a typed proof per class of action, consumed by a
merge gate, whose verdict is a durable record. Pick that one when the question
is "did my worker do what it said"; pick this one when the question is "may
this change enter the branch on evidence alone". Freezing the oracle so a fixer
cannot edit the tests while it repairs is
[quality-gates](../../../engineering-process/standards-and-gates/quality-gates/quality-gates.md)'
oracle-frozen-during-repair, a preventive rule applied before and during the
task; here the weakening check is detective, run on the finished diff, because
the gate cannot assume the freeze held. Where a model's judgment must
contribute to a number, [judgment-guardbands](../judgment-guardbands/judgment-guardbands.md)
bounds how far it may move it around a deterministic backbone; this subject is
the case where no model contributes to the verdict at all. And what a *record*
of proofs earns an action class — how many clean verdicts buy a rung of
autonomy, what reverts take it away — is
[earned-autonomy-tiers](../../../engineering-process/continuous-integration/earned-autonomy-tiers/earned-autonomy-tiers.md)';
this subject owns what one proof is, and hands that subject a verdict it can
count.

## The claim is displayed, never read

The founding rule: **nothing the agent asserts about its own work is an input
to the verdict** ([_laws: claimant-does-not-adjudicate_](../../../_laws.md#claimant-does-not-adjudicate)).
That sounds easy and is violated in quiet ways. The agent's summary says "fixes
the injection in the login handler"; the checker uses "login handler" to pick
which tests to run. The agent's block says the action class is a dependency
bump; the checker applies the dependency-bump envelope. The agent attaches a
scanner report; the checker reads the report rather than rerunning the scan.
In each case the claim was never the verdict, and it still decided the verdict,
because it chose the checker's inputs. The discipline is to enumerate every
input the checker reads and ask, for each, who could have written it. Anything
the agent could have written is either recomputed by the checker or used only
for display.

The rule recurses one level further than people expect. The proof block carries
a verdict field, and the gate does not read it either: it recomputes the verdict
from the block's checks with the same pure function the checker used, and a
block whose stated verdict does not follow from its own checks is refused
outright, whoever wrote it. And where the agent legitimately supplies a needle
the checker searches for — the vector the base failure should name, the quote a
finding says sits in the diff — the needle carries a floor on its specificity,
because an empty or one-character needle is a substring of every failure text
and turns "names the vector" into a check that cannot fail. See
[claims-never-decide](./techniques/claims-never-decide.md).

## The class of action names the proof it owes

A proof block is not one schema with optional fields. An action class — a
security fix, a dependency upgrade, a flaky-test quarantine, a documentation
change — maps to exactly one proof class, and the proof class names the
observations that must all be present and all hold. A dependency upgrade owes
a lockfile diff confined to the declared package, a build at head, and the
pre-existing suite green at head; it does not owe an exploit test, and a
security fix does not get to substitute a green suite for one. The mapping is
owned by the gate's policy, not by the agent, and the class itself is
determined from the change — the paths touched, the finding referenced — and
checked against what the agent declared, because a class the agent chooses is
an envelope the agent chooses. An action that fits no class owes nothing the
checker knows how to check, and gets no verdict but "a person decides". See
[proof-class-bound-to-action-class](./techniques/proof-class-bound-to-action-class.md).

## Green at head is not the proof; red at base is half of it

The proof that a fix fixed something is a pair: the test fails without the fix
and passes with it. A test that passes at head and was never seen failing at
base is a test fitted to the change, and it proves the change is consistent
with itself. The failure at base must also be the *right* failure — an
assertion naming the vector, not an import error, a missing fixture or a
timeout — because a test that fails for an unrelated reason turns green the
moment the unrelated reason is incidentally repaired. The same identifier must
be observed in both runs; a renamed or re-parameterised test is a different
test. The rescan has the same two-sided shape: the finding must be *present* in
the base scan and absent in the head scan. A finding that was never open at
base was not closed by anything, and the observation is inconclusive rather
than a pass.

The pair has a twin that guards the rest of the suite: everything that passed
at base must still pass at head, and nothing the suite asserted at base may
have been loosened. Benchmarks for patch evaluation call these fail-to-pass and
pass-to-pass sets; the agent practice has learned the hard way that both are
needed and that neither is enough when the patch can touch the tests. Even with
both, a passing pair is evidence that the named test now holds — not that the
fix is correct in every way a reviewer would care about. A proof proves what
its class states and nothing else, and saying so in the verdict is what keeps
"proved" from being read as "reviewed".

## A weakened test is a forged proof

When the change can edit the oracle, "make the exploit test pass" has a cheap
solution: change the test. An assertion deleted, a comparison loosened, a skip
directive added, an expected value rewritten to match the bug, a test file
removed, a whole case moved behind a condition that is never true. The check
for this runs on the finished diff and treats any reduction in what the suite
asserts as a failed proof, not as a warning: an assertion removed with no
replacement, a replacement that ranks lower on a strength ladder from exact
value down to "cannot fail", an added skip or focus marker, fewer test
declarations than before, a test file deleted or moved out of the paths the
runner collects. It errs toward refusing, because a false refusal costs a
person a look and a false pass ships a forged proof. One edit it cannot
classify: an expected value changed while the actual under test stays the
same is the cheapest way to fake red-to-green and also the way an honest fix to
a wrong test looks, so on its own it makes the proof inconclusive and a person
reads it — the check neither guesses pass nor guesses fail. Deleting a failing
check is not repairing what it found
([_laws: deletion-is-not-repair_](../../../_laws.md#deletion-is-not-repair)).
See [test-not-weakened-check](./techniques/test-not-weakened-check.md).

## The verdict pins what was measured and what measured it

Evidence that is true of some commit is not evidence about this one. Each
observation in the block names the commit it was taken at, and the verdict
names the exact diff it judged — base and head identities, and a digest of the
change itself — plus the identity of the checker build and the scanner version
that produced the observations. If the branch moves after the verdict, the
verdict does not move with it; it is a statement about a measured change that
no longer exists, and the gate re-measures. The scanner on the rescan must be
the scanner on the original finding, at the same version and rule set: a
finding that disappears because the rule was renamed or the scanner upgraded
has not been fixed. The checker's own identity is a content hash over every
source file it actually runs — its import closure, including the shared rules it
borrows — and an import the hasher cannot follow is an error, never a smaller
pin, because a pin that silently skips a file vouches for code it never covered.
The gate refuses a proof made by a different checker build than the one it
expects. And the checker must have read the change it judges, not
the agent's description of it ([_laws: gate-sees-target_](../../../_laws.md#gate-sees-target)).
Attestation formats for build artifacts carry the same three things — a subject
digest, the verifier's identity, the policy checked against — and a proof
verdict is that shape applied to an agent's diff. See
[evidence-binds-to-the-measured-change](./techniques/evidence-binds-to-the-measured-change.md).

## Inconclusive is a third verdict, and it waits

A checker that cannot decide must say so, and what it says must route the
change to waiting — for a re-run, for the missing evidence, for a person —
never to merging. The scanner timed out; the base commit could not be built;
the exploit test was not found by identifier; the coverage tool reported
nothing. Each is a missing observation, and a missing observation is not a
held one ([_laws: unknown-is-not-a-value_](../../../_laws.md#unknown-is-not-a-value)).
The degenerate case is the one that slips through: a proof with no checks at
all, or whose only checks are struck for a person to decide, is inconclusive,
because "nothing failed" over an empty set is vacuous and is exactly what a
proof built from no evidence would produce.
Two-valued checkers fail this in one of two directions: either "could not
decide" falls through to pass, which is the one outcome an adversarial or
merely broken agent can reliably produce, or it falls through to fail, which
trains people to override failures. Three values, typed through to the gate
([_laws: verdict-survives-boundary_](../../../_laws.md#verdict-survives-boundary)),
with the third one held open. See
[inconclusive-routes-to-wait](./techniques/inconclusive-routes-to-wait.md).

## A verifier that has never said no is not known to work

A checker that passes every honest proof is half-tested. The other half is
whether it refuses dishonest ones, and that is only known by feeding it
dishonest ones on every build: a weakened test, a fabricated rescan, a proof
whose test was green at base, a diff outside its envelope, a block whose class
does not match its paths. Each fixture carries its expected exit, and the
pipeline asserts the exit — honest fixtures must pass, each dishonest fixture
must fail, and an inconclusive fixture must be inconclusive. A checker change
that makes a dishonest fixture pass breaks the build exactly like a code change
that makes a real test fail, which is the only way a verifier's refusals stay
true across its own maintenance. See
[negative-fixtures-prove-the-verifier](./techniques/negative-fixtures-prove-the-verifier.md).

## The failure modes of the naive reading

**"A model reviews the diff and the tests, so the agent is checked."** A model
reviewer reads the agent's prose and the agent's code with the same machinery
that the agent's prose was written to persuade. It is useful as a reader, and
where it contributes its contribution is bounded, displayed, and not the
verdict. A judge that can be argued with is a judge the claimant addresses.

**"CI was green."** Green on which commit, with which tests, after which edits
to the tests, in a pipeline whose configuration the change itself may have
modified? A pipeline whose jobs the change selected produced evidence the
change chose. Green is an input to a proof, never the proof — and an attached
scan report is a claim about a scan, not a scan.

**"We'll warn on test changes rather than block."** A warning on a forged proof
is a forged proof with a footnote. Test edits that reduce assertion strength
fail the proof; a test change that is genuinely needed is a separate, human-
owned change, not part of the proof it would weaken.
