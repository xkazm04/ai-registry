---
layer: application
type: application
subject: multi-provider-gateway-plane
technique: strategy-tree-with-inherited-policy
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@22
---

# One recursive function carries the whole tree

`Portkey-AI/gateway` at `669825cbe89ee51569918b8f78a9db486fd69dd4` implements the
strategy tree in a single mutually recursive function,
`tryTargetsRecursively` (`src/handlers/handlerUtils.ts:476`), whose parameters
are the whole technique: a target node, the request, a `jsonPath` string that is
the node's address, and an `inheritedConfig` object that is the ancestors'
resolved policy. Every strategy is a case in one switch over
`currentTarget.strategy?.mode`, and every case's recursive call passes a longer
`jsonPath` and the merged config down.

## The structure is recursive in the schema, not only in the code

`src/middlewares/requestValidator/schema/config.ts:79` is the line that makes the
whole design possible:

```ts
targets: z.array(z.lazy(() => configSchema)).optional(),
```

A target *is* a config. So the four strategy modes declared at `config.ts:14-37`
— `single`, `loadbalance`, `fallback`, `conditional` — compose without any new
vocabulary, and `fallback(loadbalance(a, b), c)` is expressible because the
inner node is an ordinary config that happens to have targets of its own. Every
execution-policy key sits on the same node as the strategy: `cache` (`:53`),
`retry` (`:67`), `request_timeout` (`:80`), `forward_headers` (`:82`),
`strict_open_ai_compliance` (`:126`), the hook arrays (`:96-118`).

## Three merge modes, in twelve lines

The standard's merge/replace/convert-once distinction is visible in one block at
`handlerUtils.ts:491-537`, and the tree answers each key explicitly rather than
handing everything to one spread:

```ts
overrideParams: {
  ...inheritedConfig.overrideParams,
  ...currentTarget.overrideParams,
},
retry: currentTarget.retry
  ? { ...currentTarget.retry }
  : { ...inheritedConfig.retry },
cache: currentTarget.cache
  ? { ...currentTarget.cache }
  : { ...inheritedConfig.cache },
```

`overrideParams` merges per entry, child wins (`:493-496`). `retry` and `cache`
**replace wholesale** (`:497-502`): a child that declares `{attempts: 1}` does
not inherit the parent's `on_status_codes`, which is exactly the
interdependent-object rule and the reason the technique separates the two modes.
And the convert-once mode is guarded literally by depth (`:510`):

```ts
// Inherited config can be empty only for the base case of recursive call.
// To avoid redundant conversion of guardrails to hooks, we do this check.
if (Object.keys(inheritedConfig).length === 0) {
```

`convertHooksShorthand` runs only at the root, and every node below reads the
converted form. The comment states the reason the technique gives — a
conversion applied at every hop is a conversion applied twice.

## The address is the path, minted before filtering

Circuit-breaker state and logging key on `jsonPath`, and the descent extends it
at each hop: `` `${currentJsonPath}.targets[${originalIndex}]` `` at `:670`
(fallback), `:711` (loadbalance), `:755` (conditional), `:770` (single). The
`originalIndex` matters because the breaker's filter runs first
(`:646-658`): unhealthy targets are removed from `currentTarget.targets`, and
the surviving ones carry the index they had in the declared structure. That is
the technique's "assigned before filtering" rule implemented — a filtered list
does not renumber its siblings into somebody else's breaker key.

## The tree's loop reads an in-band marker, not a status

`handlerUtils.ts:677-690` is the fallback loop's break condition, and it has the
second arm the sibling technique asks for:

```ts
const gatewayException =
  response?.headers.get('x-portkey-gateway-exception') === 'true';
```

The header is written by the leaf case's catch at `:805-827`, with the comment
`"Add this header so that the fallback loop can be interrupted if its an
exception."` A failure the gateway generated therefore stops the sweep instead of
burning every remaining candidate on a defect that would reproduce at all of
them.

## Deviations

**Falsy-but-meaningful values are read as absent, three keys out of four.**
`:531` gets it right — `typeof currentTarget.strictOpenAiCompliance ===
'boolean'` — so an explicit `false` on a child overrides an inherited `true`.
The three keys immediately below it use truthiness: `if
(currentTarget.forwardHeaders)` (`:539`), `if (currentTarget.customHost)`
(`:546`), `if (currentTarget.requestTimeout)` (`:553`). A child that sets
`request_timeout: 0` or `forward_headers: []` to *disable* an inherited value
inherits it instead, and no config can express "off here". The standard's rule —
absence means inherit, disabling is explicit — needs the off-value to be
representable, and the correct pattern is already in the file one branch above.

**The leaf address collapses index zero.** `const originalIndex =
target.originalIndex || index` (`:665`, and identically at `:706`, `:753`,
`:768`) treats a zero index as absent. It is defused today only because the
health filter at `:648-657` preserves order, so a target whose `originalIndex`
is 0 can only ever sit at loop index 0. Any future change that sorts or shuffles
candidates — a ranking pass, a weighted reorder — silently re-points that node's
breaker key and every log line that named it. `?? ` rather than `||` is the whole
fix.

**Two carriers for one distinction, and the second one is louder than it should
be.** The in-band marker covers failures raised inside the leaf's `tryPost`. A
`RouterError` thrown when the conditional router cannot resolve (`:750`) escapes
`tryTargetsRecursively` entirely — no ancestor loop ever sees a response to
inspect — and is caught per endpoint, e.g.
`src/handlers/chatCompletionsHandler.ts:39-42`, which renders it as a **400**
carrying `err.message`. Two mechanisms for one classification is the drift the
standard warns about; the status lands in the class most operators put in their
retry lists; and the message is the router's own text, which names internal
target names (`conditionalRouter.ts:141`: ``Invalid target name found in the
query router: ${name}``) — a disclosure the N=1 neighbour's non-disclosure rule
would refuse.

**A predicate the router cannot evaluate routes to the default instead of
failing.** `src/services/conditionalRouter.ts:150-154` resolves a context key by
exactly two segments:

```ts
const parts = key.split('.');
value = value[parts[0]]?.[parts[1]];
```

A one-segment or three-segment key yields `undefined`, the comparison at `:84`
is simply false, and the request falls through to `strategy.default` (`:57-59`).
A mistyped routing key is therefore indistinguishable from a condition that
legitimately did not match — the "failure to decide" class the technique asks to
be raised as its own error is silently converted into a routing outcome. The
regex operator has the same shape: an invalid pattern returns `false`
(`conditionalRouter.ts:121-127`) rather than raising.

**The framer has no size bound, and re-splits its whole buffer.**
`src/handlers/streamHandler.ts:151-205`: `buffer` accumulates decoded text with
no cap, and the drain loop is `while (buffer.split(splitPattern).length > 1)`,
which splits the entire remaining buffer on every pass and again on the next
chunk. An upstream whose delimiter entry in `src/utils.ts:14-56` has gone stale
therefore buffers without limit rather than declaring the frame malformed, and a
long stream pays repeated whole-buffer splits. The `streamState` half of the
same function is right — created once at `:151`, threaded into every transform
call (`:189-196`), and read and written by the per-provider transform, e.g.
`src/providers/anthropic/chatComplete.ts:648-651` initializing
`streamState.toolIndex`.

## Two smaller findings worth the same visit

`transformFinishReason` (`src/providers/utils.ts:73-84`) cannot say *unknown*:
an absent reason returns `stop`, and under strict compliance an unmappable
reason also returns `stop`, with the comment `"NOTE: this function always
returns a finish reason"`. The additive half of the strictness switch is exactly
as the standard describes — `...(!strictOpenAiCompliance && { content_blocks:
… })` at `chatComplete.ts:597-601` adds a key rather than changing one — but the
collapse side can turn an abnormal termination into a normal one.

And the integration test that names the policy status asserts nothing:
`tests/integration/src/handlers/tryPost.test.ts:206-211` is titled `"should
through a 446 if after request guardrail fails"`, builds a url and options, and
ends. The behaviour the status space exists to guarantee is untested at the one
place a reader would look for its proof.
