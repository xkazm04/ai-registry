---
source: youtube
url: https://www.youtube.com/watch?v=icM0ewXGvAw
title: "19 Claude Code Mistakes \"Pro\" Users Are Still Making"
author: Simon Scrapes
kind: second-hand-practitioner-listicle
mined_on: 2026-08-25
words: 4465
skill_version: 0.6.0
extracted: 19
picked: 3
accepted: 3
already_covered: 0
declined: 16
leads: 1
untriaged: 0
dispatched: 0
---

# 19 Claude Code Mistakes, 2026-08-25 - three techniques from a listicle, and a cross-repo lane

Run 10, and the first run of the hardening series the operator opened to
exercise this skill against a mixed article/video diet before pushing. The
source is a **second-hand practitioner listicle**: a creator relaying vendor
documentation with some first-hand pain, organised as numbered "mistakes".
Predicted yield for the class was catch-dominant with one to three real
findings; the run landed three techniques, three applications and one
correction, which is above the class's profile - because the operator
scoped the picks to what a connected project could test, and all three
picks had a live instance in one tree.

## The class, on first observation

A listicle of this kind is **reliable for where the vendor's rules moved and
unreliable for why**. Its numbers are quoted from somewhere else (a study,
a doc page, a benchmark) and the quoting is lossy: "7x more tokens" turned
out to be a figure about a different feature than the one the item was
about, and "162 personas across 2,500 prompts" was 162 roles across 2,410
questions - close, and the direction was right. The operating rule: **treat
every number as a pointer to its primary source, never as the fact**. All
three accepted findings were written from the primary (a paper, the
harness's own reference page, the vendor's pricing page), and the source's
contribution was knowing the primary existed.

Two things this class does that the news-roundup class does not: it
occasionally carries a first-hand correction of the creator's *own* earlier
advice (item 12 retracting a previous video's compaction claim), which is
the most trustworthy sentence in the whole transcript; and its items that
touch the **registry's own machinery** (symlinked skills, always-loaded
rules, worker briefs) outrank its items about bundle content, because the
registry is itself a consumer of the harness the listicle is about.

## Accepted

| # | Title | Shape | Landed | Corroboration |
| --- | --- | --- | --- | --- |
| 1 | Spend the opening on locate / done / check, not role priming | technique | `prompt-assembly/techniques/task-envelope.md` + `applications/rust--task-envelope.md`; cross-repo: two self-check lines in the companion's dispatched-worker prompts, with test assertions | Primary: Zheng et al., "When 'A Helpful Assistant' Is Not Really Helpful" (EMNLP 2024 Findings) - 162 roles x 2,410 questions x 4 families, no gain, per-persona effect largely random, auto-selection no better than chance. The "state the wanted behaviour, not the forbidden one" rule (candidate 2) folded in as one decision rule on training-data convergence with the vendor's prompting guidance. |
| 11 | A dispatched worker inherits nothing from the session; the brief restates it | technique | `fleet-orchestration/techniques/brief-carries-the-session.md` + `applications/rust--brief-carries-the-session.md` | Primary: the harness's subagent reference page, fetched in-run - fresh workers get system prompt + task + instruction-file hierarchy + parent git snapshot; never history, auto-memory, output style, read files, invoked skills; the built-in research and planning classes skip instruction files; forks inherit everything. The source's "7x" figure is about agent teams, is not on that page, and was **not** carried. |
| 16 | The prompt cache is per model; a cheaper tier mid-conversation costs more | technique + correction | `model-routing/techniques/cache-continuity.md` + `applications/rust--cache-continuity.md`; one paragraph added to `applications/process--candidate-ranking.md` giving the sticky-session pin a sourced cost rationale | Primary: the vendor's prompt-caching page - write 1.25x (5 min) / 2x (1 h), read 0.1x, invalidation hierarchy tools -> system -> messages, speed setting invalidates system+messages. The break-even (a cheaper tier wins only below 1/8 of the incumbent's base price, before the return trip) is derived from those multipliers, not from the source. Candidate 8 (speed-mode toggle re-bills the context) is the same rule and is absorbed as an instance. |

The cross-repo half of #1 was requested by the operator at triage ("with
impact on Personas Athena") and executed on the connected project's default
branch as a pathspec-scoped commit: two prompt lines, two test assertions,
compile-verified (the desktop test binary cannot start on this machine -
see the registry's open-threads memory - so the assertions are compiled,
not run).

## Declined - operator's reason: no consuming project sees value today

Candidates 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 17, 18, 19 and (as a
standalone) 2 and 8. Recorded so the next run on a similar listicle does
not re-propose them; several are real and would land on a different day:

- **6 - skills in the project tree are invisible to the desktop work surface,
  which loads skills at session start.** Banked as the run's one **lead**:
  the registry's link-not-distribute design assumes one harness surface.
  Return condition: the operator starts using the desktop work surface
  against a linked project, or the two surfaces merge their skill
  resolution.
- **9 - instruction files are read once at session start.** True per the
  harness docs, and it touches the registry's always-on `rules/` symlinks
  (an edit lands next session, not this one). Not a content gap -
  `agent-instruction-files` already says "loaded at session start" - and
  the consequence is a harness fact the operator knows.
- **10 - dilution numbers (300-350 words, 150-200 instructions).** Already
  the substance of `line-earning`; the numbers alone are a vendor claim
  without the measurement, and the technique deliberately carries the
  mechanism rather than a magic number.
- **13 - retrieval falls from 93% to 76% between 256k and 1M tokens.** One
  vendor benchmark on one model; an existence proof for "a bigger window is
  not more memory". Would amend `context-budgeting` with a sentence; the
  operator did not want it and it is easy to re-derive from the vendor's
  page when someone does.
- **17 - the verification ladder (in-prompt check -> per-turn evaluator ->
  stop hook -> adversarial reviewer scoped to the done condition).** The
  most technique-shaped of the declines; `judgment-guardbands` and
  `eval-harness` own the grading half but nothing owns the escalation
  ladder. Declined on scope, not on merit. Reconsider if a second source
  carries the same ladder.
- 3, 4, 5, 7, 12, 14, 15, 18, 19 - harness tips and currency signals with
  no bundle home worth the file; 5 and 12 are the source correcting its
  own earlier advice and are worth nothing more than this line.

## Corpus notes from verification

- `prompt-assembly` had no technique for the task layer's content; the
  golden path's identity layer (a product decision) and the new technique's
  role-priming finding (a per-task lever that does not work) are different
  uses of "you are", and the technique says so to keep the distinction.
- `fleet-orchestration` owned the dispatch mechanics (slots, write sets,
  keys) but not the brief's *content*; `agent-chaining`'s
  handoff-payload-contracts is the chain-to-chain sibling and was not the
  home.
- `model-routing`'s `process--candidate-ranking` application already
  flagged the sticky-session quality premise as unsourced. The new
  technique gives the pin a cost rationale instead; the application was
  amended rather than contradicted.
- The companion tree turned out to be cache-safe **by construction** (each
  cheap tier has its own prompt family; the conversation is pinned on
  resume) for a quality reason its authors recorded - a convergence the
  application names as better evidence than either argument alone.

## Instrument notes

- `research-ingest` handled the video cleanly (yt-dlp 2026.08.19, en-orig
  captions, 4,465 words after dedupe).
- `research-map --deep` placed all three picks in the right subject on the
  first pass; the presence greps that followed were what separated "the
  subject exists" from "the stage is missing".
- Three fetches, three primaries, no commentary fetched. Budget was exactly
  right for three picks; a fourth pick would have had to lean on
  convergence.
