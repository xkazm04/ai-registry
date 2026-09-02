---
layer: technique
type: technique
subject: quorum-and-recovery-procedures
technique: nonce-progress-verify
status: forged
laws: [identity-survives-reuse, gate-sees-target]
shared_with: []
use_when: [designing a multi-share submission endpoint, a share arrives for an attempt that may no longer exist, deciding when newly rotated root material becomes the live material, an operator asks how far along a rotation is]
---

# Nonce, progress, verify

A threshold ritual is one transaction spread across several people and an unbounded
span of wall-clock time. Three design devices make it survivable: an attempt identity
that every contribution must carry, a progress report in the ritual's own unit, and a
verification round that gates the new material on the new shares. Each closes one
specific way the naive design loses the cluster.

## The nonce names the attempt

Init mints a nonce and returns it, together with the parameters the attempt is bound
to: how many shares will be minted, what threshold, whether verification is required,
what the target of the ritual is (the root material, the recovery shares, an
emergency credential). Every submit carries the nonce. A share submitted without it,
or with the nonce of an attempt that has since been cancelled, is refused before the
share is examined.

The rule: **when a contribution can arrive after the attempt it belongs to has been
replaced, bind the contribution to the attempt with an identity minted at init, because
the alternative is a share from attempt A counted toward attempt B.** The naive design
keeps a counter and accepts any valid share; its failure mode is the *stale
contribution*: an operator who received the previous attempt's instructions submits
into the next one, the counter advances, the threshold is met with a share set that
was never one set, and the reconstructed material is garbage that the system cannot
distinguish from a key. Identity minted once and carried on every step is the same
rule that governs any list that undergoes reuse
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); here the
list is the sequence of attempts and the reuse is the human who did not notice that the
attempt changed.

The nonce is also the client's only proof that the attempt it is contributing to is
the one it intended. An operator who did not start the attempt confirms the nonce
out of band with the operator who did, before submitting. A ritual whose status
endpoint hides the nonce has removed the one artifact that lets the humans verify
they are all in the same transaction.

## Progress in the ritual's own unit

Submit returns *k of t*: shares received of shares required. Not a percentage, not a
boolean, not "pending". The unit matters because the humans reading it decide what to
do next from it - "two of three" tells the third holder they are needed now, and tells
the first two that nothing has happened yet. Status returns the same number without
consuming a share, so a holder can check without contributing, and reports *no attempt
in progress* as a value distinct from *zero of t*.

A share that has already been counted is refused, not counted twice. The coordinator
compares each submission against the shares it holds - in constant time, since a
timing difference on a key comparison is a leak - and rejects a repeat with a message
that says so. Without this, one holder pasting twice reads as two of three, and the
threshold is met with fewer distinct shares than the scheme needs; the reconstruction
fails, or worse, the report lies about how many people consented.

Progress is held in the memory of the node coordinating the attempt, and it belongs
to the attempt's nonce; a status query against a different nonce reports nothing.
Submissions to a different node than the one that coordinates the attempt are either
forwarded to the coordinator or refused with the coordinator's identity - never
accepted into a second, parallel tally, which is the distributed form of the stale
contribution.

## Threshold reached is not done

At the threshold the system reconstructs what it needs from the submitted shares,
computes the new material, and *does not install it*. This is the step the naive
reading skips, and it is the one that costs clusters. The new shares are returned to
the holders (or delivered wrapped to each holder's own key), and a verification nonce
is minted. The new material is not usable for anything until a verification round
completes: the holders submit the *new* shares against the verification nonce, and only
when the threshold of new shares reconstructs the new material does the system commit -
install the new material, retire the old, and clear the attempt.

The rule: **when new material has been computed but the holders have not yet proven
they can reconstruct it, keep the old material as the live material, because a share
set that was delivered but never exercised is a share set that may have been
mistyped, mis-delivered or lost.** The failure mode is precise: a holder pasted the
share into the wrong field, or the delivery to one holder failed silently, and the
next unseal - days later, in an incident - needs a threshold of shares that nobody
has. The verification round is the gate seeing its target
([gate-sees-target](../../../../_laws.md#gate-sees-target)): it tests the thing the
ritual exists to produce, a threshold of *new* holders reconstructing the *new*
material, rather than a proxy such as "the server returned the shares without error".

Until verification completes, the old material is fully valid: the system unseals
with it, rotations under it continue, and cancelling the verification discards the
computed-but-uninstalled material with no effect on the running cluster. Verification
is itself an attempt with its own nonce, and it fails softly: when a threshold of
submitted shares does not reconstruct the new material, the verification progress is
dropped and a fresh verification nonce is minted, while the computed material and the
delivered shares stay where they are. The holders try again with the same shares under
the new nonce - a mistyped share costs one round, not the whole ritual. A restart of
verification is therefore a distinct operation from cancel: restart keeps the
computed material and re-arms the round; cancel returns to the state before init.

Delivery is the step verification cannot fix, so the technique gives it a fallback:
where each new share is encrypted to its holder's public key at delivery, the
coordinator may also keep the encrypted shares in storage until the operator deletes
them, so that a share lost in transit can be retrieved by its holder without
re-running the ritual. The fallback is an operator choice at init, because a stored
copy of every share is a stored copy of every share.

## Decision rules

Verification is the default and the operator opts out, not the reverse; where the
holders are automation and the shares are delivered to a custody the system can probe,
the opt-out is defensible, and where they are people it is not. Where the root
material is protected by an external custody rather than by shares, rotating it mints
no shares, and there is nothing for a verification round to test; the ritual then
refuses a request for verification rather than pretending to perform one. A ritual that
requires verification but whose verification is never run is not complete, and status
says so - "awaiting verification" is a distinct state from "in progress" and from
"done". The verification nonce is never the init nonce, because a client holding the
old one must not be able to submit into the new phase by accident.

Where the ritual targets a credential rather than a key set - an emergency root
credential minted by the same threshold - there is no verification round, because the
credential is used once by the person who requested it and its validity is proven by
its use. What survives is the nonce and the k-of-t report, and one addition: the
requester supplies a one-time pad at init and receives the credential encrypted under
it, so that a share-holder who sees the response cannot use the credential the
holders helped mint.

The technique is not for rituals with one participant. A single operator rotating a
key they alone hold gets nothing from a nonce; the overlap window of ordinary
credential rotation applies and this machinery is overhead.
