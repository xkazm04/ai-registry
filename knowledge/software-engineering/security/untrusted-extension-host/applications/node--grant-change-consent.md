---
layer: application
type: application
subject: untrusted-extension-host
technique: grant-change-consent
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@22.16
---

# The good comparator and the gate that does not call it

`emdash-cms/emdash` at `7a5d9c1838f6afc5649b7bc0940eacf920b40dab` is a content
management system whose plugins install from the admin UI and run in an
isolate. The version witness is `package.json:60-62`, which declares
`"engines": { "node": ">=22.16" }` — matched by `packages/core/package.json:336-338`
— so every citation below was read against a Node 22 workspace.

This tree contains the best structural escalation comparator this corpus has
seen, and an operator update path that never calls it. Both facts are
load-bearing, and the second is the one worth carrying away.

## The comparator, which is right

`packages/plugin-types/src/declared-access.ts` implements the technique almost
line for line. `AccessChangeKind` (`:34-40`) enumerates seven change kinds —
`category-added`, `category-removed`, `operation-added`, `operation-removed`,
`constraint-added`, `constraint-removed`, `constraint-changed` — and every
`AccessChange` (`:43-50`) carries its own `escalation: boolean` rather than
letting a single flag stand for the whole diff.

The polarity rules are per kind, in `diffConstraints` (`:255-296`):

```ts
if (!hadOldValue) {
    changes.push(change("constraint-added", category, operation, path, undefined, newValue, !knownHosts));
} else if (!hasNewValue) {
    changes.push(change("constraint-removed", category, operation, path, oldValue, undefined, true));
}
```

A removed constraint is *unconditionally* an escalation. An added constraint is
an escalation **unless** the key is one whose narrowing semantics the
comparator understands — `knownHosts` (`:271`) is true only for
`network.request.allowedHosts`. That two-level default is the upward lesson
this tree taught the technique: an open constraint object means the polarity of
an unrecognized key is not computable, and the safe default for the
uncomputable is *widening*.

A changed host list is compared entry-wise through `hostsEscalate` (`:245-249`)
over `patternCovers` (`:233-243`), so swapping one host for another escalates
even though the list length did not move, and a previously-declared `*` covers
everything after it. Canonicalization sits under all of it:
`canonicalizeJson` (`:88-140`) sorts object keys, rejects non-finite numbers,
sparse arrays, symbol keys, prototypes and cycles, and freezes the result — a
declaration that can be hashed into a consent record, which
`declaredAccessDigestInput` (`:396`) does. The test at
`packages/plugin-types/tests/declared-access.test.ts:304-308` pins the
implication closure: `{content:{write:{}}}` and `{content:{read:{},write:{}}}`
produce the same digest.

## The negative fact: zero callers on the operator's path

Grep the whole tree for the comparator's callers:

- `isDeclaredAccessEscalation` (`declared-access.ts:385-389`) — the
  finest-grained instrument in the tree — has **no callers at all** outside its
  own test file.
- `diffDeclaredAccess` (`:300`) has exactly one non-test caller:
  `apps/release-service/src/verification/evaluate.ts:454`, in the *publisher's*
  release-approval service, which uses it at `:458` to decide
  `requiresApproval`.

The publisher's approver sees the structured diff. The site administrator
pressing "update" does not. `handleRegistryUpdate`
(`packages/core/src/api/handlers/registry.ts:1195`) gates on this instead
(`:1506-1507`):

```ts
const capabilityChanges = diffCapabilities(oldCaps, bundle.manifest.capabilities);
const hasEscalation = capabilityChanges.added.length > 0;
```

`diffCapabilities` (`packages/core/src/api/handlers/marketplace.ts:99-115`) is
a flat set difference over normalized capability strings. It cannot see a host
change, a storage change, or any constraint at all, because
`manifest.capabilities` is the flattened token list from which every constraint
has already been erased. The tree knows: the comment at `registry.ts:1481-1486`
says so in its own words —

> an update that changes only the host scope (e.g. api.good.com -> evil.com)
> keeps the capability set identical, sails through the escalation diff below,
> and installs a bundle enforcing a scope the record never showed.

This is [gate-sees-target](../../../_laws.md#gate-sees-target) at full size:
the guard reads the proxy, and the proxy diverges from the target exactly at
the change that matters.

## The compensating control, and what it does not cover

The tree does not ignore the hole; it patches a different one. Immediately
above the flat diff, `verifiedAccessEqual` (`registry.ts:1487-1497`, defined at `:89`) refuses the
update with `DECLARED_ACCESS_DRIFT` unless the incoming bundle's
`declaredAccess` matches the access its **signed release record** advertises.
That is a real control and it closes the case where a bundle lies about itself
relative to its published record.

It is not the technique. It binds the bundle to the *publisher's* declaration,
never to the *administrator's* consent. A publisher who honestly publishes a
new release whose record declares `evil.com` in place of `api.good.com` passes
`verifiedAccessEqual` — bundle and record agree — and passes `diffCapabilities`
— the capability set is unchanged — and the update installs. The
`CAPABILITY_ESCALATION` gate at `:1508-1518` never fires, because it is reading
a token list in which host scope does not appear.

The reach of the gap is measurable against the tree's own documentation.
`docs/src/content/docs/plugins/creating-plugins/manifest.mdx:84` defines the
trust contract as three things — "`capabilities`, `allowedHosts`, and
`storage`" — and `:97-102` states that "Installed sites consented to the
capabilities, hosts, and storage of the version they have." The update gate
covers the first. `allowedHosts` reaches it only through the record-equality
check, and `storage` reaches it through nothing: it is absent from
`CanonicalDeclaredAccess` (`declared-access.ts:13-31`, whose categories are
`content`, `email`, `media`, `network`, `page`, `users`) and therefore from
every path the comparator walks. Two thirds of a documented consent surface,
outside the consent gate.

## What the update-check preview reports

One more instrument reads as a guard and is not.
`handleRegistryUpdateCheck` returns `hasCapabilityChanges` and
`hasRouteVisibilityChanges` hard-coded to `false` for every plugin, with the
reason given at `registry.ts:1641-1650`: computing them would mean downloading
both bundles, "too expensive for a bulk preview". The comment is honest and the
decision is defensible — but the field name is not, and an admin Updates list
that renders `hasCapabilityChanges: false` beside every row is stating a fact
it did not compute ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)).
The third value — *not evaluated* — is the one the surface needs.

## What this tree is worth copying

The comparator, entirely. The two-level polarity default for open constraint
keys. The digest over the canonical form. And then the lesson the tree pays for
on the reader's behalf: **a review of this area should start from the operator's
update button and walk forward to whatever comparison actually runs**, because
the presence of a correct comparator in the repository is what makes everyone
stop looking.
