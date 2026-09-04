---
subject: settings
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# settings

First touch by `/intake`: 2026-09-04, second pass over a self-hosted markdown
note service, from a row the first pass had left untriaged.

## State

10 → 11 techniques, +1 application (first `node` application on this subject).

Landed: **`presence-decides-precedence`** — precedence between two names for one
setting in a source the application can only read.

## Why it is a technique and not an amendment

`key-registry` already answers a rename, and answers it well: register the new
key, migrate the stored values once at upgrade, retire the old one. The answer
carries an unstated precondition — **the application can write to the store** —
which is always true inside a settings store and false for the large share of
configuration that arrives from an environment block, a mounted file, a command
line or an orchestrator manifest. No upgrade rewrites the operator's compose
file, so the migration step does not exist, both spellings stay live for a grace
period nobody in the process controls, and the only question left is precedence.

`key-registry`'s rule does not survive that, so by the v2 boundary-or-mechanism
test it is a mechanism, and mechanisms get techniques.

## The denial that located it

`cross-source-precedence-chain`'s *When not to use this* closes with: *order that
depends on the value is a policy engine, not a chain.* That is correct, and it
assumes value-dependence is a thing an author **chose**. The finding is the case
where nobody chose it — the author intended to test presence and wrote a test of
value, because `typed-accessors` had already substituted the default and
collapsed unset and set-to-the-default into the same bytes. The chain's rule
names the smell; the mechanism that prevents it is a read that can say "absent"
out loud.

This is the Phase 6 denial hunt working exactly as written: *where a subject
explicitly denies a symmetry, check whether it denied too much.*

## The second half nobody states

A deprecation notice attached to the branch where the old key **wins** is
invisible to the operator who has migrated and still carries a stale line — the
one population that needs to hear it. The notice belongs on the key's
*presence*, in two distinguishable messages, and the two counts are not
interchangeable when scheduling removal.

## The apply, which found a defect with a security half

`goat`, mode `code`, verdict `better`, `ab-paired`, shipped `323b1bd`.

An enrichment health probe resolved `TMDB_API_KEY || NEXT_PUBLIC_TMDB_API_KEY`
while the fetcher it reports on reads only the first, so a public-name-only
deployment got a green health endpoint over a path that threw on every call. The
dual read was 1 of 5 sibling probes in one file, and the file's own doc comment
and error string both already named one key.

The sharp edge: arm A did not merely *report* the public value usable, it
**spent** it in the outbound `api_key` parameter — so a bundle-named variable was
a working way to supply a secret, and the compatibility fallback is what kept it
alive. That makes a rename fallback a security decision whenever the two names
sit on opposite sides of the public/server split.

## Open ground

- No application yet from a tree that has the **single resolver** the technique
  asks for. `goat` was fixed at one call site because it has no configuration
  module at all; the technique's central prescription is therefore asserted and
  not witnessed.
- The two-message notice and the two-count removal rule are likewise unwitnessed.
  A tree that implements them would be the strongest possible application here.

Source note: [[2026-09-04-flatnotes]]
