---
source: github:Sylinko/Everywhere
kind: first-party practitioner account, repository form - design-deep
url: https://github.com/Sylinko/Everywhere
title: "Everywhere - on-screen aware desktop AI assistant"
author: Sylinko
commit: a4345a51761d5177eb73c16ce36bea5e9adb2c2f
words: 1279 (landing page) / 39237 (in-tree design documents)
extracted: 13
accepted: 1
declined: 0
leads: 0
already_covered: 0
untriaged: 12
dispatched: 0
applied: 1
shipped: 1
run_id: everywhere
siblings: 2
---

# Everywhere - a system read as a system, landing one amendment

Ingest returned the rendered landing page: 1,279 words. The tree holds **39,237
words** of in-tree design documents across five numbered series - ScreenPicker
(4 chapters, narrative, with every rejected approach written down),
StrategyEngine (12,162 words), PromptManager, SettingsEngine, Terminal - plus
`AGENTS.md`, `DATA_AND_PRIVACY.md`, a 9,028-word CHANGELOG and a
dependency-patching architecture document. The ingest was 3% of the source and
the wrong 3%. Swept per Phase 2b: operating documents first, then the
instrument (`UIAutomationHelper`, `OpenAICompatibleToolSchemaTransformer`), the
tests, the types, the README last.

Two siblings were live on the board at claim time (`fluxer`, `jetkvm`); neither
held a subject this run touched. The index was already stale at Phase 1 for
files this run does not own, and was left that way at Phase 10 - see below.

## Design record

Grouped by the system each decision belongs to, per Phase 2d v2.2. The
`corpus:` line is the routing count.

### System A - picking an on-screen element from underneath an overlay

**A1.** *decision:* the overlay is made invisible to the accessibility layer by
setting a window property that layer's own traversal reads, rather than by
being made transparent to input.
*forces:* the standard hit-test API is global and returns the topmost element,
which is the overlay itself; suppressing the overlay's own automation provider
yields an empty node, still the overlay.
*buys:* the documented, supported hit-test API works unchanged, with no hooks,
no synthetic input and no private function pointer.
*rejects:* input-transparency plus a global low-level mouse hook - which broke
under privilege-elevation dialogs (the hook goes silent holding a synthetic
button down, leaving the user's real mouse button stuck) and fought third-party
hook-installing tools; and compositor cloaking, whose effect is asynchronous
and produced 16-33 ms of visible flicker per mouse-move.
*where:* `docs/ScreenPicker/04-The-Overlay-Occlusion-Problem.md`.
*stage:* overlay show, before the first hit-test.
*corpus:* **NONE.** Nearest: `client-architecture/native-shell-integration` >
`non-stealing-overlay`, which models the focus and click axes exhaustively and
says "judge a teardown by what remains *clickable*, not by what remains
visible" - a two-item enumeration that omits *queryable*.
HOME IF NEW: `software-engineering/client-architecture/native-shell-integration`

**A2.** *decision:* treat the overlay as a perturbation of the thing being
observed, not merely as an occluder of it.
*forces:* a browser-engine application watches for opaque occluders and, on
seeing one, hibernates its renderer and **reparents the accessibility provider
out of the window subtree being queried**, leaving an inert compositor
placeholder behind. The query then returns only a root element, and the cause
is invisible from the query site.
*buys:* deep picking works over browser-engine applications, which are a large
share of the target population.
*rejects:* faking non-opacity with a layered window at alpha 254 - which fixes
the browser-engine case and does nothing for owner-drawn native windows.
*where:* same document; diagnosed with a quarter-screen test rig that doubled
the cursor coordinates so the picking path exercised the full coordinate space
while the target stayed unobscured.
*stage:* the same one.
*corpus:* **NONE**, same neighbour.

**A3.** *decision:* reach an unexported function by scanning the module for its
telemetry trace string and walking back to the prologue past the inter-function
padding.
*forces:* symbol-server lookup costs a network round trip and ~50 ms per call
on a path that runs per mouse-move; hardcoded vtable offsets had already
shifted across OS releases.
*buys:* deterministic cross-version resolution, ~20-50 ms once at startup, with
a null fallback to the global API.
*rejects:* both of the above.
*where:* `docs/ScreenPicker/02`, `03`.
*corpus:* **NONE.**
*note - the finding inside the finding:* A1 made A3 unnecessary. The team spent
chapters two and three building a scoped replacement for an API, and chapter
four found a metadata property in the subsystem being queried that removed the
need for any of it. The generalizable rule is the ordering: **when the
instrument perturbs the system, look for the observed subsystem's own opt-out
before building a scoped replacement for its interface.**

*Routing:* 3 NONE, home exists -> technique triple inside an existing subject.

### System B - an injected command-boundary protocol over a third-party shell

**B1.** *decision:* once the marker protocol reports a command started, silence
is not completion; only the completion marker, a timeout, or the stream ending
finishes a run.
*forces:* a ten-second sleep produces no output. The previous build treated 2.1
seconds of quiet as done, killed the pseudo-terminal, and returned only the
first line of a three-line script.
*buys:* correct output and exit codes for long-silent commands.
*rejects:* idle-based completion **on the protocol path** - it remains correct
on the fallback path, which is the whole subtlety: the heuristic was not wrong,
its *completion authority* survived the promotion to the protocol tier.
*where:* `docs/Terminal/00`, `03`.
*corpus:* **NONE.** Nearest: `terminal-multiplexing` > `occupant-state-detection`,
which owns the no-hooks case and explicitly says that where the occupant emits
lifecycle events this technique should not be built at all. Neither it nor
`fleet-orchestration` > `lifecycle-signals` models running both tiers over one
stream, which is the case an *injected* integration creates.
HOME IF NEW: `software-engineering/llm-agent/runtime-and-io/terminal-multiplexing`

**B2.** *decision:* detection waits for the readiness marker, not the first
sighting of the protocol.
*forces:* shells emit a stray completion marker and a prompt-start marker
during startup; a detector that trusts any marker declares the protocol
available before the line editor accepts input, and the first command is lost.
*corpus:* **NONE**, same home.

**B3.** *decision:* a readiness marker is emitted *after* the input mode it
advertises is actually enabled, which moved it out of the prompt string into a
line-editor init hook.
*forces:* emitted from the prompt, the marker arrived while the parser still
saw bracketed-paste mode disabled - the detector believed a capability that was
not yet there.
*corpus:* **NONE**, same home.

**B4.** *decision:* detection is not a permanent verdict - the protocol path
keeps the heuristic fallback for mid-execution loss.
*forces:* history expansion, a user rc file, or a script error can swallow the
command-start marker after detection succeeded.
*corpus:* **NONE**, same home.

**B5.** *decision:* an injected integration re-converges its invariants every
prompt cycle.
*forces:* the wrapper rc sources the integration script and *then* the user's
own rc, which can override history and prompt settings.
*corpus:* **NONE**, same home.

*Routing:* 5 NONE, home exists -> technique cluster inside an existing subject.
Worth noting the shape: this is the missing **tier two** between "the occupant
emits lifecycle events" and "the occupant emits nothing" - hooks you inject
into a third party, and the arbitration between the tier you installed and the
tier you fell back to.

### System C - context-action recommendation

**C1.** three-valued conditions where a timeout or an unavailable provider
returns null, with composite operators defined so that `none` over an
unevaluable child returns null - absence can never satisfy a negative check.
*corpus:* **PARTIAL** - the law `unknown-is-not-a-value` owns the principle and
`recruiting` holds an instance under a different bundle; the composite truth
tables are the part neither carries.
**C2.** required context is inferred by walking the condition tree, so there is
no `requires` section to drift. *corpus:* NONE; nearest `dependency-declaration`.
**C3.** the authoring surface names capabilities, never providers; provider
identity appears only in diagnostics. **C4.** versioned authoring model split
from the runtime model with a hand-written normalizer as the semantic boundary,
explicitly rejecting reflective mapping. **C5.** built-ins are not overridable;
a user creates a new id at higher priority. **C6.** skills are injected as an
index of resource URIs, never bodies; no execution, no auto-granted tools.
*Routing:* 1-2 NONE -> stays in intake.

### System D - settings as a document to patch

**D1.** the JSON document is the source of truth and the runtime object is
*patched* from it, because a settings file behaves like a user document rather
than a payload: whole-graph replacement drops keys written by other versions
and breaks live bindings. Prune is opt-in per subtree.
*corpus:* PARTIAL - `operations/governance-and-records/settings` (10 techniques)
does not appear to model document-preserving patch binding.
*Routing:* 1 -> stays in intake.

### System E - the dependency-patching ladder

**E1.** four strategies chosen by dependency shape: fork-and-submodule; mirror
shadowing (reference the unmodified tree file by file, substitute only what
changed, and let the mirror masquerade as the package reference); runtime
hooking; compile-time IL weaving.
**E2.** *decision:* runtime IL injection was abandoned for compile-time
weaving. *forces:* **not correctness - distribution.** Runtime injection trips
antivirus heuristics and the modified assemblies cannot inherit the
application's signature. Weaving produces ordinary statically-modified binaries
that carry the app's signature and are transparent to CI.
**E3.** mirror shadowing was chosen over a private feed (contradicts the
open-source posture), over publishing customized builds to the public feed
(pollution), and over mounting the whole source (CI build time).
*corpus:* **NONE for the mechanism ladder.** `supply-chain` >
`vendored-fork-ledger` owns the *record* a fork owes; nothing models which
patching mechanism to reach for or why. The distribution force is unmodelled:
`antivirus`, `Defender`, `false positive` return zero across the corpus.
*Routing:* 2 -> stays in intake.

### System F - provider-portable tool schemas

**F1.** *decision:* a schema constraint the target endpoint's accepted subset
cannot carry is **lowered** to a portable equivalent where one exists, and
**demoted into the description** where none does - never silently dropped.
*where:* `src/Everywhere.Core/AI/OpenAICompatibleToolSchemaTransformer.cs`.
*corpus:* has a home and a rule that **denies this case** - see below.
*Routing:* 0 NONE -> boundary case -> amendment.

### The routing decision

Whole tree: ~13 entries with no corpus home. Per system, the two large clusters
are 3 and 5 - both above the threshold, and **both name an existing subject as
their home**. No cluster's `HOME IF NEW` is new, so **the XL trigger does not
fire and no forge handoff was dispatched.** That is worth stating plainly: this
repository is a system, its design is dense, and it lands *inside* subjects the
corpus already drew rather than beside them. The count is a statement about how
well `native-shell-integration` and `terminal-multiplexing` were scoped.

## The pick

The operator picked row 8 alone and lifted the cross-repo gate as a standing
rule. Rows 1-7 and 9-13 are **untriaged, not declined** - nobody verified them,
and the design record above is written so a later run diffs against it instead
of re-deriving it.

### Accepted - `tool-schema-design`, amended

`mcp-tools` > `tool-schema-design` states: *"Constrain in the schema, not the
prose … a constraint that lives only in the description is enforced only by
luck"*, and then names its single exception - *"Conditional requiredness is the
one constraint that leaves the schema"* - carving the boundary explicitly:
*"Formats, ranges, enums and unconditional requiredness stay in the schema."*

That is an enumeration with one member, and the source demonstrates a second,
structurally different one. The transformer must remove precisely formats and
ranges - twenty-one keywords including `pattern`, `format`, `minimum`,
`maxItems`, `multipleOf`, `uniqueItems`, the conditional triple - because the
target endpoint accepts a narrower subset than the schema was authored in.
Applied literally there, the rule yields the worst outcome available: the
constraint is enforced by nobody **and** invisible to the model, which is
weaker than the prose the rule was steering away from.

The mechanism read out of the code, not the doc comment: an **allowlist** of
structurally-passed keywords (so an unrecognized keyword is silently dropped -
the third rung, failing quietly); an exact **lowering** that keeps enforcement
(`const` to a one-member `enum`); a **demotion** of a named list into
`description`; redundancy elision (a key-name schema saying only "keys are
strings"); and reference-integrity validation running *after* pruning, because
pruning is the operation that orphans a definition, and *before* the request
leaves. Alternation is merged into the one form the subset accepts, losing
exclusivity, and that downgrade is recorded nowhere.

Corroboration: real code in a tree that was opened, plus a second independent
tree (below) that reached the same discipline from the publisher side. **Zero
of three fetches spent** - the class corroborates corpus-internally, as the
method predicts for a practitioner codebase.

## Applied - `tracklight`, mode `code`, verdict `better`

Seam: `crates/contract/src/mcp.rs`, the generated tool catalog. The measurable:
**published parameters carrying a server-enforced value constraint that reaches
neither channel.**

The catalog was dumped and counted rather than sampled: 64 tools, 203 top-level
parameters, and the entire published surface uses **six** schema keywords -
`type`, `description`, `properties`, `required`, `enum`, `items`. No numeric or
string bounds anywhere.

**The tree turned out to be ahead of the registry**, which is what the round-9
focus item asked runs to watch for. It demotes constraints into prose as house
style and does it well - a projection horizon reads "default 14, 1..=90"; its
history sibling reads "clamped to 4..=90 - below the evidence floor a trend
cannot be presented"; a window start reads "an RFC3339 instant, or a relative
30m / 24h / 7d"; a rolling window stays a real `enum` because the subset
carries it. The registry's rule as written would have graded all of that wrong.
So the tree became a source: **demote the reason with the bound** is
tracklight's discipline, not Everywhere's - the latter emits a bare
`Constraints: minimum=1, maxItems=10.` - and it is now the amendment's second
paragraph.

Arm A: one parameter of 203 broke the pattern. `create_benchmark.baseline_score`
published as `{"type":"number","description":"the mean a run must not fall
below"}` while the handler rejects anything outside `0.0..=1.0` because run
means are normalized. No unit in the prose, no bound in the schema: a caller
reasoning in percentages sends `85` and reads a rejection it cannot trace.
Arm B: the bound, the normalization and the disambiguation in the description,
following the house pattern. **A = 1, B = 0**, both arms with green gates (21
contract tests, 58 server tests), the pinned contract unmoved.

**The structural fact the tree proves without being built to:** the pinned
contract covers argument names, types and required sets, and **not**
descriptions. A surface that routes its load-bearing constraints into prose as
policy has routed them into the one part of the published surface with no drift
guard - every `1..=90` in a description mirrors a clamp in a handler, and
nothing will notice when one of them moves. Demotion trades silent
non-enforcement for silent drift. That is the amendment's second discipline and
it came from the tree.

## Untriaged

Recorded with anchors, unverified, nobody said no to them. Rows 1-3 (System A,
three techniques for `native-shell-integration`), rows 4-7 (System B, the
protocol/heuristic tiering cluster for `terminal-multiplexing`), row 9 (System
E, the patching ladder and its distribution force), row 10 (System D), rows
11-12 (System C). The design record above carries each one's forces, rejected
alternative and file anchor.

## Notes for the next run over this tree

- `research-ingest` on this URL returns the advertisement. Clone it.
- The ScreenPicker series is the densest thing here and it is a *narrative*:
  every rejected approach is written down with the reason it failed, which is
  the rarest thing a repository offers and the reason System A's record was
  cheap to build.
- Two of five doc series are written in Chinese (StrategyEngine, Terminal);
  they are the two largest. A sweep that reads only English documents will
  report this tree as half its size.
- The index was left stale at Phase 10: regeneration under the lock picked up
  eight techniques and six applications belonging to live siblings, so
  `index.json` and `catalog.json` were deliberately not committed.
