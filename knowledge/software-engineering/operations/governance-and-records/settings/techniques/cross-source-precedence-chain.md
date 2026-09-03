---
layer: technique
type: technique
subject: settings
technique: cross-source-precedence-chain
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success, derivation-names-recomputation]
shared_with: []
use_when: [one binary must boot against an operator file locally and an injected identity in a cluster, a value is right on one machine and wrong on another with no code difference, an operator typo'd a config file and the process kept running against something else, deciding whether a second configuration source layers per key or replaces the first wholesale]
---

# Cross-source precedence chain

Most of this subject assumes one store: a key space with one substrate, where
absent means "substitute the declared constant"
([typed-accessors](./typed-accessors.md)). A class of configuration does not
fit that assumption, because the same key can legitimately be supplied by
**several independent sources** and the running process must decide, at boot,
without being told which one applies. An explicit path handed on the command
line. A path named by an environment variable. An ambient identity the
execution environment injects — mounted credential material, a service address
in the environment block. A built-in default compiled into the binary.

Each of those sources may be **partial**: present but answering only some of
the keys, or present and unreadable. So the resolution is not a lookup, it is a
**declared order across sources**, and that order is the contract. Everything
below follows from one property: because a settings read never fails loudly,
a chain that silently fell through to a lower source produces a plausible
value, on the wrong target, with no error anywhere.

## The order is declared, named, and singular

Write the chain down as an ordered list of named sources, once, in the place
the resolution runs — not as the incidental order of the branches in a boot
function. The names matter as much as the order, because every diagnostic
below quotes them, and a source with no name cannot appear in a message an
operator can act on.

Two properties of the order are separate decisions, and conflating them is the
usual defect:

- **Precedence** — which source wins when two answer the same key.
- **Composition** — whether a winning source answers *the whole configuration*
  or only *the keys it carries*.

**Whole-object composition**: the first source that answers at all supplies
everything, and lower sources are never consulted. **Per-key layering**: every
source is consulted, and for each key the highest-precedence source that
carries it wins. Both are defensible; a chain that is one for most keys and
the other for two of them, because those two were patched in later, is
defensible only by whoever wrote it and only that week. State which shape the
chain has, and if some keys genuinely layer over a whole-object chain — a
proxy address, a debug override — enumerate them as their own named steps
rather than leaving them as `or_else` tails discovered by reading.

## Absent is a skip; malformed is a stop

This is the rule the chain exists to get right, and the one naive
implementations get wrong.

- A source that **is not there** — no path set, no file at the default
  location, no injected identity — did not answer. Skip it and continue down
  the chain. That is what a chain is for.
- A source that **is there and cannot be read** — a syntax error, a truncated
  file, a value of the wrong type, a reference to a context the file does not
  define — **stops the chain**. It does not fall through.

The distinction is [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
applied across sources: a source that failed to parse has not said "nothing",
and treating its failure as absence launders an error into a silent
substitution. The failure that follows is the signature one for this whole
technique. An operator edits the explicit file, mistypes one line, restarts —
and the process, finding that source unusable, quietly proceeds to the ambient
identity and runs successfully against a completely different target. Nothing
crashed. Nothing was logged above trace level. The only symptom is that the
work landed somewhere else.

The corollary for the last rung: when a chain reaches a built-in default, that
must be a *decision*, not a fall-through. A default reached because every
prior source was legitimately absent is fine — it is the compiled-in answer
doing its job. A default reached because a source above it broke is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) in
configuration clothing.

## The chain records which source answered

The resolved configuration is a derivation of N inputs and must name its
recomputation
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Concretely, that means the resolution keeps **provenance**: for a whole-object
chain, the name of the source that won and the names of the sources it skipped;
for a per-key chain, the winning source per key.

Provenance is not observability garnish. It is the only thing that turns "this
value is wrong on that host" from archaeology into one question with one
answer, and it is what makes the chain auditable at all — a value whose origin
cannot be stated is a value nobody can be accountable for. Expose it where a
human already looks: a startup line naming the winning source, and a
diagnostic surface that can be asked "where did this value come from" without
attaching a debugger. A trace-level breadcrumb is not enough, because the
failure appears in production and the trace level does not.

**The rejected alternative is one merged map with no provenance.** It is
seductive — every source deserialized into the same shape, folded together,
one clean value per key at the end — and it is exactly the thing this technique
refuses. Fold first and the question "which source set this?" is
unanswerable, forever, for every key, because the evidence was destroyed at
the moment of merge and no amount of downstream logging can reconstruct it.
Fold *while recording who supplied each winning value* and the same clean map
comes out with the audit intact.

## When the whole chain fails, keep every failure

If no source answers, the error is not the last source's error. Carry **all**
of them — each named by its source — because an operator debugging a boot
failure needs to know that the explicit path was unset *and* the file at the
default location was malformed *and* no ambient identity was present.
Reporting only the last one sends them to the wrong end of the chain.

Where the reporting surface can only headline one cause, choose it by **which
failure a human most likely caused**, not by which came last: an operator's
own file is a likelier mistake than an injected identity, so it leads, and the
others are attached beneath it. This is a presentation rule, never a licence to
discard the rest.

## An override layer is a source, and it is loud

Environment-supplied overrides applied *after* the chain resolves — an
impersonated identity, a substituted endpoint, a forced timeout — are a source
with the highest precedence, and they belong in the declared order like any
other. Two rules keep them from becoming a permanent shadow configuration:
each override announces itself at a level an operator will see, and each is
documented as a debugging aid rather than a supported configuration surface.
An override that applies silently is indistinguishable from the configuration
being wrong.

## When not to use this

- **One source.** A chain over a single store is ceremony; the ordinary
  registry and typed accessor already cover it.
- **One key following one live source.** A key whose absence means "follow an
  upstream signal continuously", where a write means *detach* and a delete
  means *re-attach*, is [inherited-default-override](./inherited-default-override.md)
  — a different mechanism, because there the stored row's *presence* carries
  meaning and the source keeps moving after boot. A precedence chain resolves
  once, at boot, across sources that are each static for the process's life.
  A system can have both; do not model either as the other.
- **An open key space.** The chain resolves *values* for keys the
  [key-registry](./key-registry.md) has already declared. It never licenses a
  key that arrives because some source happened to carry it — an unregistered
  key from a lower rung is exactly the orphan the registry exists to refuse.
- **Order that depends on the value.** If which source wins depends on what it
  says rather than on what it is, that is a policy engine, and calling it a
  precedence chain hides the fact that its outcome cannot be predicted from the
  environment alone.
