---
layer: technique
type: technique
subject: tracing
technique: class-before-inspection
status: forged
laws: [one-validation-door, gate-sees-target, unknown-is-not-a-value]
shared_with: []
applied: code
ab_verdict: better
use_when: [deciding whether a captured run record may be exported, attached to a ticket, or kept in a shared location, a scan of stored payloads came back clean and is about to be read as a clearance, proposing to split one record store into tiers by content sensitivity, a digest tier was added to keep correlation without keeping content, a door builds its own record server-side and is exempt from the shared write path, an operator asks what the stored records actually contain]
---

# Class before inspection

A captured record of a run is not sensitive because a scan found something in
it. It is sensitive because of what its surfaces **may** carry, and that is
decided from the surfaces, not from any instance. The surfaces of a run record
are enumerable and they are all four of the same kind: the instruction text that
went in, the text that came back, the arguments of every tool call, and the
environment those calls named — paths, working directories, configuration
values, whatever the caller happened to interpolate. Each of those is free-form
content assembled by somebody else's code. If any of them may carry a secret or
a personal value, then **every** record of that shape is in the secret-bearing
class, permanently, including the ones that happen to be innocuous.

This is the opposite of how the decision is usually made. The instinct is to
look: scan the store, find nothing, conclude the store is clean. That
conclusion does not follow, and the reason is structural rather than a matter of
scanner quality. A content scan can only recognise shapes someone enumerated,
so a clean result reports "none of the shapes we know are present" and is read
as "nothing sensitive is present" — an unknown rendered as a definite value
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A scan
is a volume reducer and a second fence. It is never the classifier, it cannot
clear an artifact, and a store that is one scan away from being exported was
never governed.

## What the class governs, and where it is applied

Because the class is fixed by the shape and not by the content, everything it
governs is a **placement** decision rather than a per-record one: which store
the record lands in, how long that store keeps it, which door reads it, and
whether it may leave — into an export bundle, a ticket, a support thread, a
shared temporary directory, a repository. Those are decided once, when the store
is created, and they do not need to be revisited per record because nothing a
record contains can change its class.

The consequence for the write path is the load-bearing one. The class is applied
at **one door that every writer passes**, and it takes the class from the
artifact's owner — the project, the tenant, the run's configuration — never from
a literal and never from the record
([one-validation-door](../../../../_laws.md#one-validation-door)). The failure
this prevents has a specific and repeatable shape, and it is not the door
somebody forgot to write. It is the door that is **deliberately** exempt from
the shared path: a record the server builds itself, out of its own facts, which
therefore needs none of the validation, costing or admission the shared path
performs — and, in the same breath, skips the class with them. Such a door
reaches the store with a literal in place of the owner's policy, and the record
it writes is the one most likely to carry content, because a server-built record
of a failure quotes the input that failed.

There is a second, quieter half. The same call that applies the class usually
writes the **receipt** — the stamp that says what was done to this record, which
is what an operator reads when asking what the store actually holds rather than
what the configuration says. A door that chose the class also names it in the
receipt, so the divergence is invisible afterwards: the store reports those rows
as an ordinary cohort of the class the door picked, and the one instrument built
to catch exactly this reads the door's choice as the owner's policy
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The receipt must
therefore be written from the same value the enforcement used, by the same
function, or it is a forgery with a plausible provenance.

## When a tier split is worth its cost

The attractive design is three stores instead of one setting: metadata only,
content reduced to digests, and full fidelity — each with its own retention
horizon and its own reader. The framing is right that one knob over one store is
too coarse. The three-store answer does not follow from it, and a tier proposed
without the two tests below is a store with two extra column widths.

- **Name a question the lower tier answers on its own.** If every question
  people actually ask of these records — which version ran, how often, how
  much it cost, which ones failed, whether this one is the same as that one —
  is answered from the metadata tier, then the tier above it is not carrying
  the load and the tier above *that* is carrying all of it.
- **Name the door the higher tier is behind that the lower tier is not.** A
  tier whose separation exists only in the writer's intention is one store. The
  boundary has to be something a reader meets: a distinct capability, a distinct
  credential, a distinct retention job. Adding a tier without adding a door adds
  a place to forget the class, which is the failure above with more surface.

A digest tier carries a third burden, and it is the one most often skipped.
A digest that keeps correlation must **deny recovery**, which an unkeyed digest
does not: it is identical for the same value in every deployment that ever
computes it, so a leaked store's tokens match another store's, and over a
low-entropy value space — a short enumerated answer, a flag, an identifier from
a guessable range — it is simply invertible. The construction is a keyed hash
under a salt held **per store**, which keeps the within-store correlation the
tier exists for and denies both the cross-store match and the dictionary (the
neighbouring
[write-path-sanitization](../../../../operations/governance-and-records/audit-logging/techniques/write-path-sanitization.md)
holds this rule for the business-record case and states its exemption-list
discipline in full).

And one observation worth stating because it reverses the usual design: the
digest that earns its place is almost always a **named digest of one field,
carried in the metadata tier** — a fingerprint of the instruction text, computed
by the producer over the thing it actually rendered, declared exempt from the
scrub because it is not content. That is what answers "which one ran". A digest
of the whole payload, standing as its own tier, answers "did this payload
change", which is a question nobody turns out to ask; the common end state is a
tier with a writer, a test and no reader, which costs the write, forfeits the
debugging session, and still stores a correlatable token.

## The test is a pair, and the halves pull against each other

One assertion cannot check this, because the rule is satisfiable by
over-correction. Assert both, on the same path:

- **Separate when the class moves.** An owner whose class says payloads are not
  persisted gets a record with no payload — through *every* door, named
  individually, including the server-built one. An owner whose class says
  digests gets a digest and no plaintext.
- **Agree when the class does not move.** An owner whose class says payloads are
  stored gets them verbatim, and every non-payload field — identity, parentage,
  accounting, outcome, provenance, the metadata tier's own fingerprints — is
  identical under all three classes.

The first alone is passed by refusing the door or stripping every payload
unconditionally. The second alone is passed by changing nothing. Together they
are passed only by applying the owner's class, which is the claim.

One more check belongs beside them, because a suite can be green and blind. Put
the literal back in the exempt door and run the whole suite: if nothing but the
new test goes red, the number that suite reports is the coverage of the shared
path alone, and every door outside it is unmeasured.
