---
layer: technique
type: technique
subject: zero-budget-channel-planning
technique: grounding-precedence-catalog-over-scan
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled]
shared_with: []
use_when: [assembling the context a channel-plan generator may know about a business, deciding whether a website scan may overrule a catalog, handling a sample or placeholder catalog before it reaches a prompt]
---

# Grounding precedence: catalog over scan

A free-channel plan is generated from what the product knows about the business,
and the product knows it from two sources of unequal standing. The **catalog** is
what the business maintains inside the product: offerings and their categories,
the localities it serves, the competitors it confirmed. The **website scan** is
what a model read off the business's homepage at first run: a one-paragraph
summary, an offering in prose, an audience, a handful of keywords, and a few
guessed competitors. The catalog is the business's own statement; the scan is a
reading of it. The precedence follows: **the catalog wins wherever both know
something, and the scan only ever fills a gap.**

The rule exists to protect two businesses at once. The business that curated a
catalog gets exactly the grounding it would have had before any scan existed - the
scan cannot overrule a maintained fact with a guess. The URL-first business whose
catalog is still empty, who would otherwise get a plan addressed to "your
business" and "your offering", is rescued by the scan filling what the catalog
does not have.

## Procedure

1. **Assemble grounding in one function.** One pure builder takes the catalog
   spine and the applied scan and returns the context the plan may speak from. Two
   copies of "what may ground the plan" is exactly the shape that lets two pages
   describe the same business differently.
2. **Scalars: catalog wins outright.** The offering line is the catalog's category
   list when the catalog has any category, and the scan's offering only when it
   has none. There is no merge of a scalar.
3. **Lists: catalog first, scan tops up.** Keywords are every catalog offering name
   first, in catalog order, then scan keywords the catalog does not already name,
   up to a shared cap. An empty scan leaves the catalog list byte-identical.
4. **Scan-only fields have nothing to lose to.** The business summary and the
   audience come from the scan alone; the catalog has no equivalent.
5. **Bound every field to the wire validator's own limit** so that nothing
   assembled here is silently truncated on the way to the model.

## What never grounds

Grounding is handed to the model as fact, so the technique's sharpest edge is what
it refuses:

- **A sample catalog grounds nothing.** Most projects have never saved a catalog
  and are shown the illustrative seed. A seed row is not a fact about this
  business; when the catalog is the sample, the categories and offering names
  contribute nothing and the scan fills as it would for an empty catalog. The
  seeded *plan's* placeholder fill may still use the sample's category, because
  that plan is labelled a sample on screen while the prompt is not - the same value
  is allowed on the disclosed surface and forbidden on the asserted one.
- **A placeholder row grounds nothing, whichever store it sits in.** The product
  writes starter rows - "sample product A", "sample service B", "main category" -
  so that modules have project-owned data from day one. Those rows are *saved*, so
  a source flag rightly calls them the business's catalog, and yet they are not
  facts. The 2026-08-29 incident is the reason this is a rule: a service business's
  plan came back telling the owner to write an article about "sample service A" and
  to describe his listing with the two placeholder services. The fix matches the
  product's own placeholder vocabulary at the head of a value - a narrow test,
  deliberately, so a renamed row stops matching the moment the owner edits it -
  and matches exact stand-in category names whole, not by substring, so a real
  category that merely contains the word survives. Ordinary words the starter
  happens to use ("services", "subscription") are *not* listed, because grounding
  is not the place to guess; that gap is the argument for giving starter rows real
  provenance rather than a longer denylist.
- **An unconfirmed competitor grounds nothing.** The scan's competitor guesses land
  in the competitor store as unconfirmed entries and are filtered out until the
  owner keeps them. Reading them here would route around that gate and assert a
  guess as one of the business's rivals.
- **A tone of voice grounds nothing here.** It belongs to the voice module, not to
  a channel plan.

## Unavailable is not none

The competitor read can fail. A failed read is not "this business has no
competitors": regenerating on it would silently drop grounding the last plan had,
so the failure is surfaced on the regenerate affordance before the owner overwrites
a grounded plan with an un-grounded one. A business that genuinely has no curated
competitors is owed no warning. The two states are typed apart and never
collapsed, per the law that absence is rendered as absence.

## Decision rules

- When the catalog has any category, use the catalog's offering and ignore the
  scan's, because a maintained fact outranks a reading of it.
- When the catalog is the illustrative seed, ground nothing from it, because a
  seed row asserted as fact comes back as advice about a business that does not
  exist.
- When a value begins with the product's own placeholder marker, drop it from the
  grounding and keep it in the disclosed sample fill, because the two surfaces
  carry different promises.
- When a read fails, say "unavailable" and never "none", because the owner is about
  to decide whether to regenerate on it.

## When not to use

Do not apply the precedence to the *plan itself*: a pinned generated plan replaces
the seeded one as the source of truth by the owner's choice, and that is a
different rule about provenance of output, not of grounding. Do not extend the
placeholder test into a general "does this look fake" heuristic; it matches the
product's own vocabulary because that is not a guess, and a wider net would start
dropping real rows. And do not let the scan's reading of a competitor become
grounding by virtue of being repeated in a later scan; confirmation is the owner's
click, not a second guess.
