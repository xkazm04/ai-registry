---
layer: application
type: application
subject: browser-credential-boundary
technique: public-vs-server-env-split
stack: next
status: forged
verified_on: 2026-09-02
verified_against: next@16
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A starter where both tiers hold only the public key

The `with-supabase` example in the Next.js repository
(`vercel/next.js`, `examples/with-supabase`, read at commit `fc4f062`,
2025-11-18) is the tree most people copy their first browser-to-store wiring
from, which makes its choices the field's defaults. Its runtime pin is
`"next": "latest"` in `package.json:19`, so no `verified_against` is stated
here: nothing in the tree names a major.

The whole configuration surface is two values, both prefixed:

```env
# .env.example:3-4
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

The `NEXT_PUBLIC_` prefix is the toolchain's reserved one — the build inlines
prefixed values into the client chunks and replaces unprefixed `process.env`
reads with an empty string there — so the split is carried by the name and
honoured mechanically, exactly as the technique's step 1 asks. The README
records the rename from `ANON_KEY` to `PUBLISHABLE_KEY` (`README.md:82-85`)
and says the two are interchangeable "during the transition period", which is
the vendor's own vocabulary shift: the publishable key is a role selector, and
the platform's documentation now says so in terms — anyone can read it, so it
reaches only what row-level security allows. The legacy `anon` and
`service_role` keys are on a deprecation path to end of 2026; the semantics
did not move, only the words.

## No privileged credential anywhere in the tree

The server-side client is built from the *same two public values* as the
browser client:

```ts
// lib/supabase/client.ts:4-7
return createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
```

```ts
// lib/supabase/server.ts:12-14
return createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { cookies: { ... } },
);
```

What the server adds is the user's own session cookie, forwarded through the
`cookies` adapter (`lib/supabase/server.ts:16-31`); the store still sees a
request from the public role carrying that user's identity. This is regime
one on both tiers — the server here is **not a broker**, because it attaches
no secret the browser lacks. Every read a server component makes is a read
the browser could have made with the same cookie, and the enforcement point
for all of it is the store's policy engine, not any code in this tree. The
golden path's rule that the two regimes coexist has a degenerate case worth
naming: a tree can run entirely in regime one, and then "server-side" means
nothing for security. The starter ships no schema and no policies, so a
project that adds a table without switching policies on has published it —
the hosted platform's default grants give the public role every privilege on
a new table in the exposed schema.

## The silent fallback, in the auth gate

`lib/utils.ts:9-11` defines `hasEnvVars` as the conjunction of the two public
values, with a comment that it "can be removed, it is just for tutorial
purposes". The request proxy that refreshes sessions and redirects
unauthenticated visitors reads it first:

```ts
// lib/supabase/proxy.ts:10-14
// If the env vars are not set, skip proxy check. You can remove this
// once you setup the project.
if (!hasEnvVars) {
  return supabaseResponse;
}
```

A deployment with no configuration therefore serves every route with the
session gate switched off, and keeps serving. The tree mitigates at the UI —
`app/page.tsx:24-26` and `app/protected/layout.tsx:25-27` swap the sign-in
button for an `EnvVarWarning` — and the protected page still redirects on
its own when there are no claims (`app/protected/page.tsx:12-14`), so the
degraded mode is visible and the protected page is not open. But it is
precisely the shape the technique's step 4 warns about: a missing value that
does not crash, switches a security-relevant path off, and continues. The
comment says to remove it; nothing makes that happen, and a starter's
tutorial scaffolding is the code most likely to reach production unread.

## The address is published, on purpose

`NEXT_PUBLIC_SUPABASE_URL` puts the store's hostname in every chunk. In this
tree that is the correct choice — the browser talks to the store directly, so
the address is part of the public contract — and it is the concrete case of
the rule in [opaque-upstream-errors](../techniques/opaque-upstream-errors.md):
a project that later adds a server route in front of this store and hides
the hostname from its error bodies has paid for an opacity the bundle already
denies it. The naming convention makes the fact legible; the decision to
publish is still one to write down, and this tree does not.

## Deviations recorded against this tree

- **The environment template annotates nothing** (`.env.example:1-4`): two
  bare names, a dashboard link, no statement of which side each value lives
  on, what it unlocks, or what breaks without it. The README carries some of
  that (`README.md:76-87`); the file a contributor actually copies does not.
  Step 3 of the technique is unmet.
- **Non-null assertions stand in for validation.** Every read is
  `process.env.NEXT_PUBLIC_…!` (`lib/supabase/client.ts:5-6`,
  `lib/supabase/server.ts:13-14`, `lib/supabase/proxy.ts:19-20`). In the
  client chunk an unset prefixed value has nothing to inline, reads as
  `undefined`, and the store client is constructed with it; the failure surfaces at the first request,
  not at build. The `hasEnvVars` guard exists because of this and is marked
  removable.
- **No bundle scan, no server-only marker, no house rule.** There is no
  privileged value in the tree to guard, so none of the technique's gates
  are exercised here — but the tree is a starter, and the first thing a
  project adds is a secret key for a server route. Nothing in the tree
  prepares that: no `server-only` import pattern, no scan of the build
  output, no contributor rule naming the value that must never be prefixed.
- **Confirmation, not deviation:** the prefix is the single authority
  (step 1) — no second list of public values exists anywhere, and the
  toolchain enforces the split in the build rather than in review.

---

*Two trees, one technique, one stack. The first section reads a public starter at a pinned commit (no runtime major readable); the second is the applied experiment against a working application at `next@16`, which is where the frontmatter clocks come from.*

## Second tree: A barrel marker beside a module-enumerating type guard, in one tree

A Next 16 application (App Router, Prisma over a Postgres-family store, 1529
source modules of which 385 carry `"use client"`, read at its head on
2026-09-02) has already met the technique's step 5 — its contributor
instructions state that a client component never reaches the database layer
for a value — and enforces it with the toolchain's own marker: `import
"server-only"` at the top of the database **barrel**, with an architecture
decision recorded for it. The decision's stated benefit is that a client
value import of the barrel "fails the build here, naming this module, instead
of failing downstream with a message about `next/headers`". That is the
entry-point placement the technique's *Mark the module, not the entry point*
section warns about, and this tree is a clean test of whether the warning
buys anything, because the same tree also contains a guard placed by the
opposite rule.

### The two guards, and their two doctrines

Beside the barrel sits a compile-time wire-safety guard for **types**: a
`satisfies` table asserting that no row type a client imports carries a
`Date`. Its own header records the audit history — the first pass enumerated
the client's imports *from the barrel*, a re-audit found eight more types
reached through *deep paths* that bypass it, and the file now states the rule
in the technique's exact words: *enumerate by what a client imports, never by
which module path it came through*. That guard has been rebuilt to
module-scope. The `server-only` marker for **values**, landed the same week
under the same decision series, was placed at the entry point. One tree, two
guards, opposite doctrines — and nobody designed the disagreement.

### The experiment: enumerate both ways, count the difference

No product code was changed. A harness walked the source tree twice from the
same 385 client roots.

- **A — entry-point enumeration**, what the barrel marker can see: client
  modules that import a *value* from the barrel. **Result: 0.** The tree is
  clean by its own guard, and the build agrees.
- **B — module enumeration**, following value imports transitively (type-only
  imports erased, exactly as the compiler erases them) and stopping wherever a
  module carries its own marker: database-layer modules reached from a client
  root with **no marker anywhere on the path. Result: 2 of 118**, reached from
  15 client roots between them.

Of the 118 modules in the database layer, **117 carry no marker**, and 108 of
those touch the Prisma client — the path that holds the connection string.
The marker guards one file; the type guard's own audit had already shown
that clients reach this layer by deep path.

The two reached modules differ in what they hold, and that difference is the
technique's point:

- One is pure parsers and constants for a run ledger — twelve client roots
  reach it by value, and it reads nothing from the environment. Harmless, and
  the marker's absence costs nothing.
- The other is the backend-mode reporter: a `getDbMode()` that reads two
  **unprefixed** server values (the managed-database endpoint, then the static
  connection URL) to decide which persistence backend is live, plus a pure
  `dbModeLabel()` for display. Three client roots import the label by value.
  The module's own doc comment says it is "server-only in practice" and that a
  client "must not re-derive the mode client-side, where the env/global
  signals are absent" — a rule stated in a comment beside the module, which
  is the *list maintained beside it* the technique says does not enumerate.
  In the client chunk both `process.env` reads inline to the empty string, so
  a client that did call `getDbMode()` would get `"disabled"` — the honest
  indicator reporting no database, on a deployment with one. Silent fallback,
  the shape of step 4, uncatchable by any check on names, and invisible to a
  marker placed on a barrel this module is not behind.

Nothing is broken today: the three clients call only the pure label. The
finding is that the guard cannot tell the difference between today and the
day a contributor calls the other export, and the sibling type guard in the
same tree already learned that lesson once.

### Verdict, and the next change

`better`, at experiment mode. The instrument was an import-graph walk with the
compiler's own erasure rule; the paired number is 0 (entry-point) against 2
modules / 15 roots (module-scope), on the same 385 inputs. What the marker
would need to move is not the count — it is where the failure surfaces: a
value import of a deep module today fails at Prisma or `next/headers` in the
client bundle, the "downstream" failure the decision record wanted to avoid
and only avoided for the barrel.

The change this files for the project: put the marker in the module that
reads the environment, and move the pure label out to a module a client may
import — a three-line split, verified by `next build` failing on the marker
and then passing after the split. The strongest form the technique names is
also reachable here: the toolchain can make the environment reads themselves
un-importable from client code, with no per-module marker to forget.

### What this realization cannot do

The harness reads source, not the built artifact; it is a proxy for the
bundle in exactly the way the technique's *gate reads the bundle* section
says a source scan is. It proves which modules a client graph *reaches*; it
does not prove what the bundler *kept* after tree-shaking. The project's own
gate — `tsc --noEmit` — cannot see a `server-only` marker at all; only the
production build can, which is why this ran as an experiment and not as a
code arm.
