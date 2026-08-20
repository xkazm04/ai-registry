---
layer: technique
type: technique
subject: jurisdiction-modelling
technique: market-claim-truthfulness
status: forged
laws: [never-fabricate-a-figure]
shared_with: []
use_when: [writing or reviewing any user-facing statement about which markets are covered, deciding what an applicant in an unsupported market should see, a roadmap or coverage list disagreed with the live profile set]
---

# Market-claim truthfulness

Every public statement a grants product makes about *where it works* — the
landing-page coverage band, the onboarding country picker, the "coming soon"
roadmap, the market count in a pitch — is a claim applicants act on. An
organization that onboards into a market the product only appears to support
gets the worst possible outcome: another jurisdiction's eligibility law,
currency, and document checklist applied to it with full interface
confidence. The technique makes coverage claims structurally unable to drift
from reality by deriving every one of them from the jurisdiction profiles.

## One source, every surface

The profile set is the only authority on coverage. Derive from it:

- **The supported-market list** — profiles with `supported: true`, rendered
  with names, regional breadth, and a per-market coverage blurb.
- **The roadmap** — a small hand-ordered list of announced markets, filtered
  *at render time* against the profile set so a market that ships is
  automatically dropped from "coming soon". A graduated market lingering on
  the roadmap is the mirror-image lie of an unshipped one on the coverage
  band; the filter makes the first impossible and profile derivation the
  second. The only manual upkeep left is deleting the graduated entry's
  blurb, and even that lag cannot reach users.
- **The onboarding picker** — the same list that drives the coverage band,
  so the two cannot disagree about what the product covers.
- **Any market count** — computed, never typed. And computed over the
  *countries-only* view: a supranational body is never counted as a peer of
  a nation, because its member states already carry its corpus through
  membership and the double-count inflates coverage with true-looking
  arithmetic.

## Supported means fully operational

`supported: true` is a high bar, and the technique's honesty depends on the
bar being real: the market's funding sources are wired, its verification
sources work, its currency and drafting language are live, its document set
is in the checker. A profile flipped to supported because "the data model is
ready" converts every derived claim into the exact lie the derivation was
meant to prevent. Flip the flag in the change that completes the last
operational piece, not before. Where live opportunity breadth is still
gated (a feed awaiting enablement), the market may still count as supported
only if the experience degrades honestly — an empty-but-truthful matches
state, never another market's data as filler.

## The unsupported market gets a real surface

An applicant from an unmodelled jurisdiction is not an error case; they are
a future market telling you demand. Give them a dedicated surface that:

1. **States the boundary and its reason** — eligibility is set by each
   country's laws and registries, so markets launch one jurisdiction at a
   time. The reason matters: it converts "this product is incomplete" into
   "this product takes my country's law seriously".
2. **Names what is actually covered today**, drawn from the same derived
   list as everywhere else.
3. **Collects the waitlist**, tagged with the requested market — the
   expansion roadmap's best prioritization signal.
4. **Never falls through to a default market's experience.** The
   fallthrough is the whole failure: the notice exists precisely so that no
   organization is silently served another jurisdiction's law.

## Decision rules

- **When marketing wants to name a market before its profile is live, ship
  it on the roadmap list, because** "announced" is a truthful claim with its
  own slot, and the render-time filter will promote it automatically the day
  it actually ships.
- **When a coverage sentence needs a number, call the counting function in
  the code that renders the sentence, because** a number typed into copy is
  stale the day after the next market ships.
- **When a claim is geographic ("N countries", "where you can incorporate"),
  use the countries-only list; when it is a picker or a per-market page, use
  the full list including supranational entries, because** the correct
  universe differs by claim type and each call site must choose knowingly.
- **When a market is supported but a data feed is temporarily gated, say so
  in-product rather than backfilling with adjacent-market data, because**
  a visible gap is recoverable trust and a silent substitution is not.

## When not to use

Internal dashboards and operator tooling may show unfiltered profile state —
including unsupported and half-wired markets — since their audience needs
the machinery, not the claim. And the technique governs *coverage* claims
only; claims about outcomes (win rates, funded totals) are governed by the
domain's statistical-honesty rules, which this technique does not replace.
