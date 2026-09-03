# XL spec — `untrusted-extension-host`

**Status:** DISPATCHED (2026-09-03, run `emdash-design`)
**Source:** `github:emdash-cms/emdash` @ `7a5d9c1838f6afc5649b7bc0940eacf920b40dab`
**Routing count:** system B, 8 design decisions, 5 `corpus: NONE` sharing one home.

## Placement

`knowledge/software-engineering/security/untrusted-extension-host/`

`security` holds 8 subjects directly and the cap is ten child directories, so this
lands directly in the category, not in a subcategory. Do not create a subcategory.
Append the slug to `taxonomy.json`'s `security.subjects` array — **append, never
reorder**. Link depth from a technique to `_laws.md` is `../../../_laws.md`.

## Why this is a subject and not techniques in an existing one

The nearest neighbour is `llm-agent/runtime-and-io/agent-runtime-assembly`, and its
`operator-tier-code-loading` technique states its tiers as a two-row table:

| tier | written by | may name code |
| --- | --- | --- |
| startup configuration | the operator, with host access | yes |
| service-writable configuration | any authenticated administrator | **never** |

That "never" is the whole of the corpus's current position, and it is written for a
host with no isolation available — the technique says so explicitly: *"There is no
protocol boundary here and no process boundary; the isolation story the tool protocol
offers across a wire is unavailable in the host's own address space."*

This subject is the other case: a host that **does** have an isolation primitive, and
therefore can let an administrator install third-party code from a UI. That inverts the
rule under stated preconditions, and the preconditions are a mechanism set large enough
to be a subject. The boundary sentence belongs in both files; the director is writing
the `operator-tier-code-loading` amendment, so **do not edit that technique** — state
your side of the boundary in your golden path's opening and stop.

Other neighbours whose boundaries you must state, having read them:

- `security/supply-chain` — owns dependency resolution, `permission-manifest-scoping`,
  and archive-extraction safety. It owns code arriving through a *package manager at
  build time*; you own code arriving through the *product's own admin UI at runtime*.
- `security/authorization` — owns who may perform an operation. You own what a
  non-human principal (an installed extension) was granted and how that grant is
  enforced.
- `llm-agent/runtime-and-io/sidecar-provisioning` — owns artifacts the app does not
  ship, fetched after install, and `process-isolation` for spawning them. Its subject
  is acquisition and verification of a *binary the operator wants*; yours is
  containment of *code the operator merely tolerated*.
- `ui-surfaces/input-and-editing/schema-driven-ui` — owns "data describes a layout, a
  renderer realizes it from a registry of blessed components". Your admin-surface
  technique must NOT restate it. Your addition is the *force*: that subject's stated
  triggers are flexibility and travel; yours is a trust boundary. Cite the seam, write
  only what is new.

## Proposed techniques

Six. Each must carry `use_when` and a decision rule, not a description.

### 1. `two-tier-extension-format`
The split is by **where the code runs**, not by what it does, and the low-privilege
tier must also be the one with the *shorter install ceremony* or it loses to
convenience. Decision rule: what forces a capability into the high-trust tier is the
set of things that genuinely cannot cross an isolate boundary — build-time-resolved
admin components, host-rendered templates, raw injection into visitor pages. Everything
else is sandboxable. Carry the counter-force: publishing the high-trust format through
the low-friction channel must be refused outright.
Anchors: `docs/.../plugins/creating-plugins/choosing-a-format.mdx:10,16-58`,
`creating-native-plugins/distributing.mdx:139`.

### 2. `isolation-tier-independent-extension-api`
Same hook names, same context object, same capability vocabulary in both tiers; the
format changes isolation and resource limits, never the API. This is what makes tier
migration a config move rather than a rewrite, and what lets a host with no isolation
runner degrade by *skipping* the sandboxed set rather than failing. State the honest
cost: when the runner is absent, the operator must be told the extensions are not
running, because a silent skip is empty success.
Anchors: `choosing-a-format.mdx:60-74`, `deployment/plugin-sandbox.mdx:132-153`,
`packages/core/src/plugins/context.ts:1095,1114-1174`.

### 3. `pluggable-isolation-runner`
The isolation primitive is an injected dependency, not a built-in; the enforcement
surface (the broker, the manifest, the capability set) is not. Decision rule: what
belongs in the runner is only what the platform provides — the isolate, the CPU and
memory ceiling, the subrequest meter — and what belongs above it is everything a
second platform would otherwise have to reimplement. Carry the measured asymmetry:
one shipped runner enforces wall time only, because CPU and memory ceilings are a
platform feature the standalone binary does not have; a host that does not publish
that difference is claiming a guarantee it cannot make.
Anchors: `deployment/plugin-sandbox.mdx:8-19,109-130`,
`packages/core/src/plugins/sandbox/types.ts:19-28,96-120`.

### 4. `canonicalizable-privilege-declaration`
The flat privilege strings are the runtime's enforcement currency; the **structured**
declaration (category → operation → open constraint object) is the wire, registry and
consent contract, and the flat set is re-derived from it at every parse site, never
the reverse. This is what makes a privilege set canonicalizable — sorted, deduped,
implication-closed — and therefore diffable, hashable and signable. The technique must
carry three rules the source paid for:
- **Escalation polarity is per change kind and is not uniform.** Removing a category
  or an operation narrows; removing a *constraint* widens. A diff that treats every
  removal as narrowing will pass a privilege escalation.
- **Absent and empty are different, and the most restrictive spelling must not grant
  the most.** Absent host list = unrestricted; present-but-empty = deny-all. Never
  widen empty to unrestricted.
- **A wildcard entry is a non-empty allowlist that satisfies a "must declare hosts"
  refinement while granting everything.** Either reject the wildcard at schema time or
  route it to the same consent language as the explicitly-unrestricted grant.
Anchors: `packages/plugin-types/src/declared-access.ts:34-56,88-140,233-249,300-383`,
`packages/plugin-types/src/index.ts:163-192,274-277`.

### 5. `declared-schema-extension-storage`
Extensions get persistence without DDL: one shared table namespaced by extension id,
collections and indexes declared in the manifest and created by the host, queries and
orderings refused on undeclared fields. Decision rule: the performant query set should
be exactly the declared index set, **enforced rather than documented**, so dropping an
index fails queries loudly instead of degrading them into scans. Contrast the
prefix-a-table-name convention this replaces, whose costs are extension-authored
migrations, an injection surface, and orphaned tables at uninstall.
Anchors: `docs/.../creating-plugins/storage.mdx:8,12-14,40-42,171-173,292-320`,
`packages/plugin-types/src/manifest-schema.ts:141-147`,
`packages/core/src/plugins/context.ts:71-100`.

### 6. `per-callback-failure-policy`
Each registered callback declares whether its own failure is fatal to the operation
that triggered it — with a timeout that bounds the **wait, not the work** — and the
default is the correctness-safe side, not the uptime-safe side. The subject this
replaces is a single global policy where every callback is implicitly fatal. Pair it
with the structured rejection channel: a callback that wants to *refuse* an operation
needs a versioned result envelope with a bounded reason string, because "threw an
exception" and "deliberately rejected this save" must not be the same signal, and
anything malformed collapses to the generic failure.
Anchors: `docs/.../creating-plugins/hooks.mdx:56-65,139-167,338-397`,
`packages/core/src/plugins/hooks.ts:374-386,530-537`.

## Boundaries this subject must NOT absorb

- The **registry and distribution** side — publisher identity, moderation labels,
  release provenance, install-time artifact verification. That is the sibling subject
  `decentralized-artifact-distribution`, forged in this same session. Your subject
  begins at "a bundle is on this host and about to run" and ends at "it ran or was
  refused". Say so in your opening, in one sentence.
- Capability *design* in general (`security/authorization`).
- The rendering mechanics of a declarative UI (`schema-driven-ui`).
- Sandbox escape as an exploit class. You own the design of the boundary and its
  declared guarantees, not vulnerability research.

## Open questions the drafter must DECIDE, not discover

1. **Does `per-callback-failure-policy` belong here or in `backend-platform/resilience/error-handling`?** That subject owns `error-doors` and `swallowed-error-prevention`. Argue it and place it once. If you place it there, say so in the report and write only the boundary here.
2. **Is the admin-surface technique worth its own slug**, given `schema-driven-ui` owns the pattern and you own only the force? If the honest answer is one paragraph, put the paragraph in the golden path and do not mint a sixth technique — five strong techniques beat six with a thin one.
3. **What is the `use_when` that distinguishes this subject from `supply-chain` for a reader who has both?** Write it as a single question a reader can answer about their own system.

## Source-tree applications

Write **three**, against the source tree itself (`stack: typescript`), one per
technique where the tree is the clearest realization. `verified_against` names the
stack at the version the tree **witnesses** — read it from `package.json` engines, the
lockfile or a CI pin, never a guess — and the first paragraph says which witness.

At least one application must carry a **negative** structural fact. The source read
found several; the strongest are: the finest-grained escalation instrument in the tree
(`isDeclaredAccessEscalation`) has zero callers on the operator's update path, which
uses a flat set-difference that cannot see host-scope changes at all — the code's own
comment admits an update swapping `api.good.com` for `evil.com` "sails through the
escalation diff"; and one third of what the manifest doc calls the trust contract
(`storage`) is absent from every consent and escalation path. A negative application
built from either is better evidence than an adopting tree would give.

## Rules

Expert-first, then reconcile against the clone at `C:/t/emdash`. Strip every proper
noun from the upper layers — this source is made of product names, and
`check-bundles.mjs` denylists some but not all of them; grep your own output for the
source's vocabulary before you report. `use_when` on every technique. Run
`node scripts/check-bundles.mjs` on your own subject. **Run no git command.** Report
what you overrode in this spec and why — the spec is a brief, not an instruction, and
two of three prior forge workers were right to override theirs.
