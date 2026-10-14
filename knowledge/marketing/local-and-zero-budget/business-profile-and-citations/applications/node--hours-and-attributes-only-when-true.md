---
layer: application
type: application
subject: business-profile-and-citations
technique: hours-and-attributes-only-when-true
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@2026.10.14
applied: code
ab_verdict: better
---

# Banning the hours field is not banning the hours claim

A Czech dashboard that generates local landing pages from a service and a locality
was read for where an hours or availability claim could enter published copy. The
project holds no hours or attributes field at all: the structured-data builder omits
opening hours and a test asserts the address key's absence, and the profile import is
read-only. So the technique's field rules have no seam here, and the seam hunt chose
the one place a guessed value could still arrive, free prose.

## The seam, chosen to falsify "the page makes no hours claim"

The generation prompt forbade an address, phone and "opening hours" by name. It said
nothing about the claim that carries the same eligibility without using the word:
"we are available nonstop", "24/7", "weekends", "emergency service". The validator
only rejected hollow fields, so a copy that promised round-the-clock service was
published as-is. A caught outcome would have taught that the field-level ban was
enough; it was not.

## A and B

- A: validator checks headline, intro, cta and two sections present. Five phrasings
  of an availability claim (nonstop, 24/7, continuous, weekend, emergency): 0 of 5
  flagged.
- B: the prompt names the claim, and the validator scans every prose field (headline,
  intro, cta, section headings and bodies, faq) for stems of those phrasings and
  returns a message so the wrapper re-prompts once. 5 of 5 flagged; ordinary copy
  naming only service and locality is not.
- Floor: typecheck and the full unit suite green, the project's pre-push gates green.

## What was not measured

Whether live generations ever produced such a claim before the guard, and how often
the re-prompt now fires. Czech stems were chosen by reading, not from a corpus, so a
phrasing outside the stems passes. The hours and attributes fields themselves have no
seam in this tree; the verdict is about the claim in prose.

Return condition: count re-prompts on the availability message in the project's next
generation log; and the day a project writes hours or attributes to a profile, apply
the two-step attribute handshake there.
