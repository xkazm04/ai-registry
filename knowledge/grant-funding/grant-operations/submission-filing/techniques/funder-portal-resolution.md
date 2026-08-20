---
layer: technique
type: technique
subject: submission-filing
technique: funder-portal-resolution
status: forged
laws: [honest-null-over-forced-guess, never-fabricate-a-figure]
shared_with: []
use_when: [linking a queued submission to its filing destination, deciding whether a derived URL is safe to render, merging crowd-reported portals with derived ones]
---

# Funder portal resolution

The technique answers one question per queued submission — *where does this
application actually get filed?* — under a hard constraint: a wrong answer is
worse than no answer. A fabricated or guessed portal link sends an applicant
to the wrong door, often discovered with hours left before a deadline. So
resolution is a strict preference ladder where every rung must be *earned*,
and the bottom rung is an honest null rendered as a "search the funder's site"
hint — never a link the system cannot stand behind.

## The preference ladder

1. **Crowd-verified portal, when trusted.** The URL organizations actually
   used to file with this funder, taken from the aggregated filing profile —
   but only when the profile's confidence clears the sample-size floor. A
   single report does not override anything; it waits for corroboration.
2. **Deterministically derived URL.** Some sources expose a stable public
   detail page keyed by the opportunity's own identifier. Where the
   identifier's *shape* proves the derivation holds, construct the URL
   mechanically. This rung is pure computation: no network call, no search,
   no inference — same identifier, same URL, every time.
3. **Honest null.** Everything else. The caller renders a hint that tells the
   user to locate the portal themselves, and says so plainly.

The ladder never includes "search the web for the funder's name and take the
top hit" or "ask a model to recall the URL." Both fabricate; recall of URLs
from a model is a figure invented under another name.

## Procedure

1. **Prove the derivation before constructing.** A derived URL is valid only
   for identifiers matching the source's canonical shape (e.g. the numeric
   native key). Records ingested under fallback or synthetic identifiers fail
   the shape test and get no link — the shape test is the proof that the
   public page exists. Honor an explicit source tag when present; infer from
   identifier shape only when the shape is unambiguous by convention.
2. **Keep resolution pure.** The resolver takes the record's fields and
   returns a URL or null, with no I/O. Purity is what makes it safe to call
   per row during render and trivial to test against the shape rules.
3. **Layer the crowd override on top, not inside.** The deterministic
   resolver stays ignorant of crowd data; a separate preference function
   consults the filing profile first and falls back to the resolver. This
   keeps the trust decision (is the crowd sample big enough?) in one place.
4. **Re-validate crowd URLs at the render boundary.** A crowd-contributed URL
   is untrusted text that will become a clickable link. Require an http(s)
   scheme at *both* the write boundary and every read boundary — stored
   values may predate the write-time guard, and a script-scheme URL in an
   anchor is an injection, not a portal.

## Decision rules

- **When the identifier fails the shape test, return null, because** a link
  constructed anyway points at a page that does not exist — or worse, at a
  different opportunity's page.
- **When the crowd profile is low-confidence, ignore it entirely rather than
  blending, because** a single filer's URL may be their org's SSO entry
  point, a staging portal, or simply wrong; blending averages truth with
  noise.
- **When both crowd and derived URLs exist and disagree, prefer the trusted
  crowd URL, because** the derived URL is the opportunity's *listing* page
  while the crowd reports where filing actually happened — often a separate
  application system the listing merely points to.
- **When rendering the null case, say what the user should do, because** a
  blank cell reads as a system failure; "search the funder's portal for
  opportunity ⟨id⟩" reads as honest scope.

## When not to use this

Do not build portal resolution as a scraping or search subsystem to close the
null cases. The nulls are the honest report of what the data supports; the
durable fix is capturing real portal URLs at ingest (a schema investment) or
from filers (the crowd profile), not a heuristic that manufactures links. And
do not apply the ladder to destinations that carry no risk of misdirection —
internal navigation needs no proof, only external filing doors do.
