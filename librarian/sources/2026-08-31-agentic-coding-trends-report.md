---
source: 2026-agentic-coding-trends-report
kind: vendor prediction report
url: https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf
title: 2026 Agentic Coding Trends Report
author: vendor (corporate, uncredited)
words: 3418
extracted: 9
accepted: 3
declined: 0
leads: 3
already_covered: 2
untriaged: 1
dispatched: 0
applied: 2
shipped: 1
run_id: intake-agentic-trends-0831
siblings: 2
---

# 2026 Agentic Coding Trends Report

Two siblings were live at claim time: one on `codebase-stewardship/module-design`
(phase 8), one at phase 0 on a conference track. Neither held any subject this
run touched; the board was clear at Phase 4 and again immediately before the
first write.

**A late collision, recorded because it will look mysterious later.** By the time
this run reached Phase 10, the second sibling had gone QUIET (36 minutes stale)
holding seven subjects, two of which matter here: `adoption-measurement`, which
this run amended, and `integration/document-text-extraction`, which is adjacent
to the PDF reader landed in `scripts/lib/`. Both claims post-date this run's
Phase 4 and Phase 7 checks, which were clear when taken. This run's content
committed first; a later run merging that sibling's work should expect to
reconcile `before-after-outcome-pairing` and should read `pdf-text.mjs` before
writing anything about text extraction, rather than landing a second reader
beside it.

## The class, and what it predicts

**Vendor prediction report** — a class the reference does not carry. It is a
sibling of *vendor release announcement* and inherits that class's governing
sentence in a stronger form: **the numbers are the yield; the prose is the strip
test's problem.** An announcement at least describes something that exists. This
one is organised around eight predictions in the future tense, and future tense
is structurally unstrippable — "agents will work autonomously for days" loses
nothing to the strip test because there was never an actionable rule in it, only
a forecast. Sixteen of the document's seventeen pages are that.

What it is reliable for is the handful of places it cites measurement, and
exactly one place where it reports what practitioners *did* rather than what the
vendor expects them to do. Both of the run's knowledge landings came from those;
none came from a prediction. Expected yield was stated as low before the triage
table and the result matched it.

## The instrument failed first, and failed quietly

`research-ingest` reported **13,029 words at exit 0**. The source is a PDF; the
web branch called `res.text()`, which decoded the container's bytes as UTF-8,
`htmlToText` found no tags and passed them through, and the word counter counted
compressed FlateDecode streams as whitespace-separated tokens. Nothing threw,
nothing warned, and the number was large enough to look like a healthy mine.

Hand-verified word count after building a reader: **3,418**. The first figure was
not a small measurement or a noisy one — it was 3.8x the real count and none of
it was text. This is the run's clearest instance of the standing rule that an
instrument's first number is not a measurement, and it is worse than the usual
case because the failure mode here is *confidently large*: a thin-source guard
(`--min-words`) cannot catch it, since binary always clears the floor.

Fixed in-run. `scripts/lib/pdf-text.mjs` is a dependency-free reader (zlib for
FlateDecode, font-aware via each `/Tf`'s `/ToUnicode` CMap — without that, every
bold and display run returns mojibake, which is precisely where a report of this
class puts its numbers). `research-ingest` now sniffs the PDF by magic bytes
rather than by URL suffix or Content-Type, and asserts two things before
reporting: that page content streams were found (else exit 2, instrument
failure, never exit 3 thin-source), and that the extracted text is not
predominantly non-text characters (the mojibake case, where the count is real
and the words are not).

## Candidates

### 1. Gate on verifiability, not only consequence — ACCEPTED (technique)

**Claim (source):** engineers delegate tasks that are "easily verifiable — where
they can relatively easily sniff-check on correctness" or low-stakes, and keep
conceptually difficult or design-dependent work for themselves. Reported as
first-party internal research, alongside "AI in roughly 60% of their work" but
"fully delegate only 0-20% of tasks".

**Strip:** survives completely. No proper noun is load-bearing.

**Verification.** `hitl-approval` keys its whole gate map on consequence — the
four mandatory triggers are irreversibility, spend, external visibility, and
novelty, all properties of what happens if the output is wrong. `verifiab*`
appears **zero times** across the golden path and all eleven techniques. The
subject models rubber-stamping as an attention-budget failure whose every
countermeasure reduces volume; none of them reaches the case where the reviewer
reads carefully and still has nothing to check against. The two axes come apart
in the quadrant the corpus explicitly exempts: reversible-but-unverifiable work
is "mostly white space" on a correct gate map, and it is exactly the work the
source's practitioners refuse to delegate.

Landed as `oracle-before-gate`, with the golden path amended in two places (the
mandatory-gate section gains the precondition; the fatigue section gains the
second cause and the instruction to split the 100% approval rate by oracle
presence).

**Corroboration:** not the source's wording — the source located the thing and
explained it as a delegation habit. The rule was written against the corpus's
own enumerations plus a real tree (below), which is the stronger of the two
routes the table allows. Zero fetches spent.

### 2. Induced work is not coverage change — ACCEPTED (amendment)

**Claim (source):** engineers report a net decrease in time per task but a much
larger net increase in output volume; **~27% of AI-assisted work is work that
would not have been done otherwise** — scaling projects, nice-to-have tools,
exploratory work, "papercuts" that were previously deprioritized.

**Strip:** survives.

**Verification.** `before-after-outcome-pairing` step 5 says a part scored on one
side and not the other "is not a movement at all — it is out of scope for this
pair", to prevent a delta manufactured by coverage change. Induced work has the
identical syntactic shape and the opposite meaning: absent from the before side
because it *did not exist*, not because nobody measured it. Excluding it reports
the residue and deletes the effect. The amendment adds the discriminator, the
evidence requirement that keeps an observed zero distinct from an invented
baseline (the technique's absolute rule is untouched and cited), an `induced`
status token, and the rule that induced scope is reported beside the delta and
never folded into it.

### 3. PDF sources ingest as binary, silently — ACCEPTED (script)

Above. Landed in `scripts/lib/pdf-text.mjs` + `scripts/research-ingest.mjs`.

### Already covered — 2

- **Orchestrator coordinating specialized sub-agents across separate context
  windows** (Trend 2). `llm-agent/orchestration/agent-chaining` and
  `fleet-orchestration` own this with handoff payload contracts, cycle and depth
  guards, and result harvesting. The source contributes a customer anecdote and
  no construction rule — the predicted shape for this class.
- **Agents recognising uncertainty and escalating rather than attempting**
  (Trend 4). `hitl-approval/fixed-policy-amendable-plan` already states the
  sharper version: the executor may *propose* a new policy but never adopt one,
  and which side a mid-run change falls on is a trigger predicate like any other.

### Untriaged — 1

- **Three multipliers compound rather than add** (Trend 6): agent capability,
  orchestration, and better use of human experience produce "step-function
  improvements rather than linear gains". Anchor: Trend 6, first prediction.
  Nobody verified this; it is recorded so a later run does not re-derive it. It
  has the shape of a claim `engineering-assessment` could own if a second,
  independent source states it with a measurement rather than an adjective.

### Leads — 3

- **Onboarding collapse enables dynamic surge staffing.** "Traditional timelines
  for onboarding to a new codebase collapse from weeks to hours", with one
  customer anecdote (a project a CTO estimated at 4-8 months finished in two
  weeks). One vendor-selected data point about a customer's own estimate, which
  is the weakest evidence shape there is. *Return when a managed project measures
  its own time-to-first-merge for a newcomer, or a second independent source
  reports the same collapse with a protocol.*
- **Dual-use: agentic defense and offense scale on the same capability**
  (Trend 8). Widely held and unmeasured here; the report states it as a reason to
  build security in early, which the corpus's security subjects already assume.
  *Return when a source carries an actual asymmetry — a reason the defensive or
  offensive side compounds faster — rather than the symmetry.*
- **Coding agents reaching legacy and domain-specific languages** (COBOL,
  Fortran) and non-engineering roles. A currency signal about vendor coverage,
  not a claim about a standard. *Return when a managed project has a legacy-
  language surface, or when the claim can be dated against a published
  capability matrix.*

## Cross-run convergence

None found. This run's two knowledge findings share a root with each other —
both are about a measurement or a gate keying on the wrong property and being
structurally unable to see the one that matters — but a single run reaching a
shape twice is not convergence, and neither prior-run finding in the ledger
carries the same root. Recorded here so a third sighting can be recognised: if a
later run lands another "the instrument's terms are all from the wrong axis"
finding, the three together may be a law-level claim about measurement design
rather than three techniques.

## Fetch budget

**0 of 3 spent.** Twelfth consecutive zero-fetch run. The class would normally
demand one — a relay of a measurement is a lossy pointer, and the underlying
internal research is the primary here. It was not needed because neither landing
rests on the source's numbers: finding 1 was written against the corpus's own
enumerations and a real tree, and finding 2 against a real instrument's revision
history. The source's percentages appear in this note as provenance and in no
published document.
