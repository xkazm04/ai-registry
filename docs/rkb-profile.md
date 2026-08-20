# Reference Knowledge Bundle (RKB) — profile v0.1

**What this is.** A profile of the [Open Knowledge Format](https://openknowledgeformat.com)
(OKF) that adds one thing OKF deliberately leaves out: **a layer contract**. OKF says "a
folder of markdown concept files, each with a little YAML frontmatter, and `type` is
required." It does not say what the types are, how concepts relate, or what makes one
document a principle and another an implementation note. This profile says exactly that,
and gates it.

Every RKB bundle is a valid OKF bundle. Every OKF consumer can read one and get useful
markdown. A consumer that understands this profile additionally gets a navigable
four-layer graph.

**Why the layers.** A knowledge base written at one altitude fails in one of two ways: all
principle and it cannot be acted on, all implementation and it cannot be transplanted. The
four layers keep both halves and keep them separable — you can hand a sibling team the top
two and they are immediately useful, because those two contain nothing local.

---

## 1. The four layers

| Layer | Answers | Transplant rule |
|---|---|---|
| **Golden Path** | What this subject *is*, and what a principal practitioner holds true about it. | Body contains no repo paths, no file extensions, no product or stack names. An agent in an unrelated codebase must be able to use it unchanged. |
| **Technique** | A named concern of that subject, with its procedure and decision rules. | Same purity rule. Belongs to exactly one subject; other subjects reference it, never copy it. |
| **Application** | How the technique is realized on one concrete stack. | Cites real code freely — that is its job. |
| **Evidence** | Where the practice actually manifests, and where a consumer falls short of it. | **Never published.** Lives in a consumer-local overlay (§5). |

"Principal practitioner" is domain-general on purpose. In a software bundle it is a
principal engineer; in a media bundle it is a senior editor or director. The contract does
not change.

## 2. Directory shape

```
knowledge/<domain>/
├── index.md                          # OKF bundle metadata (okf_version, name, title)
├── _laws.md                          # optional: cross-cutting laws, each with an <a id> anchor
├── categories.json                   # optional: subject → display category (graph consumers)
└── <subject>/
    ├── <subject>.md                  # type: golden-path      (filename == folder name)
    ├── techniques/<technique>.md     # type: technique
    ├── applications/<stack>--<technique>.md   # type: application
    └── .evidence.local.md            # GITIGNORED — consumer overlay, never published
```

Slugs are kebab-case noun phrases. A subject slug carries no stack qualifier (`table`, not
`react-table`) — the stack lives in the application filename.

## 3. Frontmatter

**Concept documents** (every `.md` that is not `index.md`, `_laws.md`, or `log.md`):

```yaml
---
type: technique              # REQUIRED by OKF. One of: golden-path | technique | application
layer: technique             # this profile's field; MUST equal `type`. Kept for readers
                             # that predate the profile — new readers may use either.
subject: table               # the owning subject slug (== enclosing folder)
technique: pagination        # techniques + applications: == filename stem
stack: react                 # applications only: react | rust | sql | node | process
status: forged               # draft | forged | reconciled | transplant-tested
laws: [identity-survives-reuse]   # techniques: anchors that must exist in _laws.md
shared_with: []              # techniques: other subjects that reference this one
use_when: [...]              # optional OKF field: when a consuming agent should read this
verified_on: 2026-08-18      # applications ONLY, REQUIRED: see §3.1
verified_against: react@18   # applications, optional: the stack version behind the citations
refresh_by: 2026-11-20       # applications, optional: overrides the derived clock
---
```

### 3.1 Currency, on the application layer

An application cites real code in a real tree. That tree moves; the citation does not.
Nothing in a registry can notice, because a registry does not have the consumer's
checkout — so the layer that decays fastest was, until these fields existed, the only one
carrying no age at all.

| field | required | meaning |
|---|---|---|
| `verified_on` | **yes** | `YYYY-MM-DD`. The date this document's citations were last resolved against a real tree. A **fact**, not a plan: a future date is a gate failure. |
| `verified_against` | no | `<stack>@<version>` — the stack version those citations were checked at (`react@18`, `rust@1.79`). Meaningless for `process`, and rejected there. |
| `refresh_by` | no | `YYYY-MM-DD`. An author's override of the derived clock, for a subject they know moves faster or slower than its stack. Must be after `verified_on`. |

**The expiry is derived, not written.** `verified_on` plus a per-stack window in
[`scripts/check-currency.mjs`](../scripts/check-currency.mjs) produces the clock. The
policy lives in one place a maintainer can tune, rather than in hundreds of per-file dates
that would each have to be invented — which is why `refresh_by` is the exception and not
the rule. `process` applications get no derived clock at all: a methodology does not
expire on a vendor's release schedule.

**`verified_against` is written going forward, never backfilled.** Only something that has
actually read the cited tree can state it truthfully, so the corpus carries it where a
forge or deepen pass has since supplied it and nowhere else. Its absence is reported as
*no version witness* — a fact about the instrument, not about the document.

Whether a citation still lands is answered from the other side, by the installation that
holds the tree: see [`docs/signals-lane.md`](signals-lane.md).

**Bundle `index.md`:**

```yaml
---
okf_version: "0.1"
okf_bundle_name: software-engineering
okf_bundle_title: Software engineering
purity: software             # which denylist the gate applies to this bundle's upper layers
stacks: []                   # optional: extra application "stacks" beyond the default set
                             # (react|rust|sql|node|process). A media bundle's stack is a
                             # model or pipeline tool; a civic bundle's may be a data
                             # source class. Kebab-case slugs; the gate validates against
                             # the union.
---
```

Purity profiles are per-domain denylists in `scripts/check-bundles.mjs` (`software`,
`media`, `civic`, `funding`, `generic`). A new domain that none of them fit adds a profile
there in the same change that adds the bundle — a floor to extend, never to narrow.

**Forbidden in every published file** — the leak gate (§5): `evidence`,
`counter_evidence`, `deviations`.

## 4. Relationships

- **Owned techniques.** A technique belongs to one subject. When another subject needs it,
  its golden path declares `pagination@table` in `techniques:` and does **not** create a
  local copy. The owning technique lists the borrower in `shared_with:`. A node with two
  homes has no single acceptance test, which is how a layer boundary rots.
- **Bidirectional or it does not exist.** The golden path's `techniques:` list and the
  files in `techniques/` must be the same set. The gate fails either direction.
- **Laws are cited, not restated.** `_laws.md` holds cross-cutting invariants with stable
  `<a id="...">` anchors; techniques cite them from `laws:`. Laws are not subjects and get
  no folder.
- **Applications bind to a technique that exists** in the same subject, and their filename
  is `<stack>--<technique>.md` so a directory listing reads as a matrix.

## 5. Evidence, and why it is not here

Evidence is the layer that says *this claim is real, and here is the file that proves it*.
Those pointers name paths inside a particular codebase. Published in a shared registry
they are noise at best — a reader without that checkout cannot follow them — and an
unnecessary disclosure at worst.

So the split is structural, not a matter of discipline:

- **Published:** the standard (golden paths, techniques) and the teaching material
  (applications, which may cite code the consumer has chosen to make public).
- **Consumer-local:** `<subject>/.evidence.local.md`, generated by that consumer's mirror
  and matched by this repo's `.gitignore`. It carries `evidence`, `counter_evidence`, and
  `deviations` (anchors into the consumer's own gap register) keyed by file.

Two gates, in two places, so neither half is unguarded:

1. **Here:** `scripts/check-bundles.mjs` fails if a published file declares any evidence
   key. A leak is a red build, not a quiet commit.
2. **In the consumer:** the consumer's own CI resolves its overlay's pointers against its
   own tree — the "does this evidence still exist" check keeps its teeth where the code is.

A consumer with no overlay present sees a bundle whose evidence is *absent*, which is a
labeled state and not an error. Bundles are usable without it.

## 6. What this profile does not do

- **No staleness enforcement.** OKF has none and neither does this. Freshness is the
  producing consumer's problem; this repo gates structure.
- **No cross-bundle links.** Domains are independent. A concept in `media-craft` does not
  link into `software-engineering`.
- **No ranking, no scoring, no adoption state.** Those are consumer-side; the catalog
  carries counts, not judgments.
- **No prescribed type vocabulary beyond the four layers.** A domain that needs another
  concept kind should propose it here rather than inventing one privately.

## 7. Producing a bundle

Two-phase, and the order is the whole point:

1. **Expert draft, before reading the target codebase.** Write the golden path and its
   techniques from practitioner knowledge. The repo you are documenting is never the
   ceiling of the standard.
2. **Reconcile against reality.** Each claim lands as *confirmed* (evidence pointer,
   local overlay), *deviation* (the consumer falls short — recorded in the consumer's
   register, the standard stays), or *upward lesson* (reality taught you something the
   draft lacked — improve the draft).

A document that skipped phase 1 reads like a description of one codebase, because it is.
