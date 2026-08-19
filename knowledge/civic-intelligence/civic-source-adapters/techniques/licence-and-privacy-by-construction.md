---
layer: technique
type: technique
subject: civic-source-adapters
technique: licence-and-privacy-by-construction
status: forged
laws: [provenance-or-nothing, lead-not-finding]
shared_with: []
use_when: [before mirroring a bulk registry export, ingesting records that name natural persons, choosing which fields an adapter may extract]
---

# Licence and privacy by construction

Open government data is open with strings attached, and the strings attach at
*acquisition*, not at publication. A bulk registry export may be free for
non-commercial reuse only; officer records may carry birth dates and home addresses
whose mirroring makes the recipient a data controller under privacy law; a
court-notice feed may name private individuals who are parties, not public figures.
The technique is to resolve these obligations **before the first byte is mirrored**
and then compile them into the adapter's structure — what the code *can* extract —
rather than leaving them as policy a future caller must remember.

## Licence resolution is part of source onboarding

For every new source, before any bulk fetch:

1. **Find and read the actual terms** — the licence document the publisher ships,
   not a summary. Public-sector terms are often a PDF two links deep; read it
   anyway.
2. **Log the terms at the adapter boundary**: the licence name and document, the
   date read, the conditions that bind (non-commercial only, attribution wording,
   share-alike, no-redistribution of raw dumps), and the consequences accepted
   (e.g. "mirroring this file makes us a controller of the personal data inside
   it"). This note is the acquisition half of
   [provenance-or-nothing](../../_laws.md#provenance-or-nothing): a published
   claim must cite its source, and the citation is only honest if the source was
   lawfully held and its conditions are on record.
3. **Propagate conditions to the surface.** Attribution requirements and reuse
   restrictions belong in the rendered page's source line, not only in the
   adapter's header.

A licence conflict discovered after a mirror exists is an incident; discovered
before, it is a design input — maybe the answer is targeted single-record fetches
instead of a bulk mirror, or the modern API instead of the archive.

## Privacy is enforced by what the adapter refuses to extract

The load-bearing move: encode privacy doctrine in the extraction code itself.

- **Purpose-bind sensitive fields.** If a birth date is needed only as an
  identity-matching key — to confirm that the registry's officer and your roster's
  person are the same human — then the adapter extracts it *into the comparison*
  and never into a stored narrative field. The function signature makes the
  narrative use impossible, which is stronger than any code-review rule.
- **Distinguish public-role facts from private-life facts.** A person's seat,
  directorship, declared conflict, or public contract is the subject matter; their
  home address, family, or health never is — even when the source publishes it.
  Sources over-publish; the adapter's field list is where your own scope rule
  becomes real.
- **Private persons in public feeds get the strictest reading.** Court and
  insolvency feeds name individuals who are not public figures. Extract the
  join keys the pipeline genuinely needs (case identifiers, organization
  identifiers, statute citations) and leave natural-person identification of
  non-public figures out of the graph entirely.
- **Name-coincidence is not identity.** A sensitive attribute must never be
  attached to a person on a name match alone; the match is a candidate for
  stronger corroboration, per
  [a machine result is a lead, never a finding](../../_laws.md#lead-not-finding) —
  and mis-attaching a registry record to the wrong same-named person is a privacy
  harm *and* a defamation risk in one move.
- **Retention follows purpose.** Data held only for matching can be dropped or
  hashed once the match is adjudicated; a mirror kept "in case" is a liability
  with no owner.

## Decision rules

- When a source offers a full mirror and a targeted lookup, and the obligations
  differ, take the *narrowest acquisition that serves the actual job* — a
  one-company, one-year file instead of a multi-gigabyte historical mirror, until
  the broader need is real and its obligations are re-assessed.
- When licence terms and product plans conflict (non-commercial licence, possibly
  commercial future), surface the conflict to a human decision *now*; do not build
  on the ambiguity.
- When in doubt whether a field is a public-role fact, treat it as private until
  argued otherwise in writing. The asymmetry is the same as everywhere in this
  subject: a missing field is a disclosed gap; a wrongly published one is a harm.

## When not to use this

There is no situation where the licence check is skippable, but there is a scope
boundary: this technique governs the adapter's acquisition and extraction. What
downstream analysis may *conclude* about public figures, and how findings are
published responsibly, are separate subjects — the adapter's job ends at ensuring
nothing enters the pipeline that the pipeline is not entitled to hold.
