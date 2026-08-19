---
layer: technique
type: technique
subject: legislative-change-tracking
technique: sponsorship-and-rapporteur-roles
status: forged
laws: [provenance-or-nothing, missing-is-not-zero]
shared_with: []
use_when:
  - attributing bill authorship to members
  - identifying who did the analytical work on a bill
---

# Sponsorship and rapporteur roles

"Who is behind this bill" is the attribution question, and it decomposes into
two role families the record keeps separately: **sponsorship** (who put their
name to the bill) and **rapporteurship** (who was assigned to analyze and
report on it). Both are claims about named legislators, so both must come from
the authoritative table with its structure intact — not from whichever column
happens to be populated, and not flattened into an undifferentiated "involved"
set.

## Sponsorship: an ordered signature list, not a set

The authoritative source is the signature table, which carries per (bill,
member): a **rank** (position on the signature list — position one is the
responsible first signatory, the member who answers for the bill) and a
**joined-later flag** (signed at submission versus added to the list
afterward). This structure is the attribution:

- **Rank 1 is authorship; later ranks are association.** A performance
  metric, a profile page, or a news claim that says "sponsored" should mean
  rank 1 or say otherwise. Counting a rank-40 co-signature identically to
  first-signatory responsibility inflates exactly the members who sign
  everything.
- **Joined-later signatures are endorsements of a moving train**, politically
  distinct from submission-time signatures; keep the flag through to the
  surface rather than collapsing it.
- **Dedupe keeps the strongest claim.** Duplicate (bill, member) rows occur;
  keep the lowest rank — the strongest claim to authorship — not the first
  or last row encountered.
- **When rank is missing, fall back to list position and mark the
  fallback** — an inferred rank is weaker provenance than a recorded one.

**Do not trust the bill row's own author column.** Registers commonly carry
an author field on the bill record that is empty for whole classes of bills
(typically recent-term member bills) while the signature table is complete —
or populated only for *other* document kinds (e.g. written questions). Verify
per document kind which table the legislature actually maintains, and
attribute each kind from its authoritative source. An empty author field is
missing data, not "no author" — a bill credited to nobody because the wrong
column was read is a fabricated absence.

Institutional origin is a separate field again: bills originate from the
government, a single member, a group of members, or the upper chamber, and
only the member-origin classes should ever credit individual legislators.
A government bill carries a ministry, not a member — crediting the minister's
seat-holding colleagues from a signature list that happens to be empty-or-not
misattributes the executive's work to the chamber.

## Rapporteurship: several sources, ranked by evidentiary weight

Rapporteur assignments arise in multiple procedural places — designation for
first reading by the steering body, designation by the chamber's presiding
officer, the committee's own rapporteur for the bill, and rapporteurs named
on follow-up documents (committee resolutions). Collect all of them, deduped
per (bill, member, scope, committee), and **preserve the scope**: the
committee-level rapporteur is the strongest signal that a member actually did
the analytical work on the bill; plenary designations are weaker and partly
ceremonial. A flattened "rapporteur: yes" destroys the only granularity that
makes the role usable in performance analysis.

One join trap: rapporteur tables are frequently keyed by **seat identifiers**
(the member-in-term id), not by the person identifier the rest of the graph
uses. Map through the mandate table before attribution — a raw seat id
silently attributes across terms or not at all.

## Decision rules

- **Every attribution carries its source table and role structure** — rank,
  flag, scope. "Member X sponsors bill Y" with no rank is an unfinished
  claim; downstream consumers will harden it into "authored".
- **When two sources disagree** (signature table versus bill-row author
  field), the maintained, structured, multi-row table wins, and the
  disagreement is worth a note — it usually reveals which field the
  publisher abandoned.
- **Cover the whole chamber or nothing.** Sponsorship counts and rapporteur
  workloads are comparative metrics; computing them for a shortlist of
  interesting members is an editorial act dressed as measurement.

## When not to use it

Do not use sponsorship as a proxy for policy influence — committee and
government drafting dominate most legislatures' output, and member
sponsorship measures visibility-seeking as much as work. Do not infer
political alignment from co-signature networks without the joined-later
flag and the origin classes intact; the raw network mixes conviction,
logrolling, and bandwagon signatures. And do not attribute drafting
authorship at all: the signature list records political responsibility, and
who actually wrote the text is not in the record.
