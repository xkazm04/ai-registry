---
layer: application
type: application
subject: engine-pitfall-corpus
technique: domain-scoped-injection-with-a-safe-superset
stack: node
status: forged
verified_on: 2026-08-20
---

# Routing 42 pitfalls to a module in ~15 lines of TypeScript

The selection half of PoF's corpus lives beside the entries in
`src/lib/knowledge/ue-gotchas.ts`: a declarative routing table
(`MODULE_GOTCHA_DOMAINS`, `:423`) and a formatter (`formatGotchas`, `:465`). The
whole router is small on purpose — the technique's warning that a routing rule
with branching logic in it is a rule nobody maintains is answered by making it a
plain record.

## The table

```ts
export const MODULE_GOTCHA_DOMAINS: Record<string, string[]> = {
  'arpg-character': ['character', 'animation'],
  'arpg-gas':       ['gas', 'combat'],
  'arpg-world':     ['world', 'lighting', 'materials'],
  'arpg-loot':      [],
  'materials':      ['materials'],
  'packaging':      ['packaging'],
  // …
};
```

One lookup deep, module id → coarse domain names people already say out loud
(`character`, `animation`, `gas`, `combat`, `ai`, `ui`, `world`, `lighting`,
`materials`, `vfx`, `audio`, `3d`, `packaging`). Roughly a dozen domains across
roughly thirty modules — the granularity the technique argues for, where scoping
still pays for itself.

Note `'arpg-loot': []` and `'physics': []`, `'multiplayer': []`, `'save-load': []`.
These are the **explicit empty domain set**: deliberately narrow, and a different
statement from unmapped. Omitting them would mean *unknown* and would trigger the
superset; the table can say both, which is exactly the distinction the technique
requires.

## The selection

```ts
export function formatGotchas(kind: PromptKind, module?: string): string {
  if (kind === 'web') return '';
  let relevant = UE_GOTCHAS.filter((g) => g.appliesTo.includes(kind));

  const domains = module != null ? MODULE_GOTCHA_DOMAINS[module] : undefined;
  if (module != null && domains) {
    // Known module → keep universal gotchas + domain-matching ones.
    relevant = relevant.filter((g) => !g.modules || g.modules.some((m) => domains.includes(m)));
  }
  // module unknown/omitted → superset (relevant unchanged).

  if (relevant.length === 0) return '';
  const lines = relevant.map((g) => `- **${g.summary}** — ${g.detail} (${g.source})`);
  return `## Known UE Pitfalls\n${lines.join('\n')}`;
}
```

Four properties of the technique, all present:

- **Hard filter first.** `appliesTo.includes(kind)` runs before any domain logic,
  and `kind === 'web'` short-circuits the whole block — a web task cannot hit an
  engine pitfall, so it gets none rather than a filtered few.
- **Universal entries survive unconditionally.** `!g.modules ||` is the clause that
  implements "an absent domain tag means *everywhere*, never *nowhere*". The
  interface comment at `:11` states the intent in the same words: *"Omitted →
  UNIVERSAL (applies to every module of its `appliesTo` kind — e.g. 'introspect the
  API first' is true for all Python)"*.
- **Unknown resolves to the superset.** `if (module != null && domains)` — a module
  absent from the table yields `undefined`, the narrowing filter is skipped, and
  the full set for the kind is returned. The doc comment at `:418` states the
  asymmetry in the imperative, at the fallback, exactly as the technique
  prescribes: *"a module ABSENT here is UNKNOWN and receives the conservative
  SUPERSET (all gotchas of the prompt kind) — **a missing mapping must never
  silently drop a relevant pitfall**."* The trailing `// module unknown/omitted →
  superset (relevant unchanged)` guards the branch against a well-meaning tidy-up.
- **Nothing matched emits nothing.** `if (relevant.length === 0) return ''` — no
  bare `## Known UE Pitfalls` heading over an empty list. The sibling
  `formatWiringRequirements` (`src/lib/knowledge/wiring-requirements.ts:36`) makes
  the same call for the same reason, and says so: *"the generic boilerplate on its
  own is noise, so an empty wiring block is skipped entirely rather than emitted on
  every code-gen prompt."*

The measured effect the comment claims: *"a materials task no longer hauls
GAS/Niagara/motion-matching text."* Injection cost drops from all 42 entries to
the universal ones plus the handful tagged `materials`.

## Two deviations, standard not lowered

**The identifier router falls the other way.** `knownAssetDomainsForModule`
(`src/lib/knowledge/ue-known-assets.ts:221`) is a `switch` whose `default` returns
`[]`, and `formatKnownAssets` (`:198`) returns `''` for an empty domain list — so
an *unrecognised* module receives no identifiers at all. That is the empty-set
fallback the technique forbids, applied to the one payload whose absence directly
re-creates the confabulation it exists to prevent. The two routers in the same
folder disagree about the same question; the pitfall router has it right.

**The fallback is silent.** Nothing records that `formatGotchas` took the unknown
branch, so a routing table that has stopped being maintained is invisible — it
looks like a slightly long prompt. The technique's requirement that a fired
fallback be observable stands.
