---
layer: technique
type: technique
subject: production-prompt-architecture
technique: version-keyed-engine-facts
status: forged
laws: [one-authority-per-quantity, law-and-check-share-one-source]
shared_with: []
use_when: [a prompt states facts about the target engine or toolchain, the project upgraded and prompts still describe the old environment, deciding where environment claims in a prompt should come from]
---

# Version-keyed environment facts

Every claim a prompt makes about the target environment — its version, which subsystems
exist in it, which are deprecated, what the toolchain requires — is read at assembly time
from a versioned facts source keyed by the project's actual version. None of it is typed
into prompt text.

## Why typed facts are worse than missing ones

A stale environment claim does not fail. It produces a coherent artifact authored against an
environment that is not the one it will be integrated into, and the mismatch surfaces at
integration, attributed to the producer rather than to the prompt. A missing claim at least
leaves the producer uncertain; a wrong claim makes it confident.

The rule has no exceptions worth carving, because the exceptions are where it breaks. "This
one is stable" is the sentence people write above the fact that changes next release.

## The procedure

1. **One facts source, keyed by version.** A single module maps a version to the set of
   claims true for it: subsystem availability, replaced-by relationships, required
   toolchain floors, capability notes. It is the only authority
   ([`one authority per quantity`](../../_laws.md#one-authority-per-quantity)); every
   consumer — prompt framings, build commands, compatibility checks, documentation — reads
   the same map, so a prompt and the check that validates its output cannot disagree about
   the environment
   ([`law and check share one source`](../../_laws.md#law-and-check-share-one-source)).
2. **Framings interpolate, they do not assert.** A role framing for a domain reads "on
   version X, <the fact for X>" with both parts substituted from the source. Upgrading the
   project upgrades the framing with no prompt edited.
3. **Resolve from the project, not from a constant.** The version comes from the project
   being worked on. A documented default exists only for callers with no project in hand,
   and using it is a distinct, visible case — not a silent equivalent.
4. **Fail loudly on an unknown version.** A version outside the known range raises, rather
   than bucketing into the nearest or oldest entry. Silent bucketing is how a prompt ends up
   confidently describing an environment nobody runs; an error is a five-minute fix to the
   facts source.
5. **Cache per version, not per prompt.** Resolving the full framing set once per distinct
   version keeps assembly cheap while keeping the source authoritative.

## What belongs in the facts source

- Version-gated subsystem availability, and the name of what replaced a removed subsystem.
- Toolchain and dependency floors, including known-bad ranges rather than only minimums —
  "at least this" is wrong when a specific band is broken.
- Capability notes that change the shape of correct advice at a given version.

What does not belong: project-specific state (that is the scanned-state section's job),
craft opinions that hold across versions (those are domain knowledge), and anything the
prompt does not actually state.

## Decision rules

- **When a fact is true for every supported version, it may be prose** — but put it in the
  facts source anyway if the set of supported versions is still growing. A fact that becomes
  version-dependent later is discovered by someone reading a wrong prompt.
- **When two versions differ only in a threshold number**, key the number and keep one
  sentence. Forking the sentence per version doubles the maintenance and halves the chance
  both stay right.
- **When the environment version cannot be determined**, say so in the prompt and state the
  assumed version explicitly. An assumption the producer can see is one it can flag; an
  invisible one is one it inherits.

## When not to use this

- **Environment-independent prompts.** If the output does not touch a versioned environment,
  a facts source is machinery with nothing to key.
- **A single-version project with no upgrade path** — a frozen shipped title, a one-off
  contract. The indirection costs more than it returns; state the version once and move on.
- **For facts that change faster than assembly.** Anything that varies per run rather than
  per version is live state, and belongs in the scanned-state section where its age can be
  rendered alongside it.
