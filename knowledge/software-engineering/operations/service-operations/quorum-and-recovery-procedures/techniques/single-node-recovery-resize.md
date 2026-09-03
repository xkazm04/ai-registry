---
layer: technique
type: technique
subject: quorum-and-recovery-procedures
technique: single-node-recovery-resize
status: forged
laws: [creation-names-reaper, silent-state-is-ungoverned]
shared_with: []
use_when: [no quorum can form and the cluster must be operated anyway, the operator needs to read or delete raw entries below the barrier, deciding how the recovery credential is issued and how long it lives, bringing a repaired node back into a peer set]
---

# Single-node recovery, then resize

A cluster under a consensus log has one failure it cannot heal: enough peers gone
that no leader can be elected, or a corrupt entry that every peer applies and every
peer crashes on. Both states are stable. The self-healing ladder has nothing to
select from because no node can commit anything, and the ordinary API is unreachable
because the API needs a leader. Recovery mode is the procedure for that state, and
the technique is about the three things it must do that a naive "start with a flag"
misses: shrink the cluster deliberately, mint a credential that cannot outlive the
procedure, and treat growing back as part of the exit.

## Shrink to one, on purpose

The rule: **when no quorum can form, run one node with its peer set forcibly reduced
to itself, because a recovery process that waits for a quorum waits forever and a
recovery process that runs beside a partial quorum races it.** The node starts with
the log's membership overwritten to a single voter - itself - so it can become leader
of a cluster of one and apply what it needs to. This is not a configuration the
operator edits by hand; it is what recovery mode *means*, and the mode does it on
start. The naive design starts the ordinary server with "skip the quorum check", and
its failure mode is a node that reads the log, believes it has peers, and either
blocks on them or - worse - when two peers come back, splits the brain between a
recovery node that applied a delete and a peer set that did not.

Recovery mode serves nothing but repair: raw read, write, list and delete of storage
entries below the barrier, and the ritual to mint the credential that authorises
those operations. No mounts, no policies, no leases, no secrets engines. The
narrowness is the safety property - a recovery node cannot be used as a server by
mistake, and an operator who reaches for an ordinary endpoint gets a refusal that
names the mode.

## The recovery credential is minted like root and never stored

Raw access below the barrier is the most privileged operation the system has; it
must not be gated by a credential that a single operator holds, and it must not be
gated by nothing. So the credential is minted by the same threshold ritual that mints
an emergency root credential - init with a nonce, k of t shares, the credential
returned encrypted under the requester's one-time pad - so the same dual control that
protects the root material protects raw access to what it encrypts.

In recovery mode this ritual *is* the unseal. There is no separate unseal request:
meeting the threshold reconstructs the root material, opens the barrier for the
recovery process, and mints the credential in one step, because a recovery node that
could be unsealed without minting the credential would be an unsealed node with no
way to authorise anything. The mode accepts exactly one sealing configuration, since
a node repairing storage should not also be resolving which of several custodies to
consult.

The difference from a root credential is that the recovery credential is **never
persisted**. It lives in the recovery process's memory as a single value; the process
validates a request by comparing against it, not by lookup in a store that recovery
mode may be repairing; and exactly one exists at a time - running the ritual again
replaces it, so a credential the operator has lost is invalidated by minting its
successor. Restart the process and the credential is gone; the operator re-runs the
ritual. The rule: **when a
credential authorises access below the barrier, bind its lifetime to the process that
issued it, because a persisted credential would survive into the ordinary server and
become the one root-equivalent secret that no rotation retires.** The reaper is named
at creation ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)) and
it is the process exit; nothing else needs to remember to revoke it. The naive
design writes the recovery credential into the token store "so it works after
restart" and ships a permanent back door that the repair left behind.

Consequences the runbook states plainly: recovery mode is unavailable before the
share set exists - a cluster that was initialised with zero recovery shares under an
external custody has a different recovery path, through that custody - and every
restart of the recovery process costs one more ritual, so the operator plans the
repair before starting the node rather than iterating.

## Exit is a resize, not a restart

The naive exit is "stop the recovery node, start the cluster". The cluster that
starts is the one whose membership the recovery node overwrote: one voter. The other
peers, when they come back, carry logs that diverge from the repaired node's - they
never applied the repair - and the consensus layer will either refuse them or, if the
operator restores their old membership, elect one of *them* and replicate the
unrepaired state back over the repair. Both outcomes undo the procedure silently.

The rule: **when recovery reduced the peer set, the procedure's last step is
rebuilding the peer set from the repaired node - wipe the other peers' state, restart
them, rejoin them to the repaired node, and confirm they replicated its log - because
a recovery that ends at "the one node is up" has left the cluster in a state that
the next election will revert.** The exit is written into the runbook as steps with
observable completions: each rejoined peer reports the repaired node's applied
index, and only when the peer count matches the intended size is the procedure
done. This is the subject's version of converting private state into an inspectable
artifact ([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)):
the operator's belief that the cluster is whole is checked against what the peers
report, not assumed from the fact that the processes started.

## What recovery mode may and may not do

It may read, list and delete raw entries; it may write one to undo a bad entry the
operator understands; it may take a snapshot of the repaired state so the resize can
start from an artifact rather than a live node. It may not decrypt for the operator
anything the operator could not have decrypted with the ordinary API - the barrier is
open for the process, and the raw endpoints return ciphertext-or-plaintext according
to the same rule the ordinary storage layer applies. It may not create ordinary
credentials, because those would persist into the resumed cluster with no ritual
behind them. And it may not be left running: a recovery node that is reachable after
the resize is a node with a root-equivalent credential in memory and a peer set of
one, and it will accept writes that the real cluster never sees.
