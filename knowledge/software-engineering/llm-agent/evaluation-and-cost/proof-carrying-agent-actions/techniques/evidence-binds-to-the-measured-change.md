---
layer: technique
type: technique
subject: proof-carrying-agent-actions
technique: evidence-binds-to-the-measured-change
status: forged
laws: [gate-sees-target, identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when: [a verdict is stored and later read by a merge gate, a branch can move after it was checked, a scanner or checker is upgraded between finding and fix]
---

# Evidence binds to the measured change

A proof is a set of observations, and an observation is true of a particular
commit, taken by a particular instrument. Drop either and the observation can
be reused for a claim it does not support: a green run on yesterday's head
vouching for today's, a rescan by a newer scanner vouching for a fix to a
finding the older scanner raised, a verdict from a checker build that has since
been fixed vouching for a proof it would now refuse. This technique pins both
ends — what was measured and what measured it — into every observation and into
the verdict.

## What the verdict carries

- **The base and head identities** — full commit hashes, never branch names. A
  branch is a pointer, and the pointer moves.
- **A digest of the change itself** — of the diff between base and head as the
  checker computed it. Two different base/head pairs can carry the same change,
  and one pair can be rebased into a different change; the digest is what the
  envelope and weakening checks actually judged.
- **The checker's identity** — a content hash of the checker code and a
  revision of the policy it read, so a verdict produced before a checker fix
  can be found and re-run after it. Hash what *runs*: the checker's entry point
  and its whole import closure, including any shared rules it borrows from
  outside its own folder, and nothing it does not import — not its tests, not
  its fixtures. An import the hasher cannot resolve, an alias it does not
  follow, or a dynamic import it cannot see is an error, never a smaller pin:
  a pin that silently drops a file vouches for code it never covered, and the
  dropped file is usually the one that changed.
- **Each instrument's identity** — the scanner and its version and rule set,
  the test runner and its version, the environment image the runs used.
- **Per observation, the commit it was taken at** — the exploit test's failure
  is a base observation and its pass a head observation, and the verdict
  refuses a pair whose sides were taken at commits other than the ones it
  names.

The shape is the one software supply-chain attestations already use for build
outputs: a subject identified by digest, a verifier identity, the policy it was
checked against, and a result. A proof verdict is a verification summary whose
subject is a diff.

## Same scanner, same version

The rescan that shows a finding gone is meaningful only when it is the scan that
raised the finding. A newer scanner version may have dropped the rule, renamed
it, changed its matching, or simply not have the detector at all; a different
scanner may never have seen the class of issue. So the rescan pins the scanner,
version and rule set recorded on the finding, and a mismatch is inconclusive.
The base side matters as much as the head side: the finding must appear in the
base scan by its identifier before its absence at head means anything, and a
finding the base scan never reported is inconclusive — there was nothing to
close.
"The finding is gone" is a claim about a rule on a commit; anything else is a
claim about a different instrument.

## A moved branch is a different change

When the head moves after a verdict — the agent pushes again, someone rebases,
the base advances and the merge would include new upstream changes — the
verdict does not transfer. The gate compares the head it is about to merge, and
the change digest it would merge, with the ones the verdict names; any
difference re-measures. Two cheaper checks are worth having even where the
gate does not hold a digest. When the gate measures the diff itself, the set of
paths the proof says it read must equal the set the gate measured — a proof
made from a diff that leaves a file out read a different change. And a proof
class whose checks read the diff, but which reports having read zero files,
cannot vouch for a non-empty change; that is a proof assembled without its
input, and it blocks. Path equality is a floor, not a substitute: two diffs
over the same paths can differ in every line. This is where a stored verdict most often stops
describing the thing it gates ([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)),
and where identities minted at measurement time pay for themselves
([_laws: identity-survives-reuse_](../../../../_laws.md#identity-survives-reuse)).

## The verdict names its recomputation

A stored verdict is a derived value. Store with it the inputs that reproduce it
— the identities above — so that anyone can rerun the checker over the same
commits with the same build and get the same result
([_laws: derivation-names-recomputation_](../../../../_laws.md#derivation-names-recomputation)).
A verdict that cannot be recomputed is an assertion by the gate, which is one
step better than an assertion by the agent and still not a proof.

## Decision rules

- When storing a verdict, pin base, head, the change digest, the checker build,
  the policy revision and every instrument's version.
- When the head or the change digest differs at merge time, re-measure; never
  carry a verdict forward.
- When the rescanning instrument differs from the one that raised the finding,
  the rescan observation is inconclusive.
- When the checker build changes, verdicts from the old build stay valid as
  records but are re-run before they authorise anything new.

## When not to use this

For a change that will be merged within the same run that measured it, by the
same process, with no window for the branch to move, the pinning still costs
little and is still the record — but the re-measure rule has nothing to do. Do
not build a re-verification service for a gate that never stores a verdict.
