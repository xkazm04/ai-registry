---
layer: application
type: application
subject: browser-credential-boundary
technique: public-vs-server-env-split
stack: next
status: forged
verified_on: 2026-09-02
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
