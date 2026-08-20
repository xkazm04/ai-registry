---
layer: technique
type: technique
subject: grant-source-landscape
technique: market-readiness-tiering
status: forged
laws: [clean-is-not-ready, hard-gates-precede-soft-scores]
shared_with: []
use_when: [prioritizing which markets to enter, deciding where the product may claim high confidence, planning the source roadmap]
---

# Market readiness tiering

"Which markets should we serve, and how loudly may we promise accuracy
there?" is a data question with an empirical answer, not a market-size
question with a strategic one. The technique: assess every candidate market
on the three data pillars *independently*, by fetching live endpoints, and
tier the market by the shape of what is actually there.

## The three-pillar assessment

For each market, score each pillar on its own axis:

1. **Open-call feed** — is there a structured, refreshable source of live
   opportunities? Key questions: machine-readable or scrape-only; keyed or
   key-free; refresh cadence; row count of genuinely live calls; any
   bot-wall or account-gate in front of the download.
2. **Applicant registry** — can applicants be verified against an
   authoritative register? Bulk or per-lookup; identity only or identity
   plus financials; refresh cadence.
3. **Awarded intelligence** — is there structured history of who funds
   what? Volume, coverage, and whether a published data standard exists.

The pillars do not correlate, and that is the point of scoring them
separately. Real markets land in every corner: one with the world's best
awarded-history standard and a scrape-only opportunity page; a supranational
funder with the best open-call feed anywhere and *no* unified registry; a
small market with both halves structured but a tiny addressable base. A
single composite "data score" would erase exactly the information the
roadmap needs.

## Verification is the assessment

Every cell in the market map is an empirical claim about a living endpoint,
and the map records it that way:

- **Fetch, don't cite.** The verdict comes from live responses — real rows,
  real columns, real counts — not from a portal's marketing page or a
  directory of "open government data". Documentation routinely promises
  feeds that turn out to be award history, stale, or bot-walled.
- **Date every verdict.** Portals change; a map without verification dates
  cannot distinguish knowledge from folklore.
- **Record the failure shape, not just the failure.** "Feed exists but sits
  behind an anti-bot challenge", "bulk download needs a free account",
  "machine-readable but only a fraction of rows are live" are three
  different roadmap items; "no" is none of them.
- **A market verdict names what was checked.** A tier assigned with one
  pillar unexamined is not a tier — coverage of the assessment is part of
  the assessment, or a clean-looking map certifies nothing.

## The tiers

- **Launch-grade**: structured open-call feed AND structured registry, both
  verified and refreshable. Here — and only here — every product pillar
  (what to apply to, are you eligible, who funds this) stands on
  refreshable data, and the product may claim high confidence. This
  intersection is rare; expect a single-digit list.
- **Asymmetric**: one pillar world-class, another missing. Serve the strong
  pillar honestly and plan the weak one explicitly — per-member-state
  verification where no unified registry exists; scraping or research
  engines where opportunities are unstructured.
- **Backbone-carried**: no local structured feed, but a federal or
  supranational backbone already gives every applicant in the market a
  valid baseline. Local sources add depth, not the floor — which is what
  makes scrape-only regions viable at all.
- **Registry-rich, opportunity-poor**: strong for onboarding and
  eligibility, dependent on research-grade discovery for opportunities.
  Fine for expansion, wrong for the flagship accuracy claim.

The registry pillar deserves one emphasis: it feeds the *eligibility gate*,
which is deterministic and precedes all soft scoring. A market without a
usable registry is a market where the hard gate has nothing authoritative to
check against — that caps the trust tier no matter how good the opportunity
feed is.

## Decision rules

- When ranking markets, rank on data richness first and market size second;
  a huge market with no verifiable data is a liability dressed as an
  opportunity.
- When two small markets compete for a roadmap slot, prefer the one with a
  structured open-call source — the scarce pillar decides ties.
- When a market's best feed is machine-readable but bot-walled, tier it on
  what is reachable today and file the wall as the unlock, dated.
- When the product states confidence to users, derive the statement from
  the tier — never claim launch-grade accuracy in a backbone-carried
  market.

## When not to apply

Do not re-tier on every ingest run; the map is a slow-moving strategic
artifact, re-verified when entering a market, when a source breaks, or on a
scheduled review — not continuously. And do not use tiering to *exclude*
low-tier markets from the corpus entirely: the technique governs claims and
roadmap order, while the curated-floor design governs minimum coverage.
