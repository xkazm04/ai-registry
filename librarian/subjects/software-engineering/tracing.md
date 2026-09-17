---
subject: tracing
domain: software-engineering
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# tracing

Touched by [[2026-09-03-awesome-langchain]]. Gained `vocabulary-source-selection`.

## What the gap actually was

A **missing stage sitting between two bundles**, which is why no slug map could find it
and why the instrument reported a near-empty that read like a hole.

Three observability subjects each explicitly defer builder-side emission to this one.
This one requires the span schema live in "one authority" — which is right — and never
entertains that the authority could be an **external published convention** rather than
a house schema. So the decision was made by default because nobody asked, and the forces
were absent from the corpus entirely: portability of dashboards and backends, bought
against the churn of a pre-stable vocabulary whose attribute names move on someone
else's release schedule.

The discriminator is not builder-versus-receiver, which is the proxy the neighbouring
observability technique used. It is **who controls both ends of the version skew** —
which is why an emitter shipped as a *library* pins neither the clients it wraps nor the
backends it feeds, and needs a receiver's multi-generation machinery despite sitting on
the emitting side.

## What a project then added

A civic tree returned `better` and supplied the case the discriminator cannot reach.
Where an unmatched attribute **leaks a value** rather than breaking a query, name-based
matching is fail-open by construction — an attribute spelled differently this version is
one the matcher has never heard of and passes through untouched — so the right answer is
to depend on neither vocabulary and match on value shape instead. That is now its own
section, and the failure directions are explicitly not comparable: an over-redacted
field costs a debugging session, an under-redacted one is disclosed and cannot be
recalled.

The same tree supplied the second decision rule: assert against the package the
application actually loads. Its one borrowed-spelling instrument is calibrated against a
transitive dependency it does not declare, under a caret range on a different package,
so the version can move without a deliberate act while the assertion still passes.

## Open

Nothing owns the emitter-side redaction surface itself — banked as a lead, with a
well-enumerated instance available when that ground is opened.

### 2026-09-17 - `/harvest backlog` wave 6, one technique + one cross-bundle correction

`class-before-inspection`. The subject owned the span model, the capture path and the raw-record viewer, and it never said how an artifact gets CLASSIFIED - only what a sink may then do. The rule: sensitivity is decided from the surfaces, not from an instance. A run record's surfaces are enumerable and all of one kind - free-form content assembled by somebody else's code - so every record of that shape is in the class permanently, including the innocuous ones. **A content scan cannot clear an artifact**, and the reason is structural rather than a matter of scanner quality: it recognises only shapes someone enumerated, so a clean result reports 'none of the shapes we know are present' and is read as 'nothing sensitive is present'. A store that is one scan away from being exported was never governed. Because the class is fixed by shape, everything it governs is a PLACEMENT decision, settled once when the store is created. The write-path consequence is the load-bearing one, and the failure has a specific repeatable shape that is not the door somebody forgot: **it is the door deliberately exempt from the shared path**, a record the server builds from its own facts, which therefore needs no validation, no costing and no admission - and skips the class along with them. Its content is the most likely to be sensitive, because a server-built record of a failure quotes the input that failed. The quieter half, and the part worth carrying anywhere a policy is applied per writer: **the same call that enforces usually writes the receipt.** A door that chose the class also names it in the stamp, so the divergence is invisible afterwards and the one instrument built to catch it reads the door's choice as the owner's policy. The receipt must be written from the same value the enforcement used, by the same function, or it is a forgery with a plausible provenance. On tiering, measured and refused: a tier needs a question the lower tier cannot answer alone, and a DOOR a reader actually meets - a distinct capability, credential or retention job. A tier whose separation exists only in the writer's intention is one store with extra column widths, and adding one without adding a door adds a place to forget the class. A digest tier carries a third burden usually skipped: an unkeyed digest denies nothing, since the same value yields the same token in every deployment and a low-entropy space is simply invertible.
