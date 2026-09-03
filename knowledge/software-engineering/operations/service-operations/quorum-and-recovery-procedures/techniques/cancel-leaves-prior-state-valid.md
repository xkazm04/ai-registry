---
layer: technique
type: technique
subject: quorum-and-recovery-procedures
technique: cancel-leaves-prior-state-valid
status: forged
laws: [creation-names-reaper, unknown-is-not-a-value]
shared_with: []
use_when: [deciding what a cancel endpoint discards, a crashed procedure left an in-progress marker behind, sealing the system while a rotation is half-submitted, the operator asks whether it is safe to abandon a ritual]
---

# Cancel leaves the prior state valid

Every human-run procedure will be abandoned sometimes: a holder is unreachable, the
window closes, someone realises the parameters were wrong. The technique states the
one property that makes abandonment safe, and enumerates the abandonment paths that
must all honour it - explicit cancel, an implicit discard when the system seals or
restarts, an explicit reset of a stale lock left by a run that died, and the partial
restart of a verification round.

## The invariant

**At every step of a ritual before the verified commit, the state the system would
run on if the ritual stopped now is exactly the state it ran on before init.** Nothing
partial is persisted in a form the running system reads. Shares received so far live
in the coordinator's memory under the attempt's nonce; the computed-but-unverified new
material lives beside them; the persisted configuration, keyring and root material are
untouched until commit. Cancel is therefore trivial - drop the attempt - and it is
trivial *because the design put nothing anywhere that a cancel would have to undo.*

The rule: **when a multi-step procedure can be interrupted between any two steps,
accumulate its progress in a place the live system does not read, and make commit the
single write that the live system reads, because a procedure that persists partial
progress into live state has no cancel - it has a second procedure for undoing the
first, run by a more tired operator.** The naive design writes each accepted share's
effect as it lands - a new threshold recorded here, a new key term appended there -
and its failure mode is the half-rotated cluster: the persisted configuration says
"five shares, threshold three", the shares that exist say two of three delivered, and
nobody can say whether the next unseal wants the old shares or the new. That state is
not recoverable by the ritual's own endpoints, because they were designed for an
attempt that was either in memory or committed, and this one is neither.

## Four abandonment paths, one behaviour

**Explicit cancel** discards all partial progress for the named attempt and returns
the ritual to "no attempt in progress". A subsequent init mints a fresh nonce; shares
from the cancelled attempt are refused against it. Cancel is idempotent: cancelling
when nothing is in progress is a no-op with a success response, not an error, because
the operator calling it wants the post-condition and does not care whether it already
held.

**Sealing or restarting** discards the attempt implicitly. Progress was in the memory
of the coordinating node; when that node seals, the memory is discarded with the
rest of the unsealed state, and when it restarts, the memory is gone. The system does
not try to be clever about persisting the attempt across a seal - the attempt was
minted under a set of holders who consented to *this* run, and a run that survives a
seal is one they did not consent to. Status after unseal reports no attempt in
progress, and the holders start again. This is the reaper named at creation
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): an attempt is
created in memory and the seal is what destroys it, stated at design time, never
discovered during an incident.

**A stale lock from a dead run** is the one case where partial state does reach
storage, and it does so by necessity: an offline procedure (a migration between
stores, a repair) must leave a marker in the store so a second procedure or the
serving process refuses to run beside it. When the procedure dies, the marker remains,
and every subsequent attempt reads "in progress" for a run that no longer exists. The
technique's answer is an explicit reset flag on the procedure's own command that
clears the marker - and nothing else. Reset does not resume, does not roll back, does
not touch data; it removes the claim that a run is live, after which the operator
re-runs from the start. The marker records enough to make the decision - when it was
taken, by which host - so that reset is a judgment the operator can make from the
marker alone.

The rule for the reset: **when a lock can outlive its holder, give the procedure an
explicit operator-invoked clear that removes only the lock, because the alternative
is hand-editing storage under the barrier with a tool the barrier was designed to
prevent.** The failure mode of omitting it is that the operator learns the store's
internal key layout and deletes the marker by hand - sometimes the wrong one.

**Restarting a verification round** is the partial abandonment the two-commit rituals
need: it drops the shares submitted toward verification and mints a new verification
nonce, and leaves the computed material and the delivered shares in place. It exists
because a failed verification is nearly always a mistyped share, and the proportionate
response is "try again", not "re-mint everything and re-deliver to every holder".
The invariant still holds - the old material is live throughout - and the operation
is distinct from cancel in what it keeps, which the status endpoint reflects by
reporting the same init nonce with a new verification nonce.

## The status endpoint tells the truth about "in progress"

A stale marker is a lie of a specific kind: it renders the unknown ("did that run
finish?") as a definite value ("a run is in progress"), which is the shape
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) forbids. The
technique cannot prevent the process from dying with the marker set, so it makes the
marker carry its provenance and gives the operator a reset that acknowledges the
judgment. What the status endpoint must never do is the reverse laundering - report
"no attempt" while shares have been accepted, which is what happens when progress and
status are read from different places. Progress and status read one structure under
one nonce.

## Where cancel is not free

Two rituals commit in steps, and the technique states their edge explicitly rather
than pretending the invariant holds. A rotation with verification required has two
commits: the first computes new material and delivers new shares; the second
verifies them and installs. Cancel between the two discards the computed material and
the delivered shares become worthless - which is the invariant holding, since the old
material was never retired - but the holders now hold shares that open nothing, and
the status endpoint says "cancelled after delivery" so they know to destroy them.
The emergency-credential ritual commits at threshold with no verification; there is
no step after which cancel matters, and the credential, once returned, is revoked by
the ordinary revocation path rather than by cancelling the ritual.
