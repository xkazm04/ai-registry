---
layer: technique
type: technique
subject: import-normalization
technique: intermediate-representation
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary, one-validation-door]
shared_with: []
use_when: [deciding what belongs in the shared staging vocabulary, foreign ids colliding across files and re-imports, the loss ledger living in a log instead of the proposal, an adapter wants to correct the shared output after the waist produced it]
---

# The normalized intermediate representation

Every adapter lowers into one internal representation — the IR — and
everything downstream (validation, review, disclosure, commit) consumes the
IR only. The technique is the compiler industry's oldest structural lesson
applied to imports: N source formats and M consumers connected pairwise is
N×M converters; connected through a waist it is N+M, and the waist is where
every cross-cutting guarantee gets enforced exactly once.

## What the IR is — and is not

The IR is **your product's vocabulary with the source scrubbed out**:
whatever set of entities the host model can actually absorb (steps,
connections, triggers, credential requirements, parameters, metadata),
expressed in host semantics. It is *not* a superset of all source formats —
an IR that grows a field per vendor quirk becomes a museum of everyone
else's design decisions, and the waist stops being narrow. When a foreign
concept has no host counterpart, it does not get an IR field; it gets a loss
ledger entry (grade `data-only` or `unsupported` — see
[adapter-capability-tables](./adapter-capability-tables.md)).

The IR is also **not the host's persistence model**. It is a staging shape:
richer than the store in provenance and loss data, poorer in anything the
store computes (timestamps, ownership, defaults the creation door fills).
Committing means translating IR → normal creation calls, not bulk-inserting
IR rows.

## Identity is minted at the waist

Foreign identifiers are the classic trap. They are locally unique at best —
they collide across two files from the same vendor, across a re-import of
the same file, and trivially across different formats. Per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse), internal
identity is **minted at IR construction** — one fresh id per proposed
entity — and every intra-document reference (this connection joins those two
steps; this step needs that credential) is **rewritten to the minted ids at
lowering time**. After the waist, foreign ids exist only as provenance
strings; nothing dereferences them.

Getting reference rewriting right at the waist is what makes the review gate
cheap: when the user deselects an entity, the dangling references are
findable by minted id; when two selected entities both point at one
deselected credential requirement, the gate can say so precisely.

Two corollaries, both learned by measurement rather than by taste:

- **Never re-derive an association from display text.** One pipeline let
  each connector claim its triggers by scanning human-readable descriptions
  for its own service name — and every service whose name was a substring of
  another's cross-claimed ("mail" claimed the mail-service *and* the
  webmail-vendor triggers). The fix carried identity alongside the entity —
  an association slot populated at construction — instead of reconstructing
  it from prose later. Association *is* identity data; prose is for humans.
- **Synthetic entities carry empty provenance on purpose.** When the
  pipeline fabricates what the source lacked (a fallback trigger for a
  document that declared none), the fabricated entity belongs to no foreign
  source and no consolidated service — and its provenance fields must say
  so explicitly, so that every provenance-based join (which connector owns
  this? which source line produced that?) skips it instead of matching it
  by accident.

## Nothing writes to the IR after the waist has run

The waist's value is entirely a matter of *when* it runs relative to
everything else. Each guarantee it enforces — minted identity, rewritten
references, schema validity, provenance, the loss ledger's completeness,
whatever sanitization the pipeline attaches here — is a property of the
document *as the waist left it*. A later write does not inherit those
properties; it silently revokes them for whatever it touched, and it does so
without failing anything, because every gate that would have objected has
already run.

So the rule is absolute and worth stating as a boundary rather than a habit:
**an adapter may not write to the IR after the waist has run.** The
temptation is real and always looks small — one format needs a field the
generic lowering got wrong, so the adapter reaches past the waist and
corrects the output afterwards. What actually happened is that the corrected
entity's identity may no longer be minted, its references may point at
foreign ids again, its provenance may describe a value it no longer holds,
its loss ledger may claim a fidelity that is now false, and its schema
validity was proven about a different document. A single post-waist
assignment opts that entity out of every one of those at once.

An override that a format genuinely needs has exactly two legitimate forms:

- **Run before the waist.** Move the special case into the adapter's own
  lowering, where it is an input to the waist rather than a correction of
  it. This is almost always possible and is almost always the smaller diff.
- **Re-apply every guarantee explicitly, by name.** If the override must run
  after, it is not a patch — it is a second lowering, and it re-mints,
  re-rewrites, re-validates, re-provenances and re-grades the entities it
  touched, enumerating each obligation in code that a reviewer can check
  against the waist's list. The cost of writing that honestly is the point:
  it makes the first option obviously cheaper.

The canonical analogue outside this subject is the safety boundary: an
established guidance for neutralizing untrusted markup states plainly that
modifying content *after* it has been sanitized voids the sanitization, and
that reinserting sanitized output into a new parsing context reopens
precisely the injection class the pass eliminated. Guidance for output
encoding says the same from the other side — encode as the final step before
the consuming interpreter, because doing it too early lets a later transform
render it ineffective. The structure is identical here and the generalization
is the useful part: **a guarantee attaches to an artifact at a moment, not
to the artifact forever.** Whatever touches the artifact after that moment
either re-establishes the guarantee or has removed it, and there is no third
outcome — including the common one where the later write is "obviously
harmless", which is a claim about today's guarantees made by code that will
outlive them.

The enforcement is structural where the language allows it: the waist hands
downstream a value that cannot be mutated (frozen, owned, or copied on
read), so a post-waist write is a compile or runtime failure rather than a
code-review question. Where it cannot, the audit is cheap and worth running
once — every reference to the IR document downstream of the waist should be
a read.

## Provenance and the loss ledger are IR citizens

Each IR entity carries: source format and version, the foreign id and
name it came from, the adapter table row (or absence of one) that produced
it, and its conversion grade with human-readable reasons. The loss ledger is
not a log line emitted during adaptation — it is **part of the IR
document**, traveling with the proposal into review (where it renders as
disclosure) and into the commit record (where it becomes the permanent
answer to "why does this imported thing lack the behavior it had at home").
A ledger that lives in a log dies with the log; the user's question arrives
weeks later.

## The IR is versioned and validated like any contract

The IR sits between two moving worlds — adapters that change with vendor
formats, consumers that change with the host model — so it is a schema with
a version, validated at construction. An adapter that emits an invalid IR
document fails *loudly at the waist*, attributed to the adapter, instead of
surfacing three stages later as a review screen with impossible entries.
This is the [one-validation-door](../../../../_laws.md#one-validation-door)
pattern applied one level up: the door for "may enter the pipeline's second
half" is the IR schema, and the adapters are its enumerable writers.

One authority holds the IR type definitions; adapters and consumers import
them from that single place
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Two IR definitions — one the adapters target, one the review UI renders —
is the waist split back into a matrix, with extra steps.
