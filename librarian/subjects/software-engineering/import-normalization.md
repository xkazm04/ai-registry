---
subject: import-normalization
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# import-normalization

First touch: [[2026-09-02-1]]. Class: MATURE (6 techniques, 2 applications
node + rust; never swept before, 8 consumer deviations on the floor).

## State

6 techniques, 2 applications (node, rust). No version witness. Golden path
carries an "untrusted input" list that now names three cap axes.

## What run 2026-09-02-1 changed

- `import-validation` gained the section "Absent, null, and empty are three
  different words": a partial-document format declares which spelling means
  *untouched*; the merge tests presence before content; the replace-branch guard
  is "is the key present", never an all-of predicate (vacuously true on an empty
  collection). Anchored on RFC 7396 vs RFC 6902 vs the deep-merge convention.
- `import-validation` bounded-parsing rule gained the **expansion cap** as a
  third axis beside bytes and depth (CVE-2026-45304 as the gap).
- `format-detection` "bytes over labels" gained its condition: the outcome
  selects a parser, not an executable or rendering sink; the web platform's
  no-sniff rule reapplies the moment it would.
- `review-before-commit` and the golden path mirror the presence rule.

## Inbox ruling

The 2026-08-27 lead "empty collection in a patch means not mentioned, never
delete" was landed **restated** — RFC 7396 reads a present empty array as a
wholesale replace, so "empty means untouched" is one dialect's answer. The
mechanism (vacuous all-of, checksum-passed-before-merge blindness, fail-before
proof) is carried as the measured trap without the reporting project.

## Open leads (banked, with return conditions)

- **Proposed law "presence before content"** — a guard over a collection must
  test that the field was supplied before testing what it contains. Sibling of
  failure-not-empty-success ("nothing supplied" vs "supply nothing"). Three
  sightings, one subject. Return on a sighting outside integration.
- **Home-ambiguous technique: partial-document / overlay merge semantics.** The
  same rule for configuration layering, localization overlays and API PATCH
  handlers; landed here as a clause because re-import owns one instance. Return
  when a config-layering or i18n subject exists in this bundle.
- **Application follow-up**: the node application records a merge-sequence
  length cap that IS an expansion cap; tag it against the new clause on the next
  tree read, and check whether the rust side caps alias expansion at all.

## Declines

- A numeric threshold for "defaults favor the probable intent" — a number
  without measurement.
- The JSON deserializer's recursion-limit figure into the rust application — no
  tree read this run, no honest `verified_on` move.
