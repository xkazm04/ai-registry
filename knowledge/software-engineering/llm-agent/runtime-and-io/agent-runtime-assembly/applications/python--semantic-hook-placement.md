---
layer: application
type: application
subject: agent-runtime-assembly
technique: semantic-hook-placement
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# Semantic hook placement in the deer-flow harness

How a LangChain/LangGraph agent harness — ByteDance's deer-flow, at commit
`08b27aef`, read from its own clone — realizes placement classes, one
composition point, and compose-time ordering invariants over a middleware
chain that wraps the model call and the tool call. Every path below is under
`backend/`; the module guides (`AGENTS.md`) are the tree's own source of
truth for agent guidance and are cited as such.

## The chain, and why order is a contract

The lead agent's middleware list is assembled "in strict order across three
functions": a shared runtime base, then lead-only middlewares appended
after it (`packages/harness/deerflow/agents/middlewares/AGENTS.md:5`).
LangChain's composition rule makes the first list item the outermost
wrapper (`packages/harness/deerflow/extensions/stack.py:10`), so list order
is nesting order. The guide states the technique's headline invariant in the
tree's own words: `ToolReceiptMiddleware` "is the **outermost `wrap_tool_call`
layer** — registered ahead of entries 9-12 — because
Guardrail/SandboxAudit/ReadBeforeWrite/ToolProgress can short-circuit a call
with their own ToolMessage ...; an inner receipt layer would silently gap the
ledger on those results" (`middlewares/AGENTS.md:70`). The other two
invariants the technique names are there too: the write-freshness gate "sits
outside ToolProgressMiddleware and ToolErrorHandlingMiddleware so a blocked
write returns immediately without consuming a ToolProgress slot"
(`middlewares/AGENTS.md:68`), and `InputSanitizationMiddleware` is "first,
so it is the outermost `wrap_model_call` wrapper; every inner middleware
(including LLM retries) sees sanitized messages" (`middlewares/AGENTS.md:39`).

## Placement classes instead of indices

The public extension contract (`packages/extension-api/`, which "must never
import `deerflow`", `extensions/AGENTS.md:138`) defines the class vocabulary
as a string enum: `MODEL_LOGICAL`, `MODEL_PHYSICAL`, `TOOL_VISIBLE`,
`TOOL_RAW`, `STANDARD`
(`packages/extension-api/deerflow_extension_api/placement.py:20-38`). A
contribution is a `MiddlewarePlacement` carrying `scope` (lead, subagent,
both) and an integer `order` beside the class (`placement.py:53, 69-70`).
The guide's framing is the technique's: contributions "declare lead/subagent
scope, stable order, and a semantic placement ... rather than a fragile list
index" (`extensions/AGENTS.md:142-144`).

Classes resolve to positions through an **anchor table** keyed on host
middleware classes: `MODEL_LOGICAL` is `outer_of(LLMErrorHandlingMiddleware)`
— "outer of the retry loop, so one logical decision stays one event even
when LLMErrorHandlingMiddleware retries underneath"; `TOOL_VISIBLE` is
`outermost()`; `MODEL_PHYSICAL` and `TOOL_RAW` are `PlacementAnchor.of(...)`
chains of alternatives ending in `innermost()`
(`extensions/stack.py:33-76`). The comments on those anchors are the
technique's "anchors are re-read when the host appends hooks" rule in the
form of two incidents: `TOOL_RAW` is "deliberately NOT
`inner_of(ToolErrorHandlingMiddleware)`" because two later-appended
middlewares also wrap tool calls, "so anchoring there left two wrappers inner
of 'raw' and the placement silently stopped meaning what it says"
(`stack.py:57-61`); and `MODEL_PHYSICAL` is deliberately not `innermost()`
because `ClarificationMiddleware` sits inside that point and "moving the
anchor past it would change what 'the final request' means"
(`stack.py:43-46`). The subagent scope gets its own anchor table derived from
the base by `snapshot()` with `MODEL_PHYSICAL` re-anchored inside the
coalescing middleware (`stack.py:120-131`).

The injector refuses rather than defaults: an invalid placement value is an
error diagnostic (`extensions/injection.py:61-63`), and a class with no
configured anchor is an error naming the placement
(`injection.py:100-102`). When a class resolves through a *secondary* anchor
because the primary anchor middleware is absent from this stack, the
injector emits a warning that "the observation semantics of this placement
may differ from its documented guarantee" (`injection.py:104-107`) — the
degraded-guarantee report the technique now carries as an upward lesson from
this tree. And `middleware_implements()` is the per-hook-chain rule in code:
"Placement guarantees are per hook chain, not per list index: a
middleware's position only means something on the chains it participates
in" (`stack.py:180-186`).

## One composition point

`compose_with_extensions()` is "the single final composition point"
(`extensions/AGENTS.md:144-145`): "Call this once, at the end of the
outermost builder. Calling it inside the base builder would place
MODEL_PHYSICAL contributions above the ~18 lead-specific middlewares
appended afterwards" (`stack.py:134-145`). It merges contributions via
`inject_middlewares`, records diagnostics, and then runs
`assert_ordering(result, provenance)` on the fully composed list
(`stack.py:157-169`) — and it runs `assert_ordering` even when there are no
contributors at all (`stack.py:150-152`), so the host's own order is checked
on every build.

## Validated invariants, with blame

`extensions/ordering.py` "replaces hand-written index comparisons" with
declarative `OrderingConstraint(outer, inner, reason)` records
(`ordering.py:1-24`). Its docstring states the severity argument the
technique adopted: "A broken invariant is the one hard failure in this
system: unlike a missing observation, it produces wrong behaviour without an
error" (`ordering.py:7-8`). `assert_ordering` skips a constraint when either
side is absent, and on violation raises with both class names, both index
sets, the reason, and "Contributed by:" the extensions whose middlewares sit
at the violating indices, resolved through the provenance map the injector
returned (`ordering.py:36-57`). Isolation wrappers are unwrapped to `.inner`
before matching (`ordering.py:27-33`), so a contributed hook is checked as
what it is.

The core constraint table is the invariant list: `ToolProgressMiddleware`
and `ToolReceiptMiddleware` each outer of `ToolErrorHandlingMiddleware`
because they read the meta it stamps, and `ToolReceiptMiddleware` outer of
every short-circuiter — `GuardrailMiddleware`, `SandboxAuditMiddleware`,
`ReadBeforeWriteMiddleware`, `ToolProgressMiddleware` — with the reason
"those results never get a receipt and the ledger silently gaps"
(`ordering.py:86-110`).

## The deferred-call rule, kept in one file and broken in the next

The guide's rule for the import cycle between `extensions/` and
`agents.middlewares` is precise: both tables "resolve on first use", and
"Defer by deferring the *call*; do not fake a resolved value with a lazy
container subclass, which reports one answer when iterated and another when
measured" (`extensions/AGENTS.md:148-155`). `core_ordering_constraints()`
follows it — a `@cache`d function whose docstring records the predecessor
defect: a `tuple` subclass overriding only `__iter__` "reported an empty
sequence while iteration yielded the real constraints"
(`ordering.py:60-78`).

**Deviation.** `stack.py` does the thing the guide forbids.
`PLACEMENT_ANCHORS = _AnchorTable()` is a lazy `dict` subclass that populates
itself in `__getitem__`, `get`, `__iter__` and `__len__`
(`stack.py:79-117`), and its own `snapshot()` docstring admits the hazard the
guide describes: "CPython's `dict(subclass)` fast path can copy the
underlying storage without calling this class's lazy `__iter__` or
`__len__` hooks. Callers that need a copy must therefore force resolution
explicitly" (`stack.py:106-114`). The subagent path uses `snapshot()`
correctly (`stack.py:126`), so the tree is not wrong today; it is one
`dict(PLACEMENT_ANCHORS)` away from the ordering.py incident. The standard
stays: defer the call.

## Reconciliation summary

Confirmed: placement by class, scope and order rather than index; one
composition point at the end of the outermost builder; anchors keyed on host
hooks with reasons, re-anchored per scope; compose-time validation of
declarative wrapping relations with blame; receipts outermost of every
short-circuiter, write gate outside progress accounting, sanitization
outermost of retry; isolation wrappers unwrapped for matching. Upward
lessons taken into the technique: guarantees are per hook chain; a
secondary-anchor resolution is reported as a degraded guarantee; the blame
names the contribution; the severity argument. Deviation: `_AnchorTable` is
the lazy container the guide forbids, mitigated by `snapshot()` at its one
copying call site. Not present by scope: a compose-time refusal of a
contribution that declares two classes — the contract's one-class-per-
`MiddlewarePlacement` shape makes it unrepresentable rather than refused.
