---
source: web:blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber
kind: vendor release announcement
url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/
title: Introducing Gemini 3.8 Flash and 3.8 Flash Cyber
author: Tulsee Doshi; Raluca Ada Popa
words: 1287
extracted: 11
accepted: 2
declined: 0
leads: 4
already_covered: 0
untriaged: 5
applied: 2
shipped: 7
dispatched: 0
run_id: gemini38flash
siblings: 0 at claim, 2 by Phase 7
---

# Gemini 3.8 Flash - vendor release announcement

**Class read before extraction.** A vendor's own post about its own release.
The class rule from the 2026-08-28 run held exactly: **the numbers are the
yield, the prose is the strip test's problem.** Both accepted findings came
from a number or a dated fact; nothing came from a sentence. Expected yield was
stated before the triage table as currency signals, leads and at most two
amendments, and that is what the run produced.

The operator's ask had a second half - find every fleet project pinning an
older Flash and move it to 3.8 - which made this simultaneously a news run and
a fleet-wide currency sweep. The sweep is where most of the value was.

## Fetches: 4 (budget 3, one overrun, recorded)

1. `ai.google.dev/gemini-api/docs/models` - **this was the extraction, not
   corroboration.** The post never states the API identifier. Confirmed
   `gemini-3.8-flash` as the stable id, confirmed **no 3.8 Flash-Lite exists**,
   and returned the finding the post does not carry at all: `gemini-2.0-flash`,
   `gemini-2.0-flash-lite` and `gemini-3.1-flash-lite-preview` are **shut
   down**. Two fleet projects were pinning shut-down ids.
2. `docs/gemini-3` - partial. Confirmed the effort dial is `thinking_level`
   with `minimal|low|medium|high` and a default of **`high`**. The page carries
   a deprecation banner pointing at a guide that does not mention 3.8.
3. `docs/whats-new-gemini-3.5` - empty for 3.8. The guide had not caught up.
4. **Over budget, deliberately.** `docs/models#gemini-3.8-flash`, to establish
   whether 3.8 accepts image input before swapping a vision seam in a user's
   tree. It does not say. A capability check before shipping a change beat
   budget purity; recorded here rather than quietly absorbed.

**That is itself a dated finding worth more than most of the run:** on release
day the model list carried the id while the spec table carrying input
modalities did not exist. **A model can be callable before it is documented**,
so "the id is live" and "I know what it accepts" are different facts with
different dates - and on a vision seam the gap between them is the difference
between an upgrade and an outage.

## Accepted (2)

### 1. `effort-calibration` - the successor moves the dial without touching it

The technique models effort as a dial the routing table sets, with a re-measure
cadence triggered "on roster change affecting the entry's tier". A point
release replacing its predecessor **in the same tier, at the same price, under
an unchanged dial** trips none of that, and the vendor's own text says the
successor "works harder": extra reasoning steps, iterative tool calls, more
tokens, with the predecessor explicitly retained for efficiency-first work.

Boundary case of a mechanism the corpus owns, so an amendment rather than a
technique. Three consequences landed: same price per token is not same price
per task; the term that moves is reasoning tokens, usually billed as output and
already the largest; and the predecessor staying on the roster makes the
version ladder a second tier axis rather than an upgrade path. Plus the dial's
**default** - `high` - meaning an adopter who sets nothing inherits the most
expensive configuration of a model already described as spending more.

Corroborated in real code, not by the post: `gravitone-gcloud` had measured
hidden reasoning at **12.8x** the visible answer on a mid-tier flash and 25.1x
on a larger model, and bills it as output.

### 2. `price-tables` - a scheduled rate, and a key that outlives its number

Two additions, both boundary cases of bullets the technique already carries.

**(a) A published end date is not staleness.** The introductory rate expires
2026-12-31 and doubles 2027-01-01. The technique's dated bullet answers "may
have moved"; this is "certain to move, on a date you already have". The fleet
supplied the discriminator by disagreeing with itself: `ascent` books the
**introductory** rate because its figure is shown as current spend; `kp` books
the **standard** rate because its figure feeds cross-model comparison and "cost
comparisons shouldn't silently improve when the promo lapses". Both argued in
prose, unprompted, in opposite directions - so the rule is not which rate wins
but **what the number is for**, written next to it. `ascent` also has the
mechanism: a test that throws on the expiry date carrying the replacement rate
in its message.

**(b) A computed key follows a rename; its value does not.** Found in
`systedo-case` and negative - the strongest thing in the run. Its rate rows are
keyed by the constant naming the current model, with a test asserting every
selectable model has a row, which the repo calls a join that is "CHECKED, not
conventional". The bump moved the key automatically, the test stayed green, and
the rate underneath still described the preview: **a tenfold understatement
behind a passing assertion.** An existence check over a computed key proves a
row exists for the current model, never that the row is that model's.

## Applied (2 rows)

| technique | project | mode | verdict |
| --- | --- | --- | --- |
| `price-tables` | ascent + systedo-case | `code` | **better** (ab-paired) |
| `effort-calibration` | gravitone-gcloud | `task` | **unmeasurable**, instrument named |

The A arms were run, not reasoned about. `ascent`: bump the default alone gave
`no built-in rate for default model "gemini-3.8-flash"`, 1 failure, exactly as
its own comment predicted; B gave 45 pass, full suite 2176. `systedo-case`:
bump alone gave 1 pin-gate finding; B clean, 8/8. **The instructive half is
what A did NOT fail:** systedo's rate test stayed green through the defect in
2b. The guard that caught most asserted a default had a price; the guard that
caught nothing asserted the join was complete.

`gravitone-gcloud` is `unmeasurable` for a stated reason: resolving it needs a
live roster pass with the repo's key - third-party spend this run had no
standing to authorize - and the file forbids promotion "by assuming it
settled". The instrument is named and the tree already knows how to run it.

## Shipped (7 projects, 7 commits, none pushed)

Scope was set by the operator at **active defaults only**: price-table rows,
measured quality baselines and image/TTS/Lite/Live variants excluded, because
renaming a historical price row or an unmeasured baseline corrupts data rather
than upgrading a model.

| project | commit | what |
| --- | --- | --- |
| ascent | `ad007e37` | default to 3.8, price row, dated promo guard extended to both rows |
| goat | `0c4d38e` | **both** ids were shut down (404s in production), not merely stale |
| gravitone-gcloud | `bda26bd` | priced-but-not-promoted row plus the pass it owes; no default moved |
| kp | `02afceb6` | three defaults, price row at the **standard** rate per its own policy |
| personas | `86cc350c8` | recorded why the OCR default stays - vision, modalities undocumented |
| pof | `454715ad` | text seam only; the two visual seams held, comment corrected |
| systedo-case | `e772dd52` | model surface re-pinned, the 10x rate defect corrected |

`tracklight` and `personas-web` were correctly left alone: tracklight's Gemini
entries are leaderboard **identity-normalization** rules and tests - rewriting
them would corrupt historical merges - and personas-web's only seam is vision.

**Three projects declined the bump on their own recorded evidence, and each
refusal is worth more than the edit would have been**: gravitone (dated
measurement, 503 under load, promotion rule written into the file), personas
and pof (vision seams against undocumented modalities). A blanket sweep would
have overridden all three silently.

## Leads (4)

- **Capability gating by attested operator class.** The cyber variant ships "a
  more permissive set of mitigations" to vetted defenders - the same core model
  under two safety postures, gated on who is asking rather than on what is
  asked. The corpus has capability gating by feature and by tier, not by
  attested caller class. *Return when a second vendor ships a tiered-mitigation
  program, or a fleet project needs to vary policy by caller attestation.*
- **A lower benchmark score defended on the frontier.** 47.2% pass@1 against a
  leading model's 47.8%, offered as a win on cost. `quality-axis-separation`
  treats quality and cost as separate axes but does not model choosing a
  *lower* score deliberately. *Return on a second instance, or when a fleet
  bake-off has to rank on the frontier rather than the scalar.*
- **The standard benchmark's population is narrower than deployment.** The
  vendor names its own benchmark's scope limit (C/C++ only) and reports a
  broader internal one across 20 languages at >70%. A vendor disclosing its
  headline benchmark's non-representativeness is unusual and the shape is
  reusable. *Return when `eval-harness` next touches population validity.*
- **Prompt-injection robustness claimed with no number.** "A significant leap
  ... as measured by Gray Swan", no figure, in a post otherwise dense with
  them. The absence is the signal. *Return if a figure is published.*

## Untriaged (5, with anchors, nobody verified these)

- "Long-running agentic loops designed to recursively evaluate and refine the
  underlying models" - training-time self-improvement, unstrippable as written.
- Cybersecurity training as a **general** capability driver: "coding and
  reasoning gains ... driven by ... rigorous training in the highly demanding
  domain of cybersecurity."
- Vulnerability *fixing* prioritized over exploitation as a stated product
  stance ("prioritized it over offensive capabilities").
- Third-party deployment numbers: 2.6x correct patches (Chrome Security);
  +7.5-9.7% recall at 2.3-5.2x lower cost (Wiz); a critical vulnerability found
  in under 2 hours "for which research and discovery usually takes months".
- Release cadence as a corpus-relevant clock: three Flash releases in six
  weeks, 3.7 shipped three weeks before 3.8.

## Notes

- **Zero declines.** Every candidate either landed, became a lead with a return
  condition, or sits untriaged with its anchor. Nothing was judged and
  rejected, so the decline ledger stays clean.
- Two siblings live by Phase 7 (`emdash-cms/emdash`, a control-plane run);
  neither held a target and the board reported clear before every write.
- **`index.json` and `catalog.json` left uncommitted deliberately.** The
  regeneration absorbed three sibling subjects not in `HEAD`
  (`declarative-resource-lifecycle`, `convergence-loop-and-requeue`,
  `watch-cache-and-resync`). A stale index is self-correcting; a committed hash
  over somebody's half-written subject is not.
- **Method finding for LESSONS:** writing files with Python text mode on
  Windows flipped LF to CRLF and turned one-line edits into whole-file diffs in
  two projects. Caught by `git diff --stat` before committing, but only because
  the number looked wrong. Write bytes and preserve the file's own ending.
