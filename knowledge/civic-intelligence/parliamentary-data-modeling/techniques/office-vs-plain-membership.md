---
layer: technique
type: technique
subject: parliamentary-data-modeling
technique: office-vs-plain-membership
status: forged
laws: [one-definition-one-import]
shared_with: []
use_when: [ingesting role/function tables, modeling chairs and speakers, making "who was in body X on date D" one lookup]
---

# Office vs plain membership

Legislatures record two kinds of belonging: **plain membership** (a person
sits in a body) and **held office** (a person holds a named position — chair,
vice-chair, speaker — which itself belongs to a body). Publishers typically
export them through one relationship table with a discriminator flag, but the
flag changes what the foreign key *points at*: a membership row references
the body directly, while an office row references a **position registry**,
and only the position knows which body it belongs to. Left as published,
every "who was in body X" query is a conditional two-hop join that half the
consumers will write wrong.

The technique: **resolve both shapes to the same body key at ingest**, keep
the office detail as additional columns, and make the store answer
belonging questions with one indexed lookup.

## The resolution pass

At ingest, for each relationship row:

1. Read the discriminator. Plain membership → the target id *is* the body
   id; copy it into a `body_id` column.
2. Office → look the target up in the position registry, take the position's
   owning body id into the same `body_id` column, and denormalize the
   position's name and type onto the row.
3. Keep the raw target id too — provenance and re-derivation want the
   publisher's original reference.

The result is one table where `body_id` is always the body, `kind` says
member-or-office, and the office columns are null for plain members. "Which
club was this member in on date D" and "who chaired this committee on date
D" are now the same one-hop query with different predicates. This is
[one-definition-one-import](../../_laws.md#one-definition-one-import)
applied to a join: the position-to-body resolution is performed once, in
reviewable ingest code, instead of being restated — divergently — inside
every consumer that touches belonging.

## An office is not a substitute for membership

Model them as coexisting windows, and expect the publisher to be
inconsistent about it. Some registries emit both rows for a chair (member
since January, chair since March); others emit only the office and imply the
membership. Decide one representation and normalize toward it at ingest —
the safe choice is "office implies membership for containment queries, but
membership rows are never synthesized", so headcounts read `kind = member`
where the publisher is dual-row, and read `distinct person` where it is not.
Whichever convention holds, write it down next to the ingest code; a
headcount that silently double-counts chairs is a small lie repeated in
every table.

Chamber-level offices (speaker, deputy speaker) and government offices
(minister, head of government) deserve first-class treatment even when the
analysis is about the floor, because office windows are the deterministic
input for role-window mismatch detection in per-member scoring (see
[mandate-vs-person-identity](mandate-vs-person-identity.md)): a member whose
floor numbers collapse the month they took a ministry is exhibiting the
office, not a work profile.

## Decision rules

- When ranking influence, weight by office type from the denormalized
  columns (chair > vice > member) — the weights themselves defined once,
  imported everywhere.
- When the position registry is missing an entry the relationship table
  references, the row keeps its raw target and gets a null `body_id` plus a
  counted disclosure — never a guessed body.
- When two office windows for one person in one body overlap (promotion
  recorded before the old role closed), keep both; office overlap is
  usually publisher lag, and belongs in the validity counters, not in a
  silent merge.

## When not to flatten

If the position registry carries rich structure of its own — salaries,
appointment procedures, statutory powers — it stays a first-class table and
the denormalization is a projection, not a replacement. Flattening is for
the belonging query; it must never become the only place office data lives.
