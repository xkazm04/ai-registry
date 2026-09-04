---
source: youtube
kind: second-hand practitioner review (a demo of someone else's release)
url: https://www.youtube.com/watch?v=B-YQANvDOq0
title: "Claude Code Just Made CLAUDE.md Feel Obsolete"
author: Ray Amjad
words: 3791
extracted: 12
accepted: 3
declined: 0
leads: 1
already_covered: 7
untriaged: 1
dispatched: 0
applied: 3
shipped: 1
run_id: intake-yt-byqan
siblings: 1 at start (3 by Phase 7)
rescan_when: n/a (not a repository class)
---

# The review was right about the feature and wrong about the headline, and the binary was the source

**Class and expected yield, stated before the table.** A second-hand
practitioner review: a creator demonstrating a vendor's release, with a thin
first-party half (his own tool overrides). The class table says such a source is
reliable for *that it shipped* and that **the fetch carries the rest**. Expected
yield was one currency signal, a lead or two, and mostly catches. That is close
to what happened — with one correction to the method's own expectation, recorded
below: the extraction came from the **shipped binary**, not from the web fetch.

Roughly two of sixteen minutes are a sales pitch for the author's course. The
technical content is a tour of a preview-gated Claude Code feature called
*function hooks*, framed as making instruction files obsolete.

## The headline is a catch, and the corpus says it better

The video's thesis — "all the things you may have been putting in your CLAUDE.md
files, you can start removing and putting into really well-defined hooks.json
instead" — is `agent-instruction-files/enforcement-demotion`, which has owned it
since 2026-08-24 and states it with measurement the video does not have
(compliance falls with instruction *count*, not position; constraint violation
was 38% of validated misalignment episodes across 20,574 sessions, ~50% in
unattended CLI sessions). Six more of the video's segments landed on existing
techniques the same way. The interesting content was underneath the headline.

## What the fetch and the binary actually established

The public hook documentation for this version describes **five** hook types and
does not mention function hooks at all — consistent with the video's own
`CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` flag. Rather than spend the remaining
fetch budget on commentary, the run read the shipped binary's own schema, which
is the primary the corroboration table would rank above any of it:

- **Six** hook types, not five: the sixth is the gated one.
- Two of the six reach their verdict **by asking a language model** — one
  described as an "LLM prompt hook type" defaulting to a small fast model, and
  one described in the schema itself as an **"Agentic verifier hook type"**,
  defaulting to Haiku with a 60-second timeout. Both can return the same
  blocking decision the deterministic types return.
- The flag is a **GrowthBook** feature flag with an environment override, whose
  payload is fetched per session and disk-cached from the previous one.

The first of those refutes a sentence a mature technique states as fact. The
third is a mechanism the corpus's capability-matrix technique does not model.

**Fetch budget: 1 of 3 spent** (one further fetch 404'd and one redirect was
followed). The decisive corroboration cost zero fetches, because the artifact
was on disk.

## Triage

Expected yield for the class was stated above. Vetoes: none fired (V1 clear —
all three rows land in existing subjects; V5 flagged `agent-runtime-assembly`,
resolved as an append, see below).

| # | Shape | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | amendment | A model-backed hook is not a demotion | `agent-instruction-files/enforcement-demotion` | corrects-claim | real gap | 3/0\*/2 | accept |
| 2 | technique | Substituted result attribution | `agent-runtime-assembly/rewrite-before-the-gate` | new-technique | real gap | 2/0/2 | accept |
| 3 | amendment | Remotely-flagged capability | `agent-cli-transport/dated-capability-matrix` | corrects-claim | real gap | 2/0/1 | accept |
| 4 | technique | Secret as a handle in the transcript | `credential-vault/brokered-egress` | none | likely catch | — | catch |
| 5 | — | Move instruction-file rules into hooks (headline) | `enforcement-demotion` | none | catch | — | catch |
| 6 | — | Interception as a middleware chain | `observer-and-mutator-surfaces` | none | catch | — | catch |
| 7 | — | Rewriting a tool's arguments in flight | `rewrite-before-the-gate` | none | catch | — | catch |
| 8 | — | Ask-the-user gate on a mechanical predicate | `hitl-approval/consent-gates` | none | catch | — | catch |
| 9 | — | Every event to an external audit store | `audit-logging/write-chokepoint` | none | catch | — | catch |
| 10 | — | Dry run before the real command | `web-scraping/dry-run-preview` | none | catch | — | catch |
| 11 | — | Knowledge-base context injected at the boundary | `prompt-assembly/contributed-document-admission` | none | catch | — | catch |
| 12 | lead | Comprehension quiz before an outward action | — | none | thin | — | lead |

\* **Row 1 scores 3/2/2 literally and would be rejected at −1.** The +2 is the
rewrite penalty, and the only sentence that stops being true is a *superseded
factual claim about a vendor surface*. Round 18's scorecard named this exact
defect and round 19's declared focus asked for the carve-out; it is applied here
and argued rather than assumed. The penalty exists to protect standing
*reasoning* from being overwritten, not to protect a stale fact from being
fixed. With the carve-out RISK=0 and the row accepts at +3. **This is the run's
answer to focus item (1), and the first time the carve-out has been applied
deliberately rather than discovered.**

## Untriaged, with its cause

**One row, and the cause is `verified but unwritten` — not unverified.** Row 12,
the comprehension quiz before an outward action ("Claude Code will generate a
quiz for you to make sure that you correctly understand the changes before it
opens a PR"), is filed as a **lead** rather than untriaged. Its promoting
question was executed: *does any subject own the case where the gate's subject is
the human's understanding rather than the artifact's state?* The answer is that
`hitl-approval` owns consent gates and `machine-paced-delivery` owns
`human-gate-capacity` — the reviewer as a throughput constraint — and neither
models a gate whose predicate is comprehension. That is a real seam. It is not
landed because the source never built it; the author says "you can do something
like", and a technique authored from an unbuilt demo is the anti-pattern this
method exists to prevent.

**Return condition:** when a second, independent source reports having *run*
a comprehension gate, or when a fleet project grows a reviewer-understanding
gate in its own tree.

## Board and contention

One sibling was live at Phase 0 (`intake-stencil-harness`, holding nine
`llm-agent` subjects including `agent-runtime-assembly`); three were live by
Phase 7. **The board's `check` reported clear on `agent-runtime-assembly` while
the board's own `list` showed the sibling holding it** — the same contradiction
round 18 recorded. The `list` was treated as authoritative, the row was confirmed
to be an *append* (a new technique file plus one golden-path line rather than a
restructure), and the golden-path edit was made under the `content` lock and
released immediately. V5 defers a contended row only when it would restructure.

## Landed

- **`agent-runtime-assembly/substituted-result-attribution`** (new technique).
  `rewrite-before-the-gate` models two of a mutator surface's three powers in
  full and gives the third — a frame that returns without entering the
  continuation — one sentence saying it is legitimate. The asymmetry is the
  finding: that technique makes every gate see the effective *arguments* and
  pairs the power with a provenance rule, and nothing does the same work on the
  return path. An unmarked substituted result asserts three things falsely — that
  the tool ran, that the result is current, and that the named producer produced
  it — the third of which is `gate-sees-target` on the return path, since egress
  rules, trust class, credential scope and cost attribution were all computed
  against a producer that did not answer.
- **`agent-instruction-files/enforcement-demotion`** (amendment: "A model-backed
  hook is not a demotion either"). The sort's yes-branch assumed the destination
  decides by program. Two of six shipped hook types decide by model. The
  amendment adds the third question — *does this gate decide by program or by
  model?* — keeps the file's voice and its existing "hook that prints prose"
  section as the sibling case, and states the general form that outlives any
  vendor's hook menu: a rule has been demoted when its verdict stopped depending
  on a model's judgment, not when its text stopped living in the file.
- **`agent-cli-transport/dated-capability-matrix`** (amendment: the session
  axis). The technique already carries a "version trigger has a blind spot"
  section about the *service* behind the artifact. This is a third axis that
  defeats the **strongest** method rather than the weakest: a live run proves the
  capability existed in that session, under that flag payload, and does not
  transfer to another machine on the same version.

## Applied

Two rows, both against real trees, both with the arms named. See
`librarian/applied.md`. The personas row is `code` / `better` / `ab-paired` and
shipped; the fleet audit row is a `simulation` with a measured negative and names
its instrument.

## Catches worth recording so nobody re-proposes them

- **The secret-handle idea is `brokered-egress`.** The video's best segment —
  replace a credential with an ID at the input boundary, keep the value in an
  interceptor-owned store, substitute it at the outbound call so the secret never
  enters the transcript — is `credential-vault/brokered-egress` almost verbatim
  ("callers submit *intent*, never a value... it never holds the secret, so it
  cannot log it, serialize it into state, ship it to an error tracker"). The
  agent transcript is one more caller. No landing.
- **The tool-override argument** ("I told it to prefer my MCP server and it kept
  using the built-in, so I replaced the built-in's implementation") is a real and
  good move, and it is folded into row 2's technique as its motivating case
  rather than banked separately — steering is the weak instrument, substituting
  the implementation behind the tool the model already chooses is the strong one,
  and the cost of the strong move is the attribution the technique requires.
