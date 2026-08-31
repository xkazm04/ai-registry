---
source: web:github.com/tc39/proposals
kind: reference index (by ratio) — but see the class note; the rows are records, not pointers
url: https://github.com/tc39/proposals
title: "Tracking ECMAScript Proposals"
author: a standards committee (collective)
words: 1540 landing page / ~10900 in-tree
commit: 600a4278a7cabcb53915fa97296b5688529ddd07
extracted: 8
accepted: 2
declined: 0
leads: 2
already_covered: 2
untriaged: 0
applied: 2
shipped: 0
dispatched: 0
fetches: 1 of 3
run_id: tc39-proposals-0831
siblings: 3 live at claim (aider-se QUIET at phase 8; apply-politicas; whatwg-html-0831), a 4th joined mid-run
---

# TC39 proposals — the reference index whose columns are the source

## The class reading, and where the method's lane was wrong

The ratio test says **reference index** and says it loudly: 1,603 unique
outbound links over ~10,900 in-tree words, ~0.15 links per word, against a
code repository's handful across tens of thousands. Phase 2c's lane would
therefore enumerate all ~200 references, rank them, and read them in waves.

**That would have been a near-total waste, and the reason generalises.** The
references are individual language-feature proposals; every one of them strips
to `nothing` against all eight bundles. A full wave campaign spends ~40 fetches
to return ~200 honest negatives.

What the source actually holds is in the part Phase 2c treats as annotation.
Each row is not a pointer with a label — it is a **maintained record**: stage,
author, champion, a per-stage evidence column, a dated notes trail, and for
dead items a rationale. The knowledge is the **schema of the table**, and the
links are the decoration. The property worth carrying forward:

> When a reference index's rows carry per-row metadata the curator maintains
> across time, the table's schema is the source and the bibliography is the
> decoration. Read the columns, not the links — and read what the columns do
> *differently at different stages*, because that difference is the curator's
> model of their own process.

Recorded as a method lesson; it is the single most reusable thing this run
produced about a source class.

## What was swept

Cloned and read in yield order, not prominence order: `inactive-proposals.md`
(1,355w, 46 dead items with rationales — the densest file in the tree),
`finished-proposals.md` (3,235w), `stage-1-proposals.md` (2,411w),
`stage-0-proposals.md`, the four `ecma402/` files, then `README.md` (2,080w)
last. The landing page the ingest returned was 1,540 words and contains none of
the graveyard.

## The fetch that inverted the source

1 of 3, spent on the committee's process document — **as extraction, not as
corroboration**, and it changed both findings:

- The process makes a conformance test suite an entrance criterion at a
  specific stage, which is exactly where the tracker's test column appears.
  So the schema change is not cosmetic: **the column set tracks the entrance
  criteria.** That confirmed candidate 3 hard enough to fold it into the
  technique rather than bank it.
- More usefully, it contradicted the shape the source's surface suggests.
  Items sit *one and two stages past* the criterion with the evidence cell
  openly non-satisfied — so the interesting fact is not that a gate exists but
  that it is routinely overridden **on the record**.
- And the sentence that turned an observation into a technique: **"No explicit
  rule addresses stalled proposals or automatic removal,"** with a departed
  owner replaced only if another participant *volunteers*. The source shows
  proposals dying; the primary shows there was never a mechanism that could
  have caught them.

## Candidates

**1. Item carries its own per-gate evidence record — ACCEPTED**
→ `quality-gates/techniques/advancement-evidence-fields.md`
The test column exists at the two stages where it binds and nowhere else;
finished items drop it and gain a publication-year column instead. Cells take
four distinguishable values (link / open-work link / a link to *why there are
none* / an explicit unknown glyph). Verified against the file, not the slug:
all 14 existing techniques take the checker as subject; none takes the item.
Supplies the fourth resolution `unmeasurable-criteria` structurally cannot,
since all three of its resolutions vanish with the run.

*The measurement that carried it* — one board, two obligations, two
conventions: the test field left 8 of 18 holes legible; the reviewer field left
16 of 29 (55%) as bare blanks. A blank cannot distinguish "not yet" from
"unrecorded" from "nobody looked", and **the readable obligation is the one
that gets discharged**, though neither blocks anything.

**2. Item liveness — ACCEPTED**
→ `quality-gates/techniques/item-liveness.md`
The deliberate mirror of `gate-liveness`, which the subject had modelled with a
whole technique on the gate side and nothing on the item side. 7 of 46
terminated items name owner departure as the sole cause — the largest named
category, ahead of every technical objection — and three were closed the same
day, the signature of an unscheduled once-in-a-decade sweep. Computing
last-touched from the trail the tracker already keeps: **30 of 92 in-flight
items silent for two years or more**, quietest since nine years earlier, all
listed as active.

**3. The tracker's schema changes per stage — FOLDED into 1.** Corroborated by
the fetch (columns track entrance criteria); it is the technique's first
section, not a separate landing.

**4. Decline ledger as a redirect table — ALREADY COVERED, partially absorbed.**
`audit-logging/decision-records` owns human decisions about findings, keyed by
identity that survives regeneration. Its concern is different but adjacent
enough that a competing technique would duplicate. The one number worth
keeping — 11 of 46 rationales point at a successor, making the graveyard a
redirect table rather than a tombstone list — went into `item-liveness`'s
reaper section, where it argues that reaping must stay information.

**5. Missing-rationale rate — FOLDED into 2.** 6 of 46 entries carry a bare
"withdrawn" with no reason. Landed as the reaper's "the rationale is required"
bullet: where it is optional it is omitted, and those are the entries that
teach nobody anything.

**6. The internationalization API proposals are stalled — LEAD, not currency.**
Message formatting, locale matching and segmenter successors all sit at the
first substantive stage, several with no committee activity for years.
Checked before claiming a clock reset: the localization bundle cites the **ICU
/ LDML** message format specification, not the language-level API, so **no
published claim depends on these shipping** and there is nothing to reset.
*Return condition:* when a bundle or application recommends the platform-level
formatting API over a library, this list dates that recommendation.

**7. Per-row append-only decision trail — ALREADY COVERED.** One item's row
carries ~40 dated entries spanning 12 years. `audit-logging/append-only-design`
and `decision-records` own the shape. Cited from `item-liveness` as the trail
the derivation reads, not restated.

**8. A sub-specification forks its own parallel stage ledger — LEAD.** The
internationalization spec runs a complete second index — its own stages, its
own graveyard, its own README — under one process document. The interesting
question is what makes a sub-domain need a separate board rather than a filter
on one board, and one instance cannot answer it. *Return condition:* when a
second source shows a governance pipeline splitting its ledger by sub-domain.

## Applied (Phase 7.5)

**`advancement-evidence-fields` → personas, `experiment`, `better`.** A
readiness passport with 15 dimensions, each holding a level, a tool pointer, a
skip flag and optional prose. Arm A (shipped schema): 11 of 15 dimensions'
evidence state resolves from structured fields alone. Arm B (four-state field):
15 of 15. Second measurable — dimensions with an individually knowable evidence
age: **0 of 15** against one collection-level date five weeks old.

Two honest qualifications, both in the application: the predicted
unreadable-blank population is **absent** here (0 of 15 carry neither pointer
nor note), because the author's discipline covers what the schema permits —
which is the technique's own "convention not schema" hazard observed as
currently benign. And the structural fact worth more than either arm: the
schema has **no `reason` field of any name**, so *absent-with-a-pointer-to-why*
is inexpressible; `skippedByChoice` is a boolean that can record *that* a skip
happened and never what it was for. Nobody designed that — it is what an
absence state degenerates to when added as a flag.

**`item-liveness` → this repository, `experiment`, `unmeasurable`.** Ran the
technique's own diagnostic against the harvest queue (177 entries, all at one
status) and the watchlist (56 rows) and found its **precondition missing**:
both carry a single collection-level date and no per-item trail, so
last-touched is not derivable at any price. The technique gained an amendment
saying so and naming the cost where the cheap version does not apply. The
effect is genuinely unmeasurable — the queue is three days old, so zero items
are stale under any threshold and both arms return the same number. Instrument
named: a per-entry `touched` date, or a join from entry id to the run ledgers
that already record dated events. Return at 90 days (~2026-11-26); the banked
leads reach that threshold sooner and are the cheaper first test, their dates
already being derivable from note filenames.

Nothing was written to a project tree: both arms were read-only, no product
code changed, and no cross-repo commit was warranted. The personas seam is
therefore **not** recorded in that project's `.ai/applied.jsonl` — the operator
approved the registry-side plan, which named no project.

## Parallel-run notes

Three siblings live at claim, a fourth joined. `whatwg-html-0831` claimed this
same subject mid-run and landed `fabrication-economics` into it without yet
declaring it in the golden path. Consequences worth recording:

- Golden-path edits were made under the `content` lock, which was the right
  call and cost seconds.
- The `index` regeneration ran inside the `index` lock and still **baked that
  sibling's undeclared technique into the artifacts**, because a lock cannot
  see a file already sitting in the shared working tree. Bundle integrity is
  consequently red on two orphans, neither of them mine. The generated
  artifacts were left unstaged for whoever finishes last, and only content
  files were committed by pathspec.
- The lesson is not "hold the lock longer" — it is that **the `index` lock
  serialises regenerations, not the tree they read**, which is a real limit of
  the mechanism and worth stating where the method claims the lock makes
  regeneration safe.
