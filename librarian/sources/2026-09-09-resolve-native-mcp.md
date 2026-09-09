---
source: youtube:yRxmdTUh7GU
kind: second-hand practitioner review + first-party practitioner account (hybrid, routed per half)
url: https://www.youtube.com/watch?v=yRxmdTUh7GU
title: "DaVinci Resolve 21.1 BEST New Feature TESTED - AI Editing with Claude and ChatGPT"
author: Team 2 Films
words: 3057
extracted: 15
accepted: 2
declined: 0
untriaged: 5
already_covered: 5
leads: 3
applied: 2
shipped: 1
dispatched: 0
run_id: yt-yRxm-0909
siblings: 1 at claim, 4 by Phase 7
fetches: 1 of 3
---

# A vendor ships a native tool server over a single-seat editing application

## Class, and the expected yield said before the table

A **hybrid**, and the two halves have opposite reliability, so they were routed
separately per the class rule.

- The **demo half** is a second-hand practitioner review: a creator showing
  another vendor's release. Organised around a happy path, states no operating
  constraints. Expected yield: catches and one currency signal.
- The **operating half** is a first-party practitioner account, n=1, and an
  unusually good one: they ran the feature against their own long-form projects
  (a 50-minute factory tour, a 15-minute lab tour, a multi-camera film scan) on
  their own network share and their own render pipeline, and reported four named
  API holes, a contention constraint and a blind-modality limit.

**Expected yield stated out loud before triage: LOW-MODERATE — one or two
landings, all from the operating half; several catches; one currency row; zero
subjects.** That is what came in: 2 accepted, 5 catches, 5 untriaged, 3 leads.

The class's second rule held literally. **The segment the demo was proudest of
is where its boundary is missing**: "Incredibly, without prompting, it has noted
that some of the cuts are very short, just one frame... so it's going to ignore
them" [00:07:03] is the most persuasive moment in the video and carries no
statement of what happens when that heuristic is wrong. Every landing came from
the operating half; every catch came from the demo half.

## What the source is

The vendor moved a formerly third-party tool-protocol server into the product
itself. The agent does not drive the GUI — it calls the application's existing
scripting API — so, in the creators' own framing, **"its functionality is limited
by the things you can do using Resolve's API. You can't do everything"**
[00:00:35]. They then hit that ceiling four times on camera and route around it
twice.

## Triage table

Score is `GAIN/RISK/COST`; the read column is the run's own. Rows targeting the
upper layers ran through Phase 5's score. No currency row here needed the
corroboration-table route, because the one currency fact has no clock to reset.

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Read | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | amendment | M | Catalog absence is not containment when the caller holds a second surface | mcp-tools/caller-differentiated-capability | corrects-claim | 2/0/2 | real gap | **accept** |
| 2 | K | technique | M | An ambient selection is not an argument | mcp-tools (golden path, sessions) | new-technique | 3/1/2 | real gap | **accept** |
| 3 | K | technique | M | The host's own semantic index is not on the automation surface | mcp-tools / voice-io | none | 2/2/2 | partial | untriaged |
| 4 | K | technique | M | The report is the reason to automate, not the labour saved | conversation-orchestration/narration-promote-on-finish | none | 1/1/2 | likely catch | already covered |
| 5 | K | technique | M | An agent composes a missing capability from an exposed primitive plus an external binary | — | none | 2/2/3 | partial | untriaged |
| 6 | K | amendment | S | An agent triggers the host's expensive precondition to satisfy a downstream request | — | none | 1/2/1 | partial | untriaged |
| 7 | K | amendment | S | Chunk a long unattended job into resumable units | job-coordination, background-jobs | none | 1/1/1 | likely catch | already covered |
| 8 | K | lead | M | An agent supervises its host application's lifecycle across a crash | fleet-orchestration/hibernation-and-resume | none | 2/2/2 | thin | lead |
| 9 | K | technique | M | A proposal is delivered with margin and a marker of its own edges | — | none | 2/2/2 | partial | untriaged |
| 10 | K | currency | S | A formerly third-party tool server became first-party | mcp-tools | none | 1/1/1 | real | no clock to reset |
| 11 | K | lead | S | The automation surface is gated to a paid tier while the GUI is not | — | none | 1/2/1 | thin | lead |
| 12 | K | technique | S | Agent demand is a forcing function on an application's automation surface | — | none | 1/2/1 | thin | lead |
| 13 | K | practice | S | Procedural work automates; creative work does not | — | none | 0/2/1 | likely catch | already covered |
| 14 | K | technique | S | First-run permission prompts | client-integration | none | 0/1/1 | likely catch | already covered |
| 15 | K | technique | S | Transcription stands in for vision when the index is unreachable | voice-io | none | 1/2/1 | likely catch | already covered |

`auto=2/0/0` `fp=0`. **Zero declined** — the thirteen unaccepted rows are catches,
leads and untriaged, none of them a judgment that the claim is wrong.

**The promoting question was executed on every `partial` row.** Rows 3, 5, 6 and 9
each got one file read against their named prior art; none promoted to `real gap`,
so all four are banked with their anchors rather than filed as declines. Row 9
came closest — no subject owns "a proposal carries margin plus a marker of its own
boundary" — and is the one to revisit first.

**Row 1 was promoted by the promotion read.** It scored 2/1/2 = +1, below the +2
threshold, blocked on nothing but resting on an account the director had not
re-checked. One fetch (the only one spent) settled it and the row landed.

## The two landings

### 1. Amendment — subtraction holds within a surface, not within a host

`caller-differentiated-capability` argues that an agent surface should be a strict
subset of the human's, held **by subtraction rather than by validation**: "a
capability the schema does not accept cannot be smuggled through a check somebody
forgets to run." Its closing sentence: "destructive operations belong off the
agent catalog entirely rather than in a narrowed form of themselves."

The source refutes the sufficiency of that, and does so while presenting it as a
feature. The application's API exposes no function for creating or labelling
colour nodes, so **the agent did it by driving the screen** — "the API does not yet
have functions for creating or labelling nodes. So Claude is using computer
control to add the nodes and label them. That's not me. That's Claude moving the
mouse" [00:13:57] — and then used the API for the rest of the same task. Earlier
it had reconstituted a second missing function by downloading an external binary,
reading the data itself, and writing the result back through the one API call that
*was* exposed [00:03:55].

**The fetch made this a landing rather than an anecdote**, and it returned more
than the video did. The vendor's own documentation for the control surface says
it is **schema-less by construction** — "you don't need to provide an input schema
as with other tools; the schema is built into Claude's model and can't be
modified" — that it is explicitly declared *in the same tool set* as purpose-built
tools in one request, and that its safeguards are **application-level mitigations,
not built-in schema validation**. So the second path is not merely available; it
is undeclarable and cannot be given a dispatch door. Subtraction has nothing to
attach to there.

Landed as an amendment, not a golden-path correction: the file's rule survives
intact and every standing sentence stays true. Written into the file's own "What
this cannot do" enumeration, which is precisely what it qualifies.

### 2. Technique — `ambient-selection-is-not-an-argument`

The subject's whole architecture presumes a server in front of a **service**. This
source is a server in front of a **single-seat interactive application**, and its
most natural arguments are quoted verbatim from the video: *"extract vertical
shorts from the currently selected timeline"* [00:11:00]. That reference resolves
against a variable the caller never set and the server never minted. The golden
path says every request is self-describing and that cross-call state is an
explicit handle — and it lists "a cart, a workflow, **a cursor**", meaning a
pagination cursor. The human's cursor is a different animal: it spans calls, and
the server cannot mint it because it does not own it.

The load-bearing half is not the diagnosis but **what is currently holding the
invariant**. The application is single-threaded against its automation surface, so
while a call runs the operator is locked out — the creators' closing advice is
scheduling advice: *"Resolve will be inaccessible while your AI agent is
processing those prompts. It might be worth running those prompts on a second
computer... If you only have one computer, run your prompts overnight"* [00:18:00].
That reads as a performance limitation and it is one. It is also the only thing
preventing the selection from moving mid-run — an undeclared mutual exclusion that
every release making the surface more concurrent will delete.

`write-freshness-gate` is the near neighbour and does **not** cover it: its proof
is a hash of content the model read, and here the model never read anything. There
is nothing to hash, and nothing went stale — the reference was never fresh.

## Applied (2 of 2 owed) and shipped (1)

Both seams were chosen to falsify, and the pre-check was run on both: a caught
outcome had something to teach in each case.

**Row 1 → pumper, `code`, `better`, `ab-paired`, ship 1 (`531ee02`).** pumper's
MCP feature doc asserts *"an agent cannot ask its way past the operator's rail."*
That is the amendment's claim under test. What a caught outcome would have taught:
that the rail belongs at the engine's admission path rather than at the surface —
a stronger rule than the amendment states, and it would have become its second
half. **Not caught.** `clamp_budget` is private to the MCP module and `enqueue_app`
takes the ceiling as an argument, so the rail is the door's property: the same
input through the REST door (`validate_budget_usd`) returns unclamped, and an
*omitted* `budget_usd` gives the tool caller the operator's rail and the REST
caller **no ceiling at all**. Both doors sit on one unauthenticated listener.

The structural fact is better evidence than the change: **the tree already
documents the asymmetry in its own refusal text** — `routes/jobs.rs:53` tells a
rejected caller to go "enqueue over MCP, where the `[mcp] max_job_budget_usd` rail
treats 0 as a real $0 ceiling". The authors knew; the feature doc's summary
sentence did not say so. Nobody designed that gap — it fell out of putting the
clamp in the surface module.

The REST door was deliberately **not** clamped: the operator is inside the trust
boundary, which is the technique's own reasoning. What shipped is one paired
characterization test pinning the divergence, `mod jobs` widened to `pub(crate)`
so the test can reach the other door, and the doc sentence qualified. **The test
was shown to fail** — perturbing the REST door to clamp turns it red — and the
perturbation was reverted. Gate: 507 passed, 0 failed.

**Row 2 → politicas, `simulation`, `not-better`, `structural-only`, ship 0
(`e279878`, ledger row only).** The seam is `live-wrap.mjs`, whose single-seat
application is a live browser and whose ambient state is which page is open. What
a caught outcome would teach: that a fleet tree already resolves this correctly,
validating the corrective by convergence while refuting the gap. **Caught, and it
refuted a clause of the technique landed forty minutes earlier.**

politicas already holds obligations 1-2 — the browser passes `$event.pageUrl` in;
the tool never reads the current page itself — and holds obligation 3 **more
precisely than the technique stated it**. The technique demanded a typed refusal
on an absent reference, unconditionally. `live-wrap` refuses only when the absence
could change *this* answer: from the source range the caller did name, it computes
whether any pending edit can reach it (`manualEditMayAffectWrap`), refuses by name
with a hint if so, and proceeds silently if provably not.

**The corpus was corrected, not the tree.** Obligation 3 was rewritten in the same
run rather than amended later: the refusal is owed exactly where the missing
reference could have changed the answer, expressed as a predicate over the real
target rather than a policy about the argument. An unconditional refusal would
have made the tool unusable on the majority of calls where no ambient state is in
play — so applying the technique as written would have made this tree worse. Ship
0 is the correct outcome, and it is the most useful row of the two.

## Catches (5)

1. **The narration is the reason to automate** — *"even if this is easy to do
   within Resolve, you might choose to do this using an AI agent because it's able
   to analyze what has been done"* [00:06:11]. A genuine inversion of the usual
   automation argument, and `conversation-orchestration` owns the territory with
   `narration-promote-on-finish` and `progress-beat-grammar`.
2. **Chunk a long unattended render into resumable units** [00:09:39] — and it was
   *operator-supplied* in the prompt, not agent-derived. `job-coordination` and
   `background-jobs` own it.
3. **Procedural work automates, creative work does not** [00:15:16] — the video's
   thesis, and too generic to strip into anything actionable.
4. **First-run permission prompts** [00:01:30] — `client-integration` owns install
   and consent flows in more depth than a passing mention.
5. **Transcript as a stand-in for vision** [00:13:04] — `voice-io` owns the
   transcript lane; the interesting half is row 3's, and it is untriaged.

## Untriaged (5) — banked with anchors, nobody verified these

- **Row 3.** The host holds a semantic index of the media and does not expose it:
  *"currently Blackmagic's API does not expose any of its IntelliSearch data to
  help your AI agent understand the visual content"* [00:16:57]. So the agent
  proxies the missing modality with the one that is exposed — transcribed dialogue
  — and *"Claude cannot watch the footage. It's making these suggestions based
  purely on transcribed dialogue"* [00:13:04]. Every downstream judgment inherits
  that proxy's blind spots and nothing says so. The promoting read found `voice-io`
  and `mcp-tools` both adjacent, neither owning it.
- **Row 5.** Capability reconstitution: agent downloads an external binary, reads
  the data the API would not give it, writes back through an exposed call
  [00:03:55]. The creators note it is *slower* than the manual path it replaces —
  which is the interesting half, and the reason it may not be a technique.
- **Row 6.** The agent triggered transcription of every clip, unasked, to satisfy a
  downstream request [00:07:56] — an agent inducing the host's expensive
  precondition.
- **Row 9.** *"Include 15-second handles before and after the short... Add a
  duration marker that shows the portion of the timeline you are suggesting"*
  [00:11:21]. A proposal delivered with margin plus an explicit marker of its own
  boundary, so the reviewer can move the edge without re-deriving it. No subject
  owns this; the closest read found nothing. **Revisit this one first.**
- **Row 12.** *"Given how popular agentic interaction is likely to become, we think
  we can expect Resolve's API to keep on growing"* [00:00:52] — agent demand as a
  forcing function on an automation surface. Speculation, but a testable one.

## Leads (3)

- **Agent supervises its host application across a crash** — *"Even if Resolve
  crashes, it can spot that, reopen, and problem solve"* [00:10:30]. First-party
  but undemonstrated on camera. *Return when a second independent source describes
  an agent restarting the application it drives, or when a fleet project grows a
  supervised-host seam.*
- **The automation surface is gated to the paid tier while the GUI is free**
  [00:01:00]. *Return when a second vendor prices its tool surface separately from
  its interface — two sightings make it a pattern about how automation is sold.*
- **The API grew in response to agentic demand** [00:00:52]. *Return when a
  changelog can be diffed to show functions added specifically for tool callers.*

## Currency

The formerly third-party tool server for this application is now first-party
[00:00:00]. Real, and a statement about the world the source is reliable for — but
**there is no clock to reset**: the corpus publishes nothing about this product,
so no application dates and no `verified_on` moves. Recorded here and nowhere else.

## Run conditions

1 sibling live at claim (`llmfit-0909`, holding `multi-provider-gateway-plane` and
`status-vocabulary`), 4 by Phase 7, none holding a subject this run touched. Board
check clear immediately before the first write. The `content` lock was taken twice,
each time for a single edit to the golden path, and released.

`build-index.mjs --check` reported `software-engineering/index.json` stale at
Phase 1, before this run wrote anything — a pre-existing tree condition with a
clean `git status`, not caused here.

**Fetches 1 of 3**, ending fifteen consecutive corpus-internal runs. Spent on the
primary for the control surface, which is exactly what the review class prescribes
("the fetch is not corroboration, it is the extraction") — and it was the only
thing standing between row 1 and rejection.
