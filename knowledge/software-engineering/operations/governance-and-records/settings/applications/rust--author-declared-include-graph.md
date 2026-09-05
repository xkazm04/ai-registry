---
layer: application
type: application
subject: settings
technique: author-declared-include-graph
stack: rust
verified_on: 2026-09-04
applied: simulation
ab_verdict: unapplied
---

# An include graph with a per-link root, and the channel it borrowed

Citations are against `sagiegurari/cargo-make` commit `95dcc54`, version
`0.37.24` (`Cargo.toml`) — an external reconciliation of a task runner whose
configuration file may name the files it extends, recursively. The pin sits here
in prose rather than in `verified_against`, whose contract is a stack runtime
version. No fleet project currently carries a configuration format that names its
own parents, so this technique is **unapplied** in the fleet; the return condition
is at the end.

## 1. The per-link root, realized

The extend declaration has three forms — a bare path, an options object, and a
list of options objects merged in order — and the options form carries a
`relative` field naming which root the path resolves against. The enumeration is
`makefile`, `git`, `crate`, `workspace`, defaulting to `makefile`: the including
document's own directory.

This is the technique's central rule in the tree, and the tree's own reason for it
is the one the technique gives. A shared fragment that references something beside
itself needs its own directory. A fragment referencing a repository-wide artifact
needs the version-control root. A fragment inside one package of a multi-package
repository needs the workspace root to reach a sibling. The fragment is the only
party that knows which, so the choice is a property of the link.

**Where it departs from the technique, and the departure is the finding.** An
unrecognized `relative` value does not refuse. It warns and falls back to the
including document's directory:

> `Unknown relative-to value: {}, defaulting to makefile`

That is the exact failure the technique tells you to refuse. The local-directory
answer is the one most likely to look correct in the repository where the fragment
was authored, and wrong in every repository that adopts it — a typo in `relative`
therefore produces a fragment that passes review at home and silently reads the
wrong file everywhere else, with a warning in a log nobody is reading during
adoption. The tree implements the mechanism and then opens the hole the mechanism
exists to close.

## 2. Origin provenance, and the channel it borrowed

Each task loaded from an external document is stamped with the document it came
from and that document's directory, so a relative path inside an inherited task
resolves against the file that declared it rather than the file that inherited it.
The requirement is right and the technique states it.

The realization carries the provenance **inside the task's own environment map** —
the same key-value channel the author writes their variables into. The cost is
visible in the tree and is the reason this technique names the rule at all: the
merge can no longer distinguish a task that declared no environment from a task
that declared only the two injected keys, and the only available discriminator is
the payload's shape. The literal test —

> a map of length exactly 2, containing exactly these two key names

— appears at **two** independent points where inheritance is decided, once in the
descriptor merge and once in the execution-plan normalizer. Neither site is
comprehensible from the other. Adding a third injected key would break both
silently, and nothing in the type system, the tests or the file layout connects
them.

This is the strongest available evidence for the out-of-band rule, and it is
negative evidence: a competent tree that took the free channel and is now
maintaining a hand-written sentinel equality in two places to undo it.

## 3. Cycles and optional links

Both handled, and worth recording because they are cheap and frequently absent.
Alias resolution tracks the visit path and refuses on re-entry with the chain
rendered — `a -> b -> c -> a` — rather than with a bare "cycle detected", which is
the diagnostic the technique asks for. The plugin subsystem carries the same
walk with the same shape, independently.

The optional link is `optional: true`, inverted into a `force` flag at the load
site: absent is a skip, and a present-but-unreadable document still stops. The
technique's rule holds here without amendment.

## Return condition

This lands in the fleet the day a managed project grows a configuration format
whose documents name their own parents — a shared lint base, a shared pipeline
fragment, a settings file with an `extends` key. Until then the fleet's
configuration is resolved by
[cross-source-precedence-chain](../techniques/cross-source-precedence-chain.md)'s
shape, where the sources are declared by the platform and this technique does not
apply. The registry's own clause stamper is the nearest thing and is not it: it
inlines a shared fragment into many documents rather than merging many documents
into one, and it already carries provenance out of band, in a marker comment that
is not part of the document's own content channel.

## What this realization cannot do

It cannot tell you what the out-of-band channel should be, only that the in-band
one is wrong — this tree never built the alternative, so the technique's
prescription (a field on the entry's record, or a side table keyed by identity) is
argued from the cost of the shortcut rather than demonstrated against a tree that
paid for the right thing.
