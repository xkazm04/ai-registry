# Subject proposal — `conversation-orchestration`

**Status:** dispatched, class `NEW`. This is a forge input, not knowledge.
**Bundle:** `software-engineering`
**Category:** `llm-agent` · **Subcategory:** `companion` (already in `taxonomy.json`)
**Siblings in the same wave:** `companion-identity`, `companion-runtime`
**Named neighbours:** `chat-transcript`, `guided-tours`, `async-ui-states`, `voice-io`
**Engine:** `domain-knowledge-forge` — [`harvest-brief.md`](harvest-brief.md) is the contract.

---

## The gap, measured

Grepped across the whole bundle (`knowledge/software-engineering`, excluding the
three in-flight `companion/` folders), 2026-08-23:

| Probe | Hits outside `companion/` |
| --- | --- |
| `quick.repl` / `quick reply` | **0** |
| `leader.key` | **0** |
| `numbered option` | **0** |
| `recall strip` | **0** |
| `avatar` | 1 — `canvas-graph/techniques/render-budget.md:113`, listing avatars as a class of small detail to drop at low zoom. Unrelated. |
| `orb` | 0 as a word; every hit is a substring of `forbids` / `absorb`. |
| `ambient` | 12, all of them either a transaction ambient in a data-access sense or `alerting`'s "ambient surfaces (badges, panels)" reach level. None is a persistent companion surface. |
| `walkthrough` | 8, every one incidental prose ("recorded walkthroughs", "a guided token walkthrough" as connector copy). No subject owns the form. |

So: nothing in the corpus owns a model-authored progress convention, a
model-proposed reply chip, a keyboard-driven ambient decision surface, a
non-dimming show-me walkthrough, or an avatar driven by turn events.

## Adjacent subjects, and what each does not own

| Subject | Owns | Does not own |
| --- | --- | --- |
| `chat-transcript` | The transcript **as a rendered document**: turn identity and phases, structured rows, the live narration thread and its collapse into a trail, the scroll contract, the metadata strip. | Where the narration items *come from* when the runtime observes no events; anything outside the transcript's scroll container. |
| `streaming-output` | Transport: chunk framing, typed events, run attribution, finalization, render throttling. | What convention the model writes *inside* its own token stream, and what the UI is obliged to do with it. |
| `structured-output` | The extraction pipeline over the **settled record** — explicitly "never on the live tail". Includes `display-vs-machine-channels` and `op-grammar-allowlisting`. | The live-tail line sieve a companion needs, and the conversational meaning of the lifted lines. |
| `guided-tours` | Dimming spotlight onboarding: anchor contracts, missing-anchor degradation, action-driven advancement, overlay precedence, tour lifecycle. | The conversational, non-dimming, per-request walkthrough a companion improvises from a live turn — which has no authored content and no lifecycle. |
| `proactive-nudges` | The **policy** of machine-initiated contact: budgets, quiet windows, dedup, efficacy. | The surface a nudge lands on and how the user answers it in one keystroke. |
| `voice-io` | Pipelines, the speech arbiter, mute, consent, read-aloud contract. | Which chat affordances exist and how a spoken turn shares a turn lock with a typed one. |
| `async-ui-states` | The generic state model, placeholders, arrival choreography, action busy states, failure states. | A busy state that is a *conversation partner* rather than a region — one that keeps talking, can be interrupted, and can be queued behind. |
| `agent-memory` | What is stored, scored, consolidated, forgotten. | What the user is shown about the retrieval **before** the turn spends it. |

## The overlap that had to be adjudicated: `progress-narration`

`chat-transcript/techniques/progress-narration.md` already owns the live
activity thread and its collapse at settlement, and it explicitly derives its
items from `phase-derivation` — that is, **from events the runtime observed**.

The companion's hard case is the one where the runtime observed nothing: a
single long model call, minutes of it, no tool events, no phase changes. The
only entity that knows what is happening is the model. So the companion's answer
is not a rendering discipline, it is a **contract**: an always-on prompt
addendum teaches the model a line grammar, a streaming sieve lifts those lines
out of display prose before they are ever painted, and the lifted beats feed the
same narration channel the transcript renders. That is an authorship-and-parsing
concern, and it is not covered.

The second half — promotion at settlement — is adjacent to the transcript's
collapse and had to be drawn narrowly. The transcript collapses *one durable
record* into a summary presentation. In-band beats do not start durable: they
arrive on an ephemeral live channel that the next turn will clear. Promotion is
therefore a **write**, with exactly-once, interrupt and failure semantics — not
a change of presentation. That is what this subject owns, and it says so in the
technique body.

**Verdict: NEW is correct.** `chat-transcript` is not missing these; it is
correctly scoped to the document, and a companion contract that spans prompt,
parser, transcript and a second surface would deform it.

## Proposed techniques (7)

1. `progress-beat-grammar` — the always-on addendum, the line grammar, the
   live-tail sieve, beat budgets, and the four ways a beat lies.
2. `narration-promote-on-finish` — promotion as an idempotent write; interrupt
   and failure semantics; what the ephemeral channel owes the durable record.
3. `recall-transparency` — disclosing injected memory *before the turn spends
   it*, the correction door, and the turn-summary chip as forward-facing
   disclosure of what the turn will be remembered as.
4. `model-proposed-quick-replies` — bounded next actions the model proposes, the
   closed-shape contract, staleness, and why a chip is never an action.
5. `two-surface-doctrine` — one companion, two surfaces; the routing rule
   (complete information vs. quick information and decisions); the ambient
   decision bubble's numbered-option / leader-key / "0 = explain and recommend"
   contract as the ambient surface's realization.
6. `show-dont-tell-walkthrough` — the non-dimming, tracking, captioned
   walkthrough a companion improvises, contrasted against the dimming spotlight.
7. `layered-avatar-state-machine` — pre-rendered loops, reactive overlay, chrome;
   a state machine driven by turn events with a legible-degradation floor.

The dispatch listed `ambient-decision-bubble` as an eighth candidate; it is
folded into `two-surface-doctrine`, because the doctrine's whole content is what
the second surface may say and how it is answered, and splitting them produced
two documents that each restated the other's premise.

## The boundary this subject will state

Drafted here, shipped in the golden path:

> `chat-transcript` owns the transcript as a rendered document — the turn as its
> unit, structured rows, the narration thread's collapse, the scroll contract,
> the metadata strip — and this subject owns the **conversation** that document
> records: where narration comes from when nothing observable is happening, what
> the model is taught to propose, what the user is shown about the memory a turn
> is about to spend, and where a companion may speak when the transcript is not
> on screen. The rule for picking: if the question can be answered without
> knowing that the other participant is a model with a prompt, it is the
> transcript's. If answering it means changing what the model is told, or means
> deciding which of two surfaces the user should be looking at, it is this
> subject's.
