---
layer: application
type: application
subject: accountability-publishing-ethics
technique: real-vs-illustrative-form-encoding
stack: react
status: forged
verified_on: 2026-08-30
verified_against: react@19
---

# Real-vs-illustrative form encoding — Politicas display primitives

Politicas (Czech parliamentary accountability, Next.js/React) encodes the
real/illustrative distinction — and the adjacent honest-outage states — in
component variants rather than captions. The doctrine is written in
`docs/DESIGN.md:92-131` ("Evidence-first — the brand rule") and enforced by
three primitives.

## StatTile: the variant carries the claim

When a strip mixes computed figures with sample ones, DESIGN.md states the
operating insight directly: **"the citation line is the first thing a
skimming reader drops — so the difference also carries in the FORM."**
`StatTile`'s `variant="illustrative"` moves the tile to the `paper-strong`
surface, gives it an `ochre` edge and tag, and renders the numeral in `steel`
rather than full-strength `ink`. A skimming reader perceives a different kind
of element before reading a word. The variant is declared at the call site;
an unmarked sample is treated as the same defect class as an uncited number.

## LiveDataNotice: page-level escalation, and the outage framing rule

Per-tile labels do not survive a whole-store outage, so the page-level rule:
when live data is unreachable, `LiveDataNotice` says it **once, at the top of
the page** — because "a page of demo figures must never read as an editorial
choice when it is actually an outage." The reader's model of the page is set
at the top; the notice sets it truthfully.

The sibling rule for *detail* pages shows why named entities get no
illustrative fallback at all:
`features/shared/components/DataUnavailable.tsx:1-14`. The embedded store is
single-connection; when a second process holds it, every server loader
degrades to null. List surfaces fall back to their labelled mock — but a
detail route calling `notFound()` would tell the reader "tento poslanec
neexistuje" ("this MP does not exist") when the record exists and the
database was merely busy — "a false statement, which the brand rule forbids
as much as any fabricated number." Detail routes therefore render an honest
unavailability component with HTTP 200 and reserve 404 for genuine absence.

## SourceNote: the citation is the real half's form, so it must be legible

The real variant's marker is its readable citation, and DESIGN.md records the
incident that hardened it: an audit (2026-07-29) found `SourceNote` set in
`text-[11px] uppercase tracking-widest text-steel` — 4.11:1 contrast,
sometimes 10px, letter-spaced caps on runs up to 115 characters. The style
rule had classified by *role* ("tracked caps only for meta") and a
sentence-length citation in a label's clothes passed it. The fix: **"a
citation is typeset by its length"** — ≤48 chars stays a tracked label,
anything sentence-shaped is set in sentence case, both at 12px in an
AA-contrast tone — and `SourceNote` **enforces this itself** by measuring its
own children, so all 158 call sites were fixed by one change and no caller
can get it wrong by judgment. Two deliberate meta-rules ride along: there is
**no second citation primitive** (an earlier `Citation.tsx` draft was killed
because two names for one idea guarantee drift), and call-site overrides like
`className="!text-[10px]"` are removable defects — two existed on the
landing page and were deleted.

## The transplantable shape

For any React design system: (1) make illustrative a first-class variant of
the figure primitive (surface tone + edge + tag + subordinate numeral), never
a caption-only state; (2) add a page-level outage notice component so
degradation is announced where the reader's mental model forms; (3) on
named-entity detail routes, replace not-found fallbacks with an explicit
unavailability component and reserve 404 for true absence; (4) push
legibility rules *into* the citation primitive (measure and self-select
typography) instead of trusting call sites; (5) keep exactly one primitive
per claim-bearing idea.
