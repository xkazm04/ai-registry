---
layer: technique
type: technique
subject: live-defect-debugging
technique: marked-temporary-probes
status: forged
laws: [creation-names-reaper, failure-not-empty-success]
shared_with: []
use_when: [adding instrumentation by hand to a working tree, deciding when probes may be removed, cleaning up after a verified fix, a probe payload might contain a credential or personal data]
---

# Marked temporary probes

A probe added by hand is a resource created in the middle of someone else's working
tree, and it follows the oldest rule of created things: its creator names what will
destroy it, and when ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)).
For a probe the answer has to be a procedure rather than a promise, because the
person removing it is usually not the person who wrote it, and is often the same
person a day later who no longer remembers where the probes went.

## Every probe sits inside a marker pair

Wrap each probe, however small, between a start marker and an end marker written in the
comment syntax of the language, with one fixed phrase in both so that a single search
finds every probe and a single search finds every end. Two properties follow. The
editor can fold the block, which keeps the surrounding code readable while the probes
are live, and it keeps a reviewer's eye on the intended change. And removal needs no
understanding of the probe: delete from the start marker to its matching end, inclusive.

The marker is the whole mechanism, so it has to be exact and uniform. A probe with a
variant spelling is a probe the sweep misses; a probe added without a marker because it
was "only one line" is the one that ships. When a language's comment syntax means the
fixed phrase differs by a space or a prefix, search for the part that is common to
all, and check the search against a known marked probe before trusting a zero.

## Removal is a sweep with a count and a diff

When it is time, the procedure is four steps and none is optional:

1. Search the whole tree for the marker and list every match, including files the
   debugger did not think it had touched.
2. For each match, delete the block from start marker to end marker inclusive, and
   nothing outside it.
3. Search again and require zero. A zero from a search that was never shown to find
   anything is not evidence, so run the first search before deleting and confirm it
   found the probes you remember adding
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
4. Review the full diff. The intended fix should remain, and no stray probe, no
   leftover import added for a probe, no orphaned variable. This step catches the probe
   that was written without a marker and the helper that was written for a probe.

A sweep that skips the diff has verified the markers and not the tree.

## Probes outlive the fix

Probes are not removed when the fix is written. They stay through the fix and through
the verification run, because the proof that the fix works is the same probe, in the
same place, reporting different values in a second labelled run. Removing the probes
with the fix turns "the log shows the value is now correct" into "the code looks
right", which is the claim the loop exists to avoid. Probes leave only after the
verification run shows the defect gone and the owner confirms there is nothing more to
look at. A verification that fails keeps them again, for the next round.

Two things are not a reason to remove probes early. The verification looks successful
at a glance: look at the cited lines first. The surrounding code looks cluttered:
that is what folding is for.

## Probes carry no secrets and no personal data

A probe copies runtime values to a place nobody designed to hold them: a file in a
temporary directory, a local server, sometimes a relay on someone else's machine. So
the payload excludes credentials, tokens, keys, and personal data, and records
identifiers, lengths, types, and flags instead of the values they stand for. If the
defect is in what the value contains, record a derived property of it (its length, its
shape, whether it matched) before recording the value. The rule is a forbidden
category, not a judgement call per probe, because the one probe that was judged safe is
the one that leaked.

## Boundary with build-time gates

A build-time gate that keeps development tooling out of production builds
([agent-addressable-ui](../../../../llm-agent/runtime-and-io/agent-addressable-ui/agent-addressable-ui.md))
protects a shipped artifact from instrumentation that the project owns and keeps. This
technique governs the opposite object: throwaway lines an agent adds by hand, to be
deleted, in the tree that will be committed. A build gate does not catch these because
they are ordinary source, and a marker does not enforce itself. The sweep is the
control, and the diff review is its last line.

## When not to use it

For a probe added to a scratch copy that will be thrown away whole, the marker is
ceremony. For anything in a tree that might be committed, shared, or synced, it is not.
