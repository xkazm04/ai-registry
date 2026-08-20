---
layer: technique
type: technique
subject: visual-script-to-code-transpilation
technique: structural-round-trip-diff
status: forged
laws: [one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [reconciling an exported graph against hand-written code, detecting drift after a port, deciding whether a generated file still matches its source graph]
---

# Structural round-trip diff

After a graph is ported, two artifacts describe one behaviour. The question that
recurs forever afterwards is whether they still agree. The answer cannot come from a
textual comparison, and the reason is not fussiness: an emitted artifact and a
hand-written one differ freely in statement ordering, formatting, naming of generated
temporaries, comment placement and helper decomposition, while describing exactly the
same program. A line-oriented diff on that pair reports near-total difference and is
therefore ignored — which is worse than not running it.

The comparison runs over the **semantic tree**, and its output vocabulary is
membership, not location: *this graph node has no counterpart in the code*, *this code
member corresponds to no node*. That sentence is actionable by the person who owns the
graph. "Line 40 differs" is not.

## What gets compared

Parse both sides into the same tree shape — the same one the transpiler's front end
produces — and compare:

- **Members**: the set of properties and functions, by resolved signature.
- **Events**: each event and the owner-resolved callback it became.
- **Calls**: the set of engine or subsystem calls each body makes, as a multiset.
- **Control structure**: branches, loops and frame-spanning constructs, as a shape.
- **Literal values**: numeric constants and configured parameters, which are where
  quiet edits actually happen.

Everything else — names of locals, ordering of independent statements, formatting — is
normalised away before comparison. Normalisation is the technique's real content;
choose too little and the diff is noise, too much and it stops seeing real change.

## Procedure

1. **Normalise both trees** with an explicit, written list of what is being erased.
   Every normalisation is a class of change the diff can no longer detect, so the list
   is a statement of the diff's blind spots and belongs in its output header.
2. **Parse the code side with a real structural parser, shared with the verifier.**
   Pattern-matching over source text is the trap under the trap: it reports members
   that were only mentioned in a comment or at a call site, and it misses exactly the
   members whose types are pointers or templates — which are the ones the port most
   often gets wrong. One parser, used by the diff and by whatever else reads that code,
   so the two never disagree about what the file contains.
3. **Match by identity, then by shape.** If the emitter stamped a stable node
   identifier into the code, match on it — this is worth building, and it is cheap to
   add at emit time. Where no identifier exists, match on resolved signature, then on
   call-set similarity. Never match on source position.
4. **Make identity deterministic across re-parses.** Where the export supplies stable
   identifiers, use them. Where it does not, synthesise them from a per-parse counter
   in traversal order so that parsing the same graph twice yields the same ids —
   otherwise every identity-keyed comparison, saved verdict and stored annotation
   detaches on the next run. Two details bite here: names are not unique within a node,
   so a synthesised identifier needs an index as well as a name; and an edge endpoint
   may denote either a port or a whole node depending on which export path produced the
   file, so the endpoint index registers both and resolves either.
5. **Classify each unmatched item into one of four verdicts**: *only in graph* (unported
   or removed from code), *only in code* (hand-added behaviour, or a lost node),
   *matched with differing detail* (naming the differing field), *unmatched and
   unmatchable* (a node kind the diff cannot represent). The fourth verdict must exist
   and must be visible: a node the comparison could not evaluate is **not measured**,
   never a match.
6. **Report in graph vocabulary for the designer and code vocabulary for the
   engineer** — the same finding, two renderings, from one finding record.
7. **Give the whole run a verdict bound to both inputs' fingerprints**, so a stale
   report is recognisable as a statement about the past.

## Decision rules

- When the diff reports a difference, it names which side is authoritative before
  proposing anything. Two live authorities over one behaviour is the underlying defect;
  the diff exists to detect drift between an authority and its documentation, not to
  merge two peers. Pick the authority once, per subsystem, in writing.
- When a graph node re-evaluates on each use and the code hoisted it into a local, that
  is a *known, policy-level* difference. Encode the policy so the diff suppresses it by
  rule rather than by a maintainer learning to ignore a recurring line.
- When more than a small fraction of items land in the unmatchable verdict, stop
  reading the diff and fix the parser. A comparison that cannot represent much of its
  input is reporting on the part it happened to understand.
- When the code side has been refactored into helpers the graph never had, match at the
  call-set level rather than the function level; otherwise every legitimate cleanup
  reads as divergence and the tool loses its audience.
- Run the diff on a schedule, not only after a port. Its value is drift detection over
  months; a tool run once at hand-off is a test, not an instrument.

## When not to use this

Do not build this when the port is one-directional and the graph is deleted at
hand-off — there is nothing to drift against, and the effort belongs in review
instead. Do not use it as evidence of behavioural equivalence: a perfect structural
match still says nothing about whether the ported system does the same thing at
runtime, and every unmatched-but-equivalent refactor teaches the reader to discount
the tool's findings. Its honest claim is bounded and useful: *nothing in this graph
lacks a counterpart, and here is what the comparison could not see.*
