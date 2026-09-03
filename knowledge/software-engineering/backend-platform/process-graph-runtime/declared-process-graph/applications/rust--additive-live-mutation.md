---
layer: application
type: application
subject: declared-process-graph
technique: additive-live-mutation
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# Mutating a running dataflow: typed replies, an exhaustive purge, and a latched barrier

A dataflow middleware written in Rust changes a running graph through
coordinator-to-daemon messages applied inside the daemon's single-threaded event
loop (commit `bdd1516`). Its design record states the technique's premise
exactly: "Leverage the existing single-threaded daemon event loop — `mappings`,
`open_inputs`, and `subscribe_channels` are already mutable HashMap/BTreeMap
owned by the event loop. **No locking needed.** New messages in the
coordinator-daemon protocol trigger additive mutations"
(`docs/plan-dynamic-topology.md:11`).

The mutation vocabulary is a closed enum
(`libraries/message/src/cli_to_coordinator.rs:212-248`): `AddNode`,
`RemoveNode`, `ReplaceNode`, `AddMapping`, `RemoveMapping`.

## The typed-reply rule, and the two shapes of its absence

`libraries/message/src/daemon_to_coordinator.rs:484-513` carries one reply
variant per mutation and documents why each exists:

- `AddNodeResult` (`:491`): "Previously the daemon returned `None` and the
  coordinator accepted **any successful TCP response** as proof that AddNode
  applied, even a `SetParamResult` or other unrelated reply — committing state
  for a node the daemon may have rejected (#1682)."
- `AddMappingResult` (`:506`): the other face. "Previously the daemon returned
  `None`, which the coordinator's WS layer skipped instead of forwarding as a
  reply, causing `send_and_receive` to time out after 30s with `daemon dispatch
  failed: timeout waiting for daemon WS reply`. **Same bug class as #1682's
  AddNode silent-reply hole**."
- `ReplaceNodeResult` (`:499`): "the coordinator only commits its descriptor
  update after matching this exact variant."

`ReplaceNode` is also the technique's in-place cousin, with its safety condition
stated in the protocol (`cli_to_coordinator.rs:224-227`): the replacement "must
keep the node's edges (same input mappings, outputs covering every mapped
output); a spawn failure leaves the current incarnation running."

## Removal purges every table keyed by the id, because ids are re-added

`binaries/daemon/src/lib.rs:3366-3418` is the whole purge, and the order matches
the technique: mappings where the node is a source are removed and each
downstream receiver gets `close_input` **before** the entry disappears
(`:3374-3380`), then mappings where it is a receiver (`:3383-3385`), then eleven
further tables. The comments name the re-add hazard rather than a leak:

- timer/log subscriptions are dropped "so a re-added ID is classified by its own
  inputs, not stale timer/log state (which would mark it never-finishing
  forever, #2270)" (`:3386-3392`);
- `connected_nodes.remove` because "a re-added node ID would look
  already-connected before its new incarnation subscribes and could be selected
  mid-startup (dora#2270)" (`:3404-3407`);
- `forget_node_bookkeeping` because otherwise "stale
  input_deadlines/broken_inputs entries are re-scanned every tick forever and
  the stderr queue leaks across repeated dynamic add/remove cycles"
  (`:3409-3414`).

## The barrier is latched, and it has a cohort

`binaries/daemon/src/pending.rs:18-120` implements the replayed verdict.
`external_ready: Option<Vec<NodeId>>` is the latch, and its comment is the
technique's argument verbatim: the coordinator broadcasts `AllNodesReady`
"exactly once per dataflow… Without a latch, only the subscribers parked at that
instant are ever answered: anything subscribing later — a `dora node add`, a
dynamic node connecting on its own schedule, or a node being restarted — parks
in `waiting_subscribers` behind an event that will not fire again, and its
`init_from_env()` never returns (#2938)." It stores the failure list, not just
the fact, because "a barrier can release having failed, and a node subscribing
afterwards must get the same answer as one parked at release time."

`cohort` (`:41`) is the two-memberships rule: the local, non-dynamic nodes the
descriptor started from. Nodes outside it "neither gate the barrier nor inherit
its failures (#2917). **They still wait on it**, so a node arriving mid-startup
does not begin producing before its consumers are listening." And
`handle_node_removal` (`:118`) is both corollaries at once — it scrubs the
never-cleared `exited_before_subscribe` list so that "a `remove` + re-`add` of a
node that had not yet subscribed would [not] poison every later subscribe for
the life of the dataflow, naming an id that is alive again by then", and it
re-evaluates the barrier because "removing a node that had not yet subscribed
can be the thing that completes the cohort."

The test at `pending.rs:970`,
`late_subscriber_does_not_start_a_dataflow_whose_barrier_failed`, pins the
failure half: a late cohort member inherits the remote startup failure, the
error names the node that died, and the barrier does not report ready — because
"reporting ready here would let a late `dora node add` start a dataflow the
coordinator declared dead."

## Deviation

`guide/src/operations/dynamic-topology.md:46-51` records the feature as
incomplete: "Daemon-side node spawning for `AddNode` is pending (coordinator
dispatch works, daemon logs a warning)", "Cross-daemon dynamic topology not yet
supported", and "Dynamic nodes are not persisted across dataflow restart". The
mutation *protocol* — typed replies, purge, latch — is built and is what this
document cites; the spawn at the far end of `AddNode` is not, on this commit.
The standard is unchanged: a mutation path whose reply says applied while
nothing spawned is the exact failure `AddNodeResult` was added to prevent, and
the tree is honest about being mid-build rather than wrong about the design.
