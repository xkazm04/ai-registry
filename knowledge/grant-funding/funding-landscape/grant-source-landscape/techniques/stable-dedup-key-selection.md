---
layer: technique
type: technique
subject: grant-source-landscape
technique: stable-dedup-key-selection
status: forged
laws: [provenance-per-field]
shared_with: []
use_when: [onboarding a new source into the corpus, designing upsert semantics for repeated ingest, debugging duplicate rows after refresh]
---

# Stable dedup key selection

A funding corpus is not loaded once; it is re-ingested on a cadence, and the
same opportunity arrives again and again — sometimes edited, sometimes with
its status flipped, sometimes from a second source. The corpus stays a
corpus (rather than a growing pile of near-duplicates) only if every row
carries a key that means *this opportunity's identity* and nothing else.
Selecting that key is a per-source decision made once, at onboarding, and
enforced at the ingest boundary.

## The selection ladder

1. **The publisher's own identifier, always, when one exists.** A
   clearinghouse's opportunity id, a portal's topic code, a registry's call
   code. It is the publisher's statement of identity, it survives edits,
   and it usually doubles as the hook for a deterministic public URL — the
   row's provenance in one field.
2. **A composite of identity fields, when no identifier exists.** Hash
   *only* the fields that constitute the opportunity's identity — title,
   issuing body, close date, program code — into a bounded, deterministic
   key.
3. **Never a random fallback, and never the whole payload.** These are the
   two failure modes, and they fail in the same direction by different
   routes.

## The two ways to get it wrong

**Random fallback**: when a record arrives without an id, minting a random
one means the same record inserts a *fresh duplicate on every ingest* — the
upsert machinery is present and permanently bypassed.

**Whole-payload hash**: hashing the full raw record looks safer than picking
fields, but real feed records **mutate between fetches** — status flips from
posted to closed, award figures get corrected, descriptions get edited. Any
byte change changes the hash, so the "key" changes precisely for the
long-lived records that most need to upsert in place. A whole-payload hash
is a random fallback with extra steps and better camouflage.

The rule that avoids both: **identity = the run-invariant fields**. Ask, for
this source, "which fields would still agree if I fetched this same
opportunity next week, after the publisher corrected a typo and the status
advanced?" Those fields — and only those — may enter the key.

## Cross-source discipline

- **Keys are namespaced by source.** Two sources can emit the same raw
  identifier; the corpus key carries a source prefix so adapters can never
  collide. Storage upserts on the namespaced key.
- **One id-space needs one sanitizer.** If composite document ids reserve a
  separator character, every source's key material passes through the same
  sanitizing function — including sources whose identifiers "couldn't
  possibly" contain the separator. Defensive uniformity beats per-source
  reasoning about publisher formats.
- **Deliberate overlap is resolved by precedence, not merging.** When two
  adapters cover the same publisher (a live search plus a bulk nightly
  extract), give them the *same* key scheme on purpose and let the richer
  source upsert over the thinner one's rows. When overlap is accidental
  (a curated floor entry and a live row for the same program), leave both
  under their own source keys — forced cross-source entity resolution on
  fuzzy fields creates more corruption than the duplicate it removes.
- **The key is also the audit trail.** A stable key plus a stored raw
  payload per ingest means any corpus row can answer "where did you come
  from, and what did the publisher actually say" — which is what makes
  every downstream extracted field's provenance resolvable.

## Decision rules

- When a source offers multiple candidate identifiers (an internal id and a
  human-facing code), prefer the one its own detail/lookup interfaces
  accept — the key should open doors, not just distinguish rows.
- When forced to composite, prefer fewer, more-invariant fields; a key that
  occasionally merges two genuinely distinct records is diagnosable, while
  a key that splits one record into many silently inflates the corpus.
- When a downstream capability accepts only one source's id format (an
  enrichment endpoint that takes numeric ids), make the format check
  explicit and **skip** foreign-keyed rows rather than treating their
  rejection as a failure.
- When the key scheme for a source must change, treat it as a migration
  with a mapping table — never let old-key and new-key rows coexist as
  strangers.

## When not to apply

Within a single-fetch, never-refreshed snapshot (a one-off analysis), key
stability across runs is moot — any unique key serves. The technique's cost
is justified exactly by repeated ingest, which is every production corpus.
