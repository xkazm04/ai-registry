---
layer: application
type: application
subject: async-ui-states
technique: state-model
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16.3.3
applied: code
proof: structural-only
---

# Next.js — the state model as a type, not as flags

The sibling `react` application documents the model derived from flags plus a
held collection, with the entitlement guard realized as a branch ordering.
This tree carries a second encoding of the same model in which the guard is
not a branch at all: the region's entire state is **one discriminated union**,
and the states the technique forbids are the ones the type cannot express.

## Four inputs collapsed into one value

An expandable row's timeline fetches on open and holds this:

```tsx
// src/components/org/followups/FollowupHistory.tsx:14
const [state, setState] = useState<RecEvent[] | "loading" | "error">("loading");
```

Read it against the technique's four inputs. `content` is the array member.
`inFlight` and `error` are the two string members. And `settled` — the sticky
bit whose only job is to make the empty rendering unreachable before a
response — has no representation, because it does not need one: the empty
branch is `state.length === 0` (`FollowupHistory.tsx:44`), which narrows to
the array member, and the only assignment that produces an array is the one
fed by a delivered response (`FollowupHistory.tsx:24`). The empty flash is not
guarded against here; it is **unspellable**. The component's own header states
the same rule in prose — `FollowupHistory.tsx:6-7` "Loading / error / empty
are three distinct states — an error is a retry, never the empty copy (which
would claim an untouched item)."

The initial value is the loading member, which is the technique's
"unstarted collapses into loading" made structural: there is no fourth,
pre-request state to render, so nothing can leak out before the first
assignment.

The branch order at the render site matches the derivation function exactly,
and is short enough to check by eye: loading (`:34`), error (`:35-43`), empty
(`:44`), data (`:45`).

## What the encoding costs

The union has three members, and the model has six states. The three that are
missing are the three that presume *held content plus something else*:
`refreshing`, `superseded`, and a failed refresh that keeps its data. Assigning
`"loading"` or `"error"` overwrites the array, so this shape cannot render
content and a request at the same time — the forbidden `SETTLED-DATA ->
LOADING` edge is not merely available here, it is the *only* way the type can
move from data to a new request.

That is not a defect in this component, and naming why is the useful part: its
only re-request paths are an identity change and a retry from the error state.
`FollowupHistory.tsx:19` sets `"loading"` inside the effect, and the effect's
dependencies are `[id, nonce]` (`:32`) — one identifying coordinate and one
retry counter. Both are edges on which discarding the previous content is
*correct*: a different row's timeline must not render under this row, and a
retry from `error` has nothing to hold. The union is the right encoding for a
region that never refreshes in place, and the wrong one the day someone adds a
poll or a background update to it. **The type is the policy**, which is the
encoding's strength and its whole risk: widening it later is a change of
shape, not an added branch.

## Latest-wins, and the narrower guarantee it gives

`FollowupHistory.tsx:17` declares `let cancelled = false` and the effect's
cleanup sets it (`:29-31`); both resolution paths check it before writing
(`:23`, `:26`). This is the technique's latest-wins rule realized by the
effect lifecycle rather than by a token carried with the request: a superseded
effect run cannot write, so a slow response for the previous `id` cannot land
over the new one.

It is worth being precise about what that covers, because the two mechanisms
are not interchangeable. A cleanup-scoped flag drops responses from
*superseded effect runs*. It does not order two requests issued from the *same*
run — a component that can start a second load without re-running its effect
needs a monotonic token instead, which is what the sibling `next` application
on this subject's empty-state technique shows in a feed whose loader is also
called by a retry handler and by a background task. Here every re-request goes
through a dependency change, so the weaker guarantee is the complete one; the
choice is sound and it is load-bearing that it was not arbitrary.

## Failure spelled apart from empty, in one small component

The error member renders `role="alert"` with a retry (`:37-42`), and the retry
is a nonce bump (`:39`) that re-runs the same effect under the same `id` —
the technique's "a retry that retries" with no request plumbing duplicated at
the call site. The empty member is a plain sentence with no alert semantics
and no action (`:44`). Two renderings, two claims, no shared component between
them.

## What this realization cannot say

It is one 63-line component, and no census was run: the tree's larger surfaces
stream from server components behind suspense boundaries and reach the client
already settled, so this union is a leaf pattern and nothing here establishes
how widely it is used. The encoding was also not measured against the flag-based one — no
defect was observed and fixed, and no test in this tree exercises a stale
response landing after a fresh one. The claim is about what the type admits,
which is checkable by reading it, and nothing more.
