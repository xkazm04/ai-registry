---
layer: technique
type: technique
subject: positioning-and-pricing-transparency
technique: state-support-level-not-parity
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled]
shared_with: []
use_when: [designing the "works with" strip on a landing page, listing integrations or channels anywhere in public copy, writing a proof line on a hero]
---

# State the support level, not parity

A row of channel or integration names implies that each is supported to the
same degree; the reader supplies "equally" because the layout offered nothing
else. When support is tiered - one channel synced live, one given copy
checks, two used only for publishing - the honest surface says the level
beside each name, in a short vocabulary the whole site reuses, so that no
reader infers parity that was never claimed.

The same rule governs proof lines: a line on the hero is read as present
tense, so it states only what is true today, and a commitment that does not
yet work is stated as a commitment with a status, never as a proof.

## Procedure

1. **Enumerate the surfaces that list things the product works with**: hero
   strip, pricing feature lines, FAQ answers, comparison pages, app store
   descriptions. Each is a support-level statement in disguise.
2. **Define the level vocabulary once.** Three or four terms: for an ad
   product, "live sync" / "ad-copy checks" / "publishing"; for a data product,
   "read and write" / "read only" / "export". Short enough to sit in a pill;
   distinct enough that no two levels are read as one.
3. **Attach the level to the name on every surface**, in the same words. A
   reader who learns the vocabulary on the hero recognises it on the pricing
   page.
4. **Derive the levels from what the code actually does**, and keep the list
   next to the surface with a comment stating the levels in prose, so the
   next editor cannot promote a channel by moving it in the array. How a
   derived list is built from a registry belongs to
   `honest-proof-and-illustrative-data`; the rule here is that the level is
   never hand-typed apart from the capability.
5. **Audit the proof lines.** For each: is it true this afternoon? "Free
   during validation, no payment gateway wired" is a present fact. "Runs on
   your own machine" is a commitment until a production build does so; it
   gets a status chip ("in preparation, not functional yet") and lives in a
   commitment band, not the proof list.

## Decision rules

- When two channels differ in what the product can do with them, they get
  different level words, because a shared pill is a parity claim
  ([provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled)).
- When a level word would be true only after a planned release, the channel
  is listed at its current level or not at all, because a future level on a
  present-tense surface is an invented proof
  ([never invent proof](../../../_laws.md#never-invent-proof)).
- When a proof line describes a licence or an architectural intent rather
  than a working path, move it to a commitment band with a status, because
  "open" and "self-hostable" are read as things the buyer can do today.
- When the vocabulary grows past four words, the levels are not levels but
  descriptions; collapse them and put the detail in the FAQ.

## Why a logo wall fails even when every logo is true

The wall does not lie about any single item. It lies about the relation
between items, and that relation is what a buyer uses to decide whether the
product covers their stack. A buyer whose spend is on the copy-checked
channel reads the wall, assumes live sync, and discovers the difference after
connecting - which is the worst moment, because it turns a support-level
question into a trust question. The pill-with-level costs a few characters
and moves the discovery to the first screen.

## When NOT to use

- A product whose support is genuinely uniform - every listed channel gets
  the same treatment - can show a plain list; a level word on each would be
  noise.
- Partner and marketplace listings whose format is fixed by the host and
  admits no per-item annotation; state the levels in the description text
  instead.
- Internal architecture documents, where the level is expressed in code and
  the reader is an engineer; this technique is about what a buyer reads.
