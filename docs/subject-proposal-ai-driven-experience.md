# Subject proposal - AI-driven experience (`agent-host-experience`, `model-composed-workspace`)

**Status:** **EXECUTED** 2026-11-03 - proposed, forged and reconciled the same day by `/spark ai-driven-ux-golden-standard`; on disk at `knowledge/software-engineering/llm-agent/experience/`. This document is the forge input, not knowledge; where the forged subjects differ from it, the subjects win.
**Bundle:** `software-engineering`
**Category:** `llm-agent`, subcategory **`experience`** ("Agent experience"), new. `runtime-and-io` and `orchestration` are at the cap of ten; the two subjects are the two tiers of one standard and belong side by side.
**Engine:** subject forge - read [`forge-brief.md`](forge-brief.md) first; it is the contract.
**Proof projects:** two Tauri desktop products in the fleet that already let a model drive part of the screen through a closed vocabulary: a money-safety wallet with a conversational board, and a private companion with a composed project report. A third, much deeper product follows after both proofs land.

---

## The gap, measured

The bundle already owns most parts of an AI-driven experience, and each part has a
subject that is good at its job:

| Subject | Owns | Does not own |
| --- | --- | --- |
| `schema-driven-ui` | A spec rendered from a closed registry; one validation door; honest repair; actions as proposals. | Which form an answer should take; where on the screen a composed view may go; what happens to the user's own arrangement. |
| `chat-transcript` | The transcript as a document: turns, structured rows, markdown door, narration, scroll. | The transcript as the *conductor* of a workspace beside it. |
| `streaming-output` | Buffering, throttling, phases, cancellation, run attribution. | How a component materializes while its arguments stream; the order of mixed parts. |
| `conversation-orchestration` | A resident companion: two surfaces, quick replies, structured visual replies inside the chat, show-don't-tell walkthrough. | A multi-module product where the model composes views across modules. |
| `motion` | A motion system: presets, budgets, reduced motion, continuity. | What is specific to model-originated change: text reveal, materialization, model-made rearrangement, provenance. |
| `mcp-tools` | The tool protocol as wire, security and schema (22 techniques). | The product's *experience* inside an agent host: views rendered by the host, inline limits, handoff to the full product, peer-agent delegation, the agent-to-UI event stream. |

Nothing composes these into the experience itself, and two whole questions have no home:
how a product presents itself *inside someone else's agent host*, and how a model may
*take control of a multi-module screen* without destroying the user's sense of place.
Research for this proposal lives with the spark run (two web lanes with mandatory
counter-evidence, 2026-11-03); the forger is handed both digests.

## The standard in one paragraph

An AI-driven experience has two tiers. **Outside**, the product is a capability that other
people's agents operate: a handful of journey-shaped operations that work as text
everywhere, a small view where seeing beats reading, and a handoff to the full product for
depth and for anything irreversible. **Inside**, the model is the conductor of a screen
that keeps its shape: it chooses the form an answer takes, composes into a designated
region and never moves what the user relies on, treats the user's own arrangement as a
standing instruction, makes every change reversible and visible, narrates real work, and
is measured on whether it chose the right view - including the times it should have chosen
none.

---

## Subject 1 - `agent-host-experience` (the external tier)

**Definition.** How a product exposes itself to agents it does not control - general
assistants, coding agents, other organizations' agents - so the agent does the heavy
lifting and the product still owns its look, its depth and its consent. Routes into
`mcp-tools` for wire, schema and security mechanics; owns the *experience* decisions.

`use_when` candidates: deciding what a product's tool surface for outside agents should
contain; adding a rendered view to a tool; a task that starts in an assistant and must
finish in the product; choosing between tools, a rendered view, a declarative spec and a
peer agent.

### Techniques (6)

1. **`journey-shaped-tool-surface`** - Operations are the user's journeys, not the API's
   nouns: a handful of clearly named operations that each finish something, a concise and
   a detailed response mode, pagination and filtering for anything that lists. Model-visible
   versus view-only operations is a design decision (data the view needs and the model
   should not choose stays view-only). The product's own agent and outside agents use the
   same door with different grants (route to `first-party-agent-is-a-principal`). Must
   carry: why mirroring the API produces a fuzzy surface the model navigates badly; the
   counter-case where a thin read operation is right; the context cost of a large catalog.
2. **`in-host-views`** - A rendered view earns its place only when seeing or manipulating
   beats reading (picking, comparing, confirming, visualizing); never to compensate for a
   vague operation. Every operation that has a view still returns a complete text result
   and a structured result, because some hosts never render. Inline limits that two host
   families publish independently (at most two actions, about five data points, no nested
   scroll, no menus, no second composer); escalate to fullscreen for depth; language
   understanding goes through the host's chat, direct manipulation stays in the view. Use
   only the standard host bridge and detect extras at run time - hosts diverge feature by
   feature, including which safety hints they honor. Declare every network origin; the
   view-to-model channels are injection surfaces and are treated as untrusted input.
3. **`depth-handoff`** - The host gets a glimpse; the product owns depth. A link back into
   the full product carries an opaque, expiring handle to the exact state, never the state
   itself and never a credential. Irreversible and money-bearing acts complete in the
   product's own consent surface or through an out-of-band, user-bound confirmation;
   secrets and payment details never pass through a form the model or host can read.
   Must carry: what may finish in-host versus what must hand off, and the rule that a
   destructive hint is advisory, so confirmation is enforced by the product.
4. **`agent-ui-event-stream`** - When the product hosts its own agent front end, one typed
   event stream carries run lifecycle, text deltas, tool-call start/arguments/result,
   state snapshot and delta, and activity; snapshot replaces, delta patches. The same
   stream feeds every surface (main window, second window, phone) and a cross-vendor
   format is preferred when the backend may change. A trusted server sits between the
   browser and the agent: only user text is input; every other client-supplied field
   (tools, state, context, thread id) is untrusted. Not how a product appears inside
   someone else's host - those hosts speak the tool protocol.
5. **`portable-view-spec`** - Choosing between a declarative view spec (the host renders
   it with its own approved components: consistent, safe, bounded by the catalog) and an
   embedded app view (full fidelity in a sandbox, at the cost of visual disjointment and
   lag). The product's in-app closed vocabulary is the single authority; any interop
   spec is a projection of it at one boundary, never a second vocabulary (route to
   `emitter-registry-sync`). Must carry: the trust trade, the expressiveness ceiling, and
   why a pre-1.0 interop format is projected to, never designed around.
6. **`peer-agent-delegation`** - When the product should be a peer agent another agent
   delegates to (long-running work that needs the product's own reasoning and policy,
   across organizations, with a task lifecycle including input-required and auth-required)
   versus a capability the caller's agent stays in control of (the default). Signed agent
   description, human approval for critical acts, and session-smuggling awareness; never
   ship a peer agent instead of tools to reach general assistants. Must carry the honest
   counter-evidence: implementation burden often exceeds the benefit.

**Applications (1-3):** the wallet's role-scoped tool server (journey operations per agent
role, refusal as structured error, no money-moving tool; deviations: an old protocol
revision, no views, POST-only despite the stated streaming transport) and the companion's
daemon stream (one typed turn-event stream feeding two windows and a phone page).

---

## Subject 2 - `model-composed-workspace` (the internal tier)

**Definition.** Inside a product with several feature modules, the model does the heavy
lifting and takes control of a screen to render what the user needs from many modules in
one sight - through a chat or command surface that conducts a workspace. Routes into
`schema-driven-ui` (vocabulary, validation, consent), `chat-transcript` and
`streaming-output` (transcript and stream mechanics), `motion` (the motion system) and
`conversation-orchestration` (companion specifics); owns the composition decisions.

`use_when` candidates: letting a model open, arrange or filter views across modules;
deciding whether an answer is prose, a card, a pane or a composed workspace; a
model-arranged screen that users stop trusting over a session; measuring whether the
model chose the right view.

### Techniques (7)

1. **`answer-form-routing`** - The form of an answer follows what the answer is: prose for
   a fact or a how-to (extra structure is extra load); an inline card for one decision or a
   small structured set; a persistent pane for anything edited, reused, referred back to or
   longer than a screen; a composed workspace for comparative, quantitative or explorable
   work across modules; navigation when the destination already exists. A card that would
   need more than two actions or any internal navigation is a pane. Must carry the
   counter-evidence: generated interfaces win on preference only where data is
   comparative or interactive, and lose on simple questions and on generation time.
2. **`composition-region`** - Copy, do not move. Navigation, module chrome and primary
   actions are fixed; the model composes only into a designated region, in slots and
   spans of a declared grid, never coordinates. "Open" creates a view in the region and
   leaves the source module where it was, so the old path always works. A composed view
   is made of module views each module publishes as a composable unit with its own empty
   and error state; the model selects and binds them, it never writes their numbers.
   Must carry: why a moving layout saves clicks on paper and loses in practice, and the
   opposing finding that accuracy matters more than predictability - stable chrome plus an
   accurate region holds both.
3. **`arrangement-memory`** - The user's pins, resizes, sorts, groupings and dismissals
   are standing instructions to the next composition, scoped to the task, inspectable, and
   expired at a task boundary. Without them, approval of model-made structure collapses
   over a session; with too many, stale rules leak across sub-tasks. User beats model,
   always; a pinned view survives recomposition.
4. **`reversible-screen-ops`** - The model changes the screen only through a closed set of
   verbs (show, focus, filter, navigate, highlight, propose) and every applied step has a
   one-step undo and a visible "what changed" line. Stop halts at once and restores the
   arrangement the user last saw; an ambiguous intent gets a question or a smaller view,
   never a rearrangement; a user's manual action supersedes a pending model op. Proposals
   arm only through consent (route to `action-consent-wiring`).
5. **`conductor-turn-flow`** - The flow of one turn as the user lives it: acknowledge in
   under about a second, narrate real steps rather than a wordless spinner, never add delay
   to seem thoughtful, put the essential answer first in short paragraphs, render text and
   components in the order they were emitted, offer two or three specific follow-ups below
   the answer, refuse by diverting (what is out of scope plus the nearest thing it can do),
   and keep the composer present in the workspace so the conversation keeps driving the
   view. Routes to `progress-narration`, `composer-turn-queue` and `mid-turn-steering` for
   mechanics.
6. **`composition-motion`** - Motion specific to model-originated change: text revealed by
   word or phrase with a short fade, segmented by locale, stripped when the message
   settles; a streaming component reserves its final footprint and fills in place; a
   model-made rearrangement animates only what changed with one shared-element transition
   per moved view, and cross-fades or cuts under reduced motion; a calm budget so a
   constantly changing surface still rests. Provenance: model-originated content carries a
   labelled marker with an explanation, never an icon alone, and reverts to the ordinary
   style when a person edits it. Routes to `motion` for the system itself.
7. **`view-choice-evaluation`** - A labelled set of intent plus data shape mapped to the
   expected form (component, layout, navigation or no UI at all), scored for schema
   validity, exact choice and field relevance with a judge calibrated against people;
   negatives are first-class and false-trigger and missed-trigger rates are reported
   separately; whole sessions are evaluated for drift (acceptance early versus late,
   rearrangements the user undid); seeded wrong outputs measure whether people catch
   errors, because explanations and sources can inflate trust.

**Applications (1-3):** the wallet's board (closed op vocabulary show/focus/filter/propose,
one validation door with disclosed drops, consent box and undo; deviations: one panel
only, no streaming, no eval) and the companion's project report (closed block kit on a
twelve-column grid, pins that survive recomposition, the model never writes a number;
deviation: the kit never reaches the chat, whose prose is unformatted).

## Out of scope

- The wire, schema, transport and security of the tool protocol itself (`mcp-tools`).
- Building a component vocabulary and its validator (`schema-driven-ui`).
- Avatar and presence of a resident companion (`conversation-orchestration`, `talking-avatar`).
- Visual taste of any one product: that is decided per product by a blind design contest
  over this standard, and the winners return as applications.
