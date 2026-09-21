---
layer: application
type: application
subject: mcp-tools
technique: catalog-projection-modes
stack: claude-code
verified_on: 2026-09-20
verified_against: claude-code@2.1.263
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Seventy capabilities in a standing prefix, and the selector that does not pay

A harness installs capability packages as directories, each carrying a front-matter
`description` that is published into the model's standing prompt so the model can
decide when to open the package body. The listing is the catalog; the bodies are
loaded only on selection. The version is witnessed by the harness's own release
pin recorded in this registry's operating memory rather than by a lockfile, since
the harness is installed as a global CLI and the checkout carries no dependency on
it.

This is the description-only catalog the technique's second-budget section was
written for, and it exists here at a size where the face-value argument is
tempting: an enumeration of every `SKILL.md` reachable from the user-level
capability root found **70 packages publishing 40,003 characters of name and
description, about 10,001 tokens**. That block sits in the stable prefix of every
session the harness starts.

## What A and B were

Three placements were priced with the break-even arithmetic this bundle already
carries for transcript compaction, in base-price token-equivalents per turn, with
`r` the cache read multiplier and `w` the cache write multiplier:

- **A** — the listing stays in the prefix: `prompt × r`.
- **B1** — a per-request selector rewrites the listing in place: `(prompt − listing) × w + sel × w`.
- **B2** — the listing is deleted from the prefix and one selected description is
  injected last: `(prompt − listing) × r + sel × w`.

`sel` was set to 150 tokens, the mean description length in the measured set. The
scan swept `prompt` over 20k–400k, `r` over 0.05–1.0 and `w` over 1.0–2.0.

## What was read

**The target — per-turn prefix cost — moves, and by less than a tenth of what the
face-value argument claims.** At `r = 0.1`, `w = 1.25`, B2 saves **813
base-units per turn**, flat across every prompt size tested: a fixed block removed
from a prefix yields a fixed discount, and the discount does not grow with the
conversation. The face-value argument quotes 10,001.

**B1 loses everywhere a cache exists.** At a 100k prompt it costs 112,686 against
A's 10,000 — an eleven-fold per-turn penalty, and the penalty grows with prompt
size because the rewritten region is everything downstream of the listing's
offset. Across the whole swept space B1 won in exactly one regime: `r = 1`, which
is to say no prefix cache at all. That degenerate corner is the discriminator the
technique now states, and it is the only place the naive arithmetic is correct.

**The floor falls, and it is the floor the catalog exists to hold.** Arm A's
capability reach is exact — every package is named, so the model can reach all 70.
Arm B2's reach is the selector's, and the only published figure for a selector at
this catalog scale still mis-picks on the order of one turn in fourteen. A target
that moved 8% of A's cost against a floor that gave up several points of
capability reach is **not-better** under this registry's two-number rule, whatever
the target says.

## The structural fact

The measurement was taken to decide whether this registry should gate its own
capability catalog behind a selector. It should not, and the reason is a property
of where the catalog sits rather than of how large it is: **the tokens a standing
catalog occupies are the only tokens in the prompt that are already discounted,
already stable, and already paid for once.** Every other region of a long session
— the transcript, the tool results, the file bodies — is either volatile or
growing. Optimizing the one fixed, cached, cheapest block while leaving the
growing ones alone is backwards, and nothing in the harness was designed to make
that true; it falls out of the prefix cache's own pricing.

## What this realization cannot do

The scan prices placements; it does not measure a selector. The one-in-fourteen
miss rate is a published figure for a comparable catalog size, relayed rather than
reproduced here, and it is the weakest number in the comparison. A selector
measured on this registry's own capability set could move the floor in either
direction, and the return condition for revisiting this row is exactly that
measurement. The scan also assumes the listing sits upstream of the transcript,
which is true of this harness and is not a protocol guarantee.
