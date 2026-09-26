---
layer: application
type: application
subject: read-serving-replicas
technique: client-carried-index
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@22
---

# The D1 bookmark as a cookie, in emdash

How emdash (a TypeScript CMS on Cloudflare Workers, `emdash-cms/emdash` at
`e0270dc02fa96fba794a7ae0fb2d919e48f19a9f`, committed 2026-09-26;
`engines.node >=22.16`) realizes
[client-carried-index](../techniques/client-carried-index.md) over Cloudflare
D1's read replicas. D1 mints the index, which it calls a bookmark. emdash
decides who carries it, in what, and what the response cache does about it.
Paths are relative to the tree root. Cloudflare's read-replication page was
fetched verbatim on 2026-09-26.

## 1. The index and the lagging replica

A D1 session started from a bookmark "will be at least as up-to-date as the
previous session that generated the given `bookmark`". The replica's behaviour
is the technique's **await**: "The read replica will wait until it has been
updated to be at least as up-to-date as the provided bookmark". The page states
no timeout, and emdash's D1 path adds none. The writer never waits. Writes go
to the primary, and replication to replicas is asynchronous: "a read replica
may be arbitrarily out of date."

emdash treats the bookmark as opaque on purpose (`packages/cloudflare/src/db/d1.ts:74-79`):

> D1 bookmarks are opaque, minted by Cloudflare. We don't validate the shape
> (a tighter regex risks rejecting a format change and silently degrading
> read-your-writes), but we do cap length and reject control characters

The cap is 1024 characters (`:83`).

## 2. Who carries it: authenticated sessions, in a cookie

The session constraint is chosen per request (`d1.ts:417-430`):

- A write opens at `"first-primary"`.
- An authenticated read resumes from the bookmark cookie if one arrived and
  passes the shape check.
- Every other request uses the configured default, normally
  `"first-unconstrained"`, which means the nearest replica.

After the handler, `commit()` writes the session's latest bookmark into
`__em_d1_bookmark`, set with `httpOnly`, `sameSite: "lax"` and no expiry
(`d1.ts:34,456-472`). An anonymous session persists nothing, because it "can't
resume across requests" (`:457-458`).

That is the technique's scope rule, "it does not buy them for... an observer
with no index", turned into a consistency tier chosen by identity. Anonymous
visitors read the nearest replica and are told so: "Anonymous visitors may see
data that is a few seconds stale"
(`docs/src/content/docs/deployment/database.mdx:173-177`). Signed-in editors
get read-your-writes.

Two fixes in the tree's history show the tier boundary is where the bugs
live:

- **A request that becomes authenticated mid-flight** (login, signup, invite)
  must persist its bookmark. `isAuthenticated` was captured before the route
  ran, so the follow-up read hit a replica without the new session row.
  `requestEndedAuthenticated` now scans the outgoing cookies
  (`packages/core/src/astro/middleware/scoped-db.ts:28-48`; CHANGELOG #2552, the
  "logged-out bounce").
- **The same function refuses a stale incoming session cookie.** Its comment
  explains why: a stale `astro-session` cookie on an anonymous render "must not
  qualify, or its replica-read bookmark would overwrite a fresher one from an
  earlier authenticated write" (`:32-35`). Replacing the held index with the
  newest response's is monotone only if that response started from the held
  index. A response from a session that started elsewhere can carry an older
  position, and the replacement then moves the client backwards.

The same hazard remains, unguarded, for **concurrent** authenticated requests.
Each response overwrites the cookie with its own session's bookmark, and the
code never compares two bookmarks. Two overlapping requests that both start
from bookmark B can each return a later bookmark: a write returns B+k from the
primary, and a replica read returns B+j. Whichever response the browser
processes last wins, even if that is B+j < B+k. The next read can then miss
the write. This follows from reading `d1.ts` and `scoped-db.ts`. It was not run.

## 3. The carrier decides who can echo

A cookie is echoed by browsers and by nothing else. CHANGELOG #1662 says
`Authorization: Bearer` requests "now use the primary/uncached connection like
session-authenticated requests". Bearer requests do count as authenticated
(`packages/core/src/astro/middleware.ts:704-709`). But on D1's `"auto"` session
mode, the authenticated branch uses a bookmark only if the cookie arrived.
Otherwise it falls through to `"first-unconstrained"` (`d1.ts:420-430`). An API
client that does not keep cookies can therefore POST, receive the bookmark in a
`Set-Cookie` it ignores, and GET from a replica that has not seen the write.
The changelog claims a guarantee that the code gives only to clients that echo
cookies. This comes from reading the code. The tree's request-scope test file
(`d1-request-scope.test.ts`) has three tests, all about persisting the
bookmark, and none covers constraint selection.

Cloudflare's own example on the same page carries the bookmark in a response
header (`x-d1-bookmark`), which any client can echo.

## 4. The cookie and the response cache

A shared cache that sees a `Set-Cookie` on a response either refuses to store it
or replays one visitor's cookie to everyone. The legacy Cache API provider
handles both directions (`packages/cloudflare/src/cache/runtime.ts:150-190`):

- It stores a response only if every `Set-Cookie` on it is the bookmark cookie.
  It strips those before storing and refuses to cache a response carrying any
  other cookie.
- Requests carrying `astro-session=` bypass the cache (`:213-216`).

When the provider was written, putting a bookmark on anonymous pages would have
turned every one of them uncacheable. Since anonymous sessions stopped
persisting a bookmark (`d1.ts:463`), the strip is defensive. The provider
itself is now marked `@deprecated` in favour of native Workers caching
(`runtime.ts:4`).

## 5. Where there is no index: a time window, per isolate

The Postgres path (Hyperdrive) has no bookmark. It routes anonymous reads to a
query-cached connection and, after a content write, forces them onto the
uncached one for `preferUncachedAfterWriteMs`, which defaults to 60000
(`packages/cloudflare/src/db/hyperdrive.ts:294-319`; `database.mdx:419-420`).
The docs name its limit: "Without a distributed Object Cache, the prefer-uncached
window is known only to the Worker isolate that handled the write"
(`database.mdx:475`). A time window stands in for the index only where the
backend exposes no position. Unless a shared store distributes the write
timestamp, it guarantees nothing to an isolate that did not see the write.
Even then it is a guess about lag, not a position.

## 6. A bounded await that serves stale

The Durable Object adapter bounds the wait at 250 ms (`do-sql-class.ts:62-71`).
On timeout or error it **serves a possibly-stale read** (`:110-133`). The reason
given is that the adapter cannot distinguish a bookmark it will never reach
("minted by a different DO id after a rename, or an expired one") from a slow
one. Without the bound, "every read pay[s] the platform's full wait budget for
the cookie's whole lifetime."

This departs from the technique, which says never serve. The departure has a
specific cause: nothing the adapter can read from a bookmark tells it which
instance minted it, so an index from another authority looks the same as a
late one. The adapter also holds a stub to its primary (`:87-92,145`), so on
timeout it could forward the read to the primary and serve fresh data. It
serves the replica's data instead.
