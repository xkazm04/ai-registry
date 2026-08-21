---
layer: technique
type: technique
subject: eligibility-analysis
technique: geographic-scope-gating
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess]
shared_with: []
use_when: [gating opportunities by territory in a multi-country corpus, an applicant passed a foreign national programme, deciding how prose place-name matching may refine a structured gate]
---

# Geographic scope gating

The geography gate asks whether the applicant sits inside the opportunity's
territorial scope. The trap that defines this technique: **prose is
territorially ambiguous by construction.** "National programme" reads
identically in every country's listings; without a structured country on each
opportunity, a text heuristic happily passes an applicant into another
country's national scheme, and the corpus leaks cross-border silently. The
technique layers a structured, authoritative country gate over prose
refinement — never the reverse.

## The two-layer design

1. **Structured gate first (authoritative).** Each opportunity carries a
   country (standard two-letter codes, plus a marker for supranational
   programmes) and a scope tier (local / regional / national /
   international). The applicant's country derives from its declared
   jurisdiction. The gate:
   - same country → **pass**;
   - supranational opportunity → pass iff the applicant's country is in the
     member set (a maintained set, not a heuristic), else **fail**; an
     applicant onboarded *at* the supranational level is same-territory by
     definition;
   - explicitly international scope → **pass** for anyone;
   - different countries otherwise → **fail**;
   - no structured country on the row (legacy or sparse ingest) →
     **unknown**, deferring to the prose layer. Unknown is not fail: a
     missing stamp is the ingest pipeline's debt, not the applicant's.
2. **Prose refinement second (pass/unknown only).** For rows the structured
   gate passed or left unknown, match the applicant's city, region and
   region abbreviation against the listing text to *sharpen* the answer
   ("targets your area" beats "open in your country"). The prose layer may
   upgrade an unknown to a pass and may add specificity to a pass; it must
   never produce a fail, and it must never overturn a structured fail — its
   evidence class is below gate grade.

## Prose matching craft

Place names are hostile input for substring search, and every rule here was
paid for somewhere:

- **Whole-word matching, with the needle regex-escaped** — short place names
  embed in ordinary words (a town name inside a common noun), and place names
  legally contain regex metacharacters (abbreviated saints, dotted
  abbreviations).
- **Minimum needle length** — a one- or two-letter fragment word-matches
  stray tokens; require at least two characters before matching at all.
- **Region abbreviations match case-sensitively against original-case
  text** — lowercase English words collide with uppercased region codes
  ("or", "in", "me"); the abbreviation earns a match only as written
  uppercase in the source text.
- **Report the granularity that matched.** A region-level match must not be
  narrated as city-level targeting; claiming "targets your city" off a
  region-wide keyword is false specificity that erodes trust in every other
  detail string.
- **Membership floors before prose.** When the structured gate passed but no
  local prose matched, the verdict is still pass ("open in your country") —
  the structured pass is a floor the prose cannot lower.

## Decision rules

- **When adding a new country to the corpus, stamp structured
  country/scope at ingest from day one, because** retrofitting geography
  onto prose-only legacy rows is the source of every unknown this gate emits.
- **When a supranational programme's eligible set extends beyond formal
  members (associated or partner territories), model the extension as data
  on the programme family, because** hard-coding the member set into the gate
  makes every enlargement or association change a code deploy.
- **When the applicant serves areas beyond its headquarters, gate on legal
  seat but let service area inform fit, because** funders' territorial rules
  usually bind on where the applicant *is*, while where it *works* is a fit
  argument.

## When not to use

A single-country, single-region product does not need the structured layer to
be *built* — but it still needs the discipline: the day a second country's
rows enter the corpus is the day prose-only geography starts leaking, and
that day rarely announces itself. If the corpus is genuinely and permanently
single-territory, whole-word prose matching alone is acceptable; revisit the
moment ingest adds a source you do not fully control.
