---
layer: technique
type: technique
subject: agent-cli-transport
technique: dated-capability-matrix
status: forged
laws: [derivation-names-recomputation, unknown-is-not-a-value]
shared_with: []
use_when: [encoding what a given agent CLI supports, an adapter hardcodes flags a version bump may break, deciding whether a feature can rely on schema-constrained output]
---

# The dated capability matrix

The tools this subject wraps ship weekly, rename their binaries, deprecate
flags, change default models, and occasionally kill whole auth tiers. Any
adapter that bakes "tool X supports Y" into its code as a timeless constant
is writing documentation that starts rotting at commit time — with the rot
expressed as runtime argument errors that read like model failures. The
technique: capabilities are **data with a date and a method**, and the
adapter consults the data.

## The rows

Per tool, the matrix answers at least: the headless invocation shape; which
envelope dialect it speaks and where the answer lives
([output-normalization](./output-normalization.md)); whether it supports
schema-constrained output, and how the schema is passed (inline versus
file); which read-only and edit stances exist and which **enforcement
class** backs them ([permission-stance-enforcement](./permission-stance-enforcement.md));
whether prompts can arrive on the input stream; how the model is pinned;
which environment variables flip its billing, and in which **direction**
the auth rule runs ([subscription-auth-selection](./subscription-auth-selection.md));
what the zero-token probe is ([availability-probe](./availability-probe.md));
its known noise signatures; and its known exit-code meanings.

## Every cell carries its witness

A capability claim without provenance is a rumor. Each cell records:

- **the date it was verified**;
- **the tool version it was verified against**;
- **the method**: a live run on a real machine (strongest — it proves the
  behavior, not the documentation), the tool's own help text (proves the
  flag exists, not what it does), or the vendor's published documentation
  (weakest — docs describe the version the vendor wishes you had).

Three-tier verification is not pedantry; the tiers disagree in practice.
Help text has advertised flags whose semantics had already shifted; vendor
docs have described a binary name the installer did not ship; and the most
expensive divergence in recent field history — an entire free auth tier
returning permanent errors despite valid cached credentials — was invisible
to every method except a live run. A cell no method has confirmed is
recorded as **unverified**, and unverified renders as unverified — never
silently as true or false
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## Recomputation is named and triggered

The matrix is a stored derivation, so it names how it is recomputed
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
re-run the verification against the tool's help output and a smoke
invocation. The trigger is the **version**: when the
[availability-probe](./availability-probe.md) reports a version the matrix
has not seen, the affected rows are stale until re-verified — the adapter
may keep serving on the old data, but the staleness is visible, and any
run that fails on an argument error while stale points first at the matrix,
not the model. Comments in adapter code that pin flag semantics carry the
same discipline in miniature: "verified against the tool's help output on
this date" beats a bare flag every time an upgrade breaks one.

## Features declare requirements; the surface follows

The matrix exists so product features can bind to it. A feature declares
the **mode and capabilities it requires** — a structured-report feature
requires schema-constrained output; a repo-audit feature requires a
read-only stance of at least application-level class; a batch generator
requires seat-direction auth — and the surface derives from the
declaration against the matrix:

- **show** the feature when every requirement is met;
- **degrade** it, labeled, when a weaker substitute exists (prose-parse
  ladder instead of native schema output; synthesized read-only instead of
  a real mode) — the label states what was substituted;
- **hide or refuse** when nothing honest remains, with the missing
  capability named.

This inverts the failure mode where every feature independently discovers,
at runtime and in front of a user, what the installed tool cannot do — and
it gives one place where a tool upgrade's consequences are evaluated:
re-verify the matrix, and the features re-derive.
