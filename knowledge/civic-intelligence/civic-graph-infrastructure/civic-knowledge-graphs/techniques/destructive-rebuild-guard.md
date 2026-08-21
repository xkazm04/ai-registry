---
layer: technique
type: technique
subject: civic-knowledge-graphs
technique: destructive-rebuild-guard
status: forged
laws: [incident-anchored-doctrine, one-definition-one-import]
shared_with: []
use_when: [writing a graph ingest with a reset flag, recomputing a deterministic layer, protecting accreted enrichment from a partial writer]
---

# Destructive rebuild guard

The concern: in an accreting graph, every writer is partial — it rebuilds the
kinds and relations it owns and knows nothing about the rest. The moment such a
writer offers a "reset" or "clean rebuild" flag, it holds a loaded weapon: a
wipe deletes the whole store, and the writer restores only its own slice. On a
mature graph the slice is a rounding error — a writer that regenerates a
thousand claims can preside over the deletion of hundreds of thousands it
cannot put back. The guard makes that arithmetic visible *before* the wipe, and
refuses by default.

The incident shape, per
[incident-anchored-doctrine](../../../_laws.md#incident-anchored-doctrine), is
worth stating because it recurs everywhere: the reset flag was written in week
one, when the writer's output *was* the whole graph, and it was correct then.
Months of enrichment later, the operational docs still prescribed the same
reset command as routine maintenance — the command's meaning had silently
inverted from "regenerate everything" to "destroy almost everything", and no
one had re-derived it. A guard computed from live state is the only defense
against doctrine that was true when written.

## Compute the verdict from the store, never from a list

Before any wipe, the guard compares **what the store actually holds** against
**what this run is about to emit**, and classifies the difference. A hardcoded
list of "kinds other writers own" is a trap — per
[one-definition-one-import](../../../_laws.md#one-definition-one-import), it is a
second definition of the graph's contents, and it drifts: a kind introduced by
a future pass would be unprotected until someone remembers to add it. Queried
from the store, a new kind is protected the day it lands, with zero
coordination.

Three findings, kept as three separate claims because they are:

- **Dropped kinds and relations** — present in the store, absent from this
  run's output entirely. Wiped and never restored. Report each with its row
  count.
- **Orphaned ids** — a kind this run *does* rebuild, but an id it does not
  re-emit: a member whose mandate ended, a committee that emptied. The kind
  survives; those rows do not. This finding needs per-id comparison, because
  identity-level loss hides inside a kind-level match.
- **Scope honesty** — state what granularity each comparison runs at and why.
  If edges are judged by relation only (because the run regenerates its own
  relations wholesale and per-edge comparison would cost a large read to
  protect nothing), say so in the guard's own documentation. An unstated scope
  is a future misreading.

## Refuse by default, override explicitly, archive regardless

The verdict drives a three-way outcome:

- **Nothing at risk** — the run rebuilds a superset of what a wipe would
  remove. Proceed; say so.
- **Data at risk, no override** — refuse, with a message that does the
  teaching: the totals ("this would delete N nodes and M edges it cannot put
  back"), the named kinds and relations with counts, sample orphaned ids, and
  — critically — the correct alternative: *a recompute does not need a wipe;
  the upsert replaces claims in place and merges properties*. A guard that
  only says "no" trains operators to reach for the override; a guard that
  names the safe path retires the habit.
- **Override passed** — the operator has decided the wipe happens. Proceed,
  but print the same full accounting first, and record that the override was
  used. The override flag must be its own explicit, ugly argument — never
  bundled into a convenience flag, never defaulted by an environment setting.

Independently of the guard: a wipe **archives** what it deletes to history
tables rather than dropping it. Archival is a record, not a restore — treating
"it's in history" as recoverability is how the guard gets argued away — but it
converts a catastrophe into an investigation.

## Decision rules

- When adding any flag whose implementation deletes rows it did not write,
  add the guard in the same change. A destructive flag without a guard is a
  defect from birth, not a simplification.
- When the guard fires on a "routine" operation, the doctrine is stale, not
  the guard: fix the runbook to the non-destructive path in the same session.
- When a writer genuinely must retire a kind (a purge of measured false
  edges), that is a *deliberate deletion pass* with its own ledger entry and
  counted casualties — run it as itself, not by overriding the guard on an
  unrelated rebuild.

## When not to use it

A store with exactly one writer that regenerates everything from source on
every run needs no guard — the wipe and the rebuild are the same set by
construction. The guard becomes mandatory at the first moment a second
writer's claims persist in the store; retrofit it then, not after the first
loss. And do not substitute the guard for backups: it prevents the *foreseen*
destructive path, while operator error at the storage layer needs the
ordinary, boring protections underneath.
