---
layer: application
type: application
subject: workflow-property-contracts
technique: attribute-protocol-over-accessors
stack: next
status: forged
verified_on: 2026-10-22
verified_against: next@16
applied: experiment
ab_verdict: unmeasurable
---

# Next: one attribute surface over four substrates, with the table only in the type system

The tree is the public marketing site's data client (personas-web), read at commit
1f258aa4870d06a101f056623cf99c332bcf3a8e. The version witness is its package manifest
(`package.json:58 "next": "^16.3.8"`). Every page calls `api.somethingByName(...)`, and
behind that one name sit four implementations: a demo plane, a mirror of the desktop
app's data, the desktop app's management API, and the orchestrator's REST API. This is
the technique's shape, the same syntax over several substrates, in a language with no
attribute-protocol hook of the Python kind, and the tree shows what survives the
translation and what does not.

## What survives: the host cannot tell the substrate

The dispatcher is a proxy that answers every read of a name by choosing an
implementation and returning that implementation's member
(`src/lib/api.ts:445 "export const api: ApiClient = new Proxy({} as ApiClient, {"`;
`src/lib/api.ts:449 "const impl = USE_SUPABASE ? supabaseApi : USE_DESKTOP ? desktopApi : realApi;"`).
The demo choice is made per read, so flipping it takes effect on the very next access
with no cached object to go stale. All four implementations are declared against one
interface (`src/lib/api.ts:148 "export interface ApiClient {"`;
`src/lib/mockApi.ts:154 "export const mockApi: ApiClient = {"`;
`src/lib/supabaseApi.ts:267 "export const supabaseApi: ApiClient = {"`;
`src/lib/api.ts:205 "const realApi: ApiClient = {"`), so a name one implementation
forgot is a compile error, not a field failure. That is the technique's central claim
holding: the table is the one authority for the vocabulary, and adding a name adds it
to every substrate's surface at once, enforced by the checker rather than by
convention.

## What does not survive: a table that exists only at compile time

The authority here is a type, and a type has no runtime presence. The proxy's target is
an empty object, so the runtime holds no list of valid names. Probing the live module
(one throwaway test, deleted afterwards): `Object.keys(api)` and the keys of `{...api}`
both return 0; `"pausePersona" in api` is `false` for a name that works when called;
`typeof api.pausePersona` is `function`; and reading a misspelt name returns
`undefined`. Reflection and use disagree, and the typo is the silent empty value the
technique warns against, deferred to a later "is not a function" at the call site.

The tree already pays for it: a test that builds a desktop client has to name the
methods it falls through on, with the comment
`src/lib/sync/desktopUnsupported.test.ts:19 "A Proxy spreads to nothing, so name the methods the desktop plane falls through on."`
A host that wanted to enumerate, spread or feature-test the surface cannot.

## What the realization cannot do

It cannot refuse a write of an unknown name, because the proxy has no set trap and the
type system only covers code the compiler sees. It cannot answer "which names exist"
without a runtime list. The fix is cheap in principle (a frozen name list derived from
one implementation, answered by the membership and enumeration traps, and a throw in
the read trap for names outside it), but it adds a second copy of the vocabulary unless
the list is generated from the interface, so it was not built.

## Verdict

Mode `experiment`, verdict `unmeasurable`. Seam chosen to falsify: does the
type-checked table give the host the same guarantees the runtime table gives in the
technique? Arm A, the tree as it is, was measured; arm B (the enumeration and
unknown-name traps) was not built, so no target moved. Floor not applicable. Return
condition: a consumer that reflects on the surface (a spread, a membership test, a
generic wrapper), or a generated name list, at which point build arm B and count the
names reflection reports against the interface.
