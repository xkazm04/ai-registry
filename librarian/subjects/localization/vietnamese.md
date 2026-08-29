---
subject: vietnamese
domain: localization
last_touched: 2026-08-29
touched_by: external-reconcile
dry_streak: 0
---

# vietnamese

First touch. External-reconcile wave 1, class B.

**Pin.** `unicode-org/cldr@release-48-2`, with releases 40–47 and `release-49-alpha1`
fetched for the history sweep. File: `spec--classifiers-and-quantity.md`.
**Fate: refuted, split verdict.**

## Sightings

- **Cardinals: the technique is CORRECT for every shipped CLDR.** `vi` is
  single-category `other` in 48.2 and identically back to release-40. The director's
  pre-check had read `main` and was wrong about released data. The worker's own framing
  is the one to keep: *the disagreement was a pin, not a fact.*
- **A dated expiry on that half.** Commit `069851d38244` (2026-04-12), PR #5569, ticket
  CLDR-14273, moves `vi` into the `one: i = 0 or n = 1` group — shipping in CLDR 49,
  which today exists only as alpha. The same commit moves `vi` in `pluralRanges.xml`.
- **Ordinals: refuted outright, and always were.** `vi` has carried an ordinal `one`
  since **CLDR 21 (2012)**. No release ever had single-category `vi` ordinals. A
  decade-old error, not a currency lapse — and the technique's own closing section
  already names the reason (`thứ nhất`, not `*thứ một`) without connecting its two halves.
- **The sharpest finding is semantic.** The CLDR commit ships minimal pairs in which the
  counted noun `mặt hàng` is **identical in both branches**; the only difference is the
  anaphoric pronoun — `nó` (it) versus `chúng` (them). So the new category is **not
  plural morphology arriving in Vietnamese**; the technique's linguistic claim survives
  whole. It is sentence-level anaphora routed through the plural selector, and it bites
  only in strings long enough to refer back to what was counted.
- `one` includes zero (`i = 0 or n = 1`), so a `one` string must read correctly at a
  count of 0 — the same trap [[bengali]] already documents for `bn`.
- Harness: 414 samples over 10 configurations, 0 fails, with degenerate controls that
  fail as required — always-`other` scores 21/22 on `vi` ordinals, missing exactly
  integer 1, which is precisely the gap a catalog built on the technique has shipped.

**2026-08-29 — LANDED (measured disproof).** The ordinal claim and the
back-reference split test corrected in `techniques/classifiers-and-quantity.md`, and
the same claim corrected in `vietnamese.md` (opening + the number section, which was
retitled). The CLDR 49 cardinal expiry is recorded in both. Original record below stands.

## Technique-edit candidates — MEASURED DISPROOF, lands alone

- `techniques/classifiers-and-quantity.md` **L14–16** (the "for both cardinals and
  ordinals" claim), **L25–27** (the split test should be *back-reference present?*, not
  *plural block present?*), **L88–90** (ordinals do reach the plural selector).
- Golden path `vietnamese.md` **L19–20**, **L74** (heading), **L76–77** — the same claim
  in three more places.

## Cross-subject proposals

- **The corpus does not contradict itself today** — refuted as the director stated it.
  `bengali` and `vietnamese` are both correct at 48.2; they collide only when CLDR 49
  ships. When the correction lands, cite bengali's already-written treatment of the
  identical rule rather than re-deriving it; the zero-in-singular guidance transfers
  unchanged.
- **A CLDR plural category can encode downstream anaphora rather than noun morphology**
  — 1 sighting. Worth watching for in the other classifier languages (`th`, `zh`, `ja`,
  `ko`), whose subjects likely carry the same "one category, trivial plurals" framing.

## Could not verify

Why the committee added the category — CLDR-14273 lives on the Unicode Jira and the PR
body carries only the ticket ID. The rationale is inferred from the shipped minimal
pairs, and the application says so.
