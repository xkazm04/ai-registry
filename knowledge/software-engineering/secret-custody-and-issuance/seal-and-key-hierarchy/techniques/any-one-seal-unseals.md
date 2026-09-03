---
layer: technique
type: technique
subject: seal-and-key-hierarchy
technique: any-one-seal-unseals
status: forged
laws: [absent-guard-is-loud, creation-names-reaper]
shared_with: []
use_when: [the only custody of the root key is one external key service, adding a break-glass or second-region custody, deciding what happens when a seal is unreachable at start, migrating from one seal to another without downtime]
stage: multi-service
---

# Any one seal unseals

A seal is a custody of the root key: a mechanism that, given something from
outside the store, produces the root key in memory. The technique is to let
**several** seals coexist over the same root, each holding its own independent
encryption of it, and to let any one of them unseal the server on its own. It
exists because a single custody is a single lifecycle dependency, and the one
custody that is easiest to operate, an external key service, is also the one
whose failure is total: if the service's key is deleted, the store and every
backup of it are ciphertext forever.

## The layout

Each seal is named, and each name owns one stored entry: the root key
encrypted under that seal. Initialization produces the root once and encrypts
it N times. Adding a seal later is a re-encryption of the root under the new
seal while the server is unsealed, which is the same operation as migrating
between seals, except that the old entry is kept. Removing a seal is deleting
its entry, and the deletion is part of the removal, not a cleanup someone
remembers ([creation-names-reaper](../../../_laws.md#creation-names-reaper)):
an entry left behind for a seal that is no longer declared is a custody nobody
is watching.

The seals are declared with a **priority order**, and the order is local to
the node: two nodes of one cluster may prefer different seals, because the
key service nearest one is the one farthest from the other, while the seal
names and their stored entries are shared. At unseal, the server walks the
order asking each automatic seal to produce the root without blocking, and
stops at the first success. A seal that fails, because its service is
unreachable, is skipped; the automatic seals keep being retried on a period
in case one comes back. A threshold seal is never walked, because it cannot
produce anything until people act: if every automatic seal has failed and a
threshold seal is declared, the server waits for shares as a threshold-sealed
server would, and a share presented without naming its seal goes to the
highest-priority threshold seal. The order is a declaration about which
custody the operator wants to be the ordinary one, and the rest is what
happens when the ordinary one is gone.

The two-seal form, one automatic seal with a threshold seal behind it, is the
common deployment and it is a strict subset of the N-seal form. When a design
special-cases two seals, a primary and a fallback with their own two code
paths, the third seal (a second region, a second provider, a hardware module)
arrives with a rewrite. Build the list and the walk from the start; two is a
list of length two.

## The rule that governs the choice of seals

Confidentiality of the store is exactly the confidentiality of the **weakest**
seal, because an attacker needs any one of them and not all of them. Every
seal added is a subtraction from the security of the whole and an addition to
its availability, and the technique is honest that this is the trade being
made. The decision rule follows: when adding a seal, add one whose failure is
independent of the seals already present, and whose custody is at least as
strong as the one you would otherwise lose the store to; because a second
seal that fails with the first buys nothing, and a second seal weaker than an
attacker's reach hands them the root by the easier door. Two keys in one
account of one provider fail together when the account does. A threshold of
shares held by the same team that holds the service credential is not a
second custody; it is the first one wearing a different coat.

The naive reading is that more seals means more resilience. It means more
resilience against loss and less against theft, and the operator who adds a
static key from the environment as a convenience seal beside a hardware
module has reduced the module's custody to the environment's.

## What the technique does not do

It does not require a threshold of seals. An m-of-n requirement across seals
would restore the security of the strongest seal at the cost of the
availability the technique exists to buy; the design that wants that has one
seal, and it is the hardware one. It does not automate the presentation of
human-held shares; a helper that types shares in from a stored file has
converted a threshold seal into a static key with extra steps, and should be
declared as the static seal it is.

## Rotation across N seals

Rotating the root key re-wraps the keyring and must eventually re-encrypt
the new root under **every** seal, and a seal that is unreachable at rotation
time cannot take part. There are two honest designs and one dishonest one.
The simple design **refuses** the root rotation while any seal is offline,
so that every seal's entry always names the current root; its cost is that a
break-glass seal whose shares are held offline needs those shares present
for every root rotation, which is also its virtue, because a custody that is
never exercised is a custody whose validity is unknown. The full design lets
an offline seal fall behind and **catch up**: alongside each seal's
encryption of the root the leader keeps a copy of the keyring under that
seal's own current root and a copy of the latest global root under that
keyring's newest term, so that a node unsealing through a stale seal
recovers an old root, opens its per-seal keyring with it, reads the latest
root from there, and then opens the current keyring; on unsealing it
reports upward and its seal's entries are rewritten to current. The
dishonest design rotates, skips the offline seal, and stores nothing for it,
which leaves an entry that will silently fail at the next outage, the
moment it exists for. The decision rule: when the seals can all be assumed
online at rotation time, refuse on absence; when they cannot, because one is
a region that may be partitioned for hours, keep the per-seal catch-up
copies; never skip. Either way the guard that every seal is current is
visible rather than assumed ([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)):
the status surface reports, per seal, whether its entries name the current
root, so a seal that would fail at the next unseal is seen before it is
needed.

## Status is per seal

A sealed server's status answers which seals are declared, which one unsealed
it last, and, for a threshold seal, how many shares of the threshold have been
presented. Progress on a threshold seal is per-seal state with a nonce; shares
presented for one seal do not count toward another, and cancelling discards
them. The status is what lets an operator mid-outage tell "the automatic seal
is down and two of three shares are in" from "nothing has happened", and a
design that reports one boolean has hidden the only fact that matters during
the outage.
