# knowledge/ — Reference Knowledge Bundles

One directory per **domain**. Each is a four-layer bundle: Golden Path → Technique →
Application → Evidence, in the format specified by [`docs/rkb-profile.md`](../docs/rkb-profile.md).

```
knowledge/
└── <domain>/
    ├── index.md            # OKF bundle metadata
    ├── _laws.md            # cross-cutting laws, cited by techniques
    ├── taxonomy.json       # the authority on where every subject lives
    └── <category>/[<subcategory>/]<subject>/
        ├── <subject>.md                        # the standard
        ├── techniques/<technique>.md           # named concerns of it
        └── applications/<stack>--<technique>.md  # how one stack realizes it
```

## What is here

| Domain | What it covers |
|---|---|
| `software-engineering/` | Building and operating software: UI surfaces, client architecture, LLM/agent engineering, backend platform, operations, security, integration, engineering process (including continuous integration - how a delivery plan is authored, whether it may be trusted to instruct your machines, what those machines are, and what delivery owes a machine author), and engineering assessment (measuring maturity, delivery and adoption). |
| `media-generation/` | Producing factual audiovisual content with generative models: narrative craft, research grounding, image generation and prompting, frame direction, production operations. |
| `civic-intelligence/` | Watching public power with data: parliamentary records, legislation, public money, and the accountability methodology for publishing about real named people. |
| `grant-funding/` | Finding, winning and accounting for grant money: the funding landscape, eligibility and matching, proposal craft, and grant operations from deadline to post-award. |
| `llm-observability/` | Operating production LLM traffic as a product: telemetry and cost attribution, price books and usage governance, unit economics, judge-scoring of live traces, and federated benchmark sharing. |
| `recruiting/` | Hiring people with machine assistance and staying defensible: role definition and intake, candidate evidence and its provenance, interviews and work samples, automated screening and its fairness gates, pipeline operations, candidate experience, governance and consent, and honest measurement of a small-sample process. |

## How the tree grows — and when a domain splits

**The graph is flat; the storage is nested.** Those are two different things and keeping
them apart is what makes the tree survivable at size.

A subject's **identity** is its bare slug — `table`, never `ui-surfaces/data-display/table`
— everywhere it is referenced: `technique@owner`, `shared_with:`, `index.json`'s subject
map, the signals lane. That never changes, at any depth. Its **location** is derived from
`taxonomy.json`, which groups subjects into categories and, where a category grows past
ten, into subcategories.

- **`taxonomy.json`** is the authority. The folder tree is derived from it, never the
  reverse, and only [`scripts/apply-taxonomy.mjs`](../scripts/apply-taxonomy.mjs) may move
  a subject — a hand-edited recategorization is a corpus-wide link break, because relative
  markdown links encode depth.
- **`index.json`** (generated) is the machine-readable tree a consumer walks without
  reading 900 files. It carries each subject's category and subcategory, so a consumer
  renders the hierarchy without walking the filesystem at all.

**No level holds more than ten folders.** Ten is a browsing limit — roughly what a reader
takes in at once — and it is why depth is *dynamic*: a category under the cap holds its
subjects directly, and only a category over it grows a subcategory ring. Subdivide above
ten, collapse back only at six or below; without that gap a category sitting near the cap
would move its subjects back and forth on alternating contributions.

This is a change of position, and worth naming as one. This file previously argued that
the hierarchy should stay shallow and that depth belonged only in declared files. That was
right about the *graph* and wrong about the *tree*: 124 subject folders at one level is not
a shallow hierarchy, it is an unbrowsable one, and the flat graph survives nesting
completely intact.

**Nesting is not splitting, and the split rule below is unchanged.** Adding a category
folder inside a bundle moves bytes and nothing else: one `_laws.md`, one purity profile,
one technique-ownership namespace, and every subject still free to cite every other. A
*split* creates a second bundle with its own denylist and a boundary that cross-bundle
links may not cross — which is why it is never done for size.

Start every new domain as ONE bundle with categories, even when you suspect it will split
(image vs video generation; politics vs economics vs law). Categories make the eventual
split boundary visible before it is paid for. **Split a domain only when a category earns
it**, and the test is the transplant rule, not size: split when a category's subjects
stop sharing the parent's purity denylist (they'd ban different product vocabularies), or
when a consumer exists who wants one category and would be *misled* by the rest. The split
itself is mechanical: promote the category to `knowledge/<new-domain>/`, move its subject
folders, write its `index.md`, re-run the gates. Techniques shared across the boundary are
the cost — cross-bundle links are forbidden, so a shared technique must be duplicated as
two owned copies or kept in the parent; count those before splitting, and if there are
many, the category was not actually a separate domain.

## Reading a bundle

The two upper layers carry no repo paths, file extensions, or product names — that is
enforced, not aspirational. You can read a golden path and its techniques with no access to
any particular codebase and act on them in your own. Applications are the opposite by
design: they cite real code, and they tell you which stack they are about in the filename.

Start at a subject's `<subject>.md`. It states what the subject is and what a principal
practitioner holds true about it, and declares its techniques. A technique entry written
`pagination@table` means the technique is *owned* by another subject — read it there;
there is exactly one copy of any technique in a bundle.

## Contributing

Git is the door. Open a pull request; merging is adopting (see [`CODEOWNERS`](../CODEOWNERS)).
Two gates run on every change:

```bash
node scripts/check-bundles.mjs        # the four-layer contract + the evidence leak gate
node scripts/build-catalog.mjs        # refresh catalog.json (--check in CI)
```

Write new content two-phase: draft the standard from practitioner knowledge **before**
opening the codebase you intend to cite, then reconcile against reality. A document
written the other way around describes one repository instead of stating a standard, and
it reads like it.

## What is deliberately not here

**Evidence.** The pointers that say "this file proves the claim" name paths inside a
particular tree; published here they are unusable noise to everyone else. They live in
each consumer's own gitignored `<subject>/.evidence.local.md` overlay, generated by that
consumer's mirror. The bundle gate fails any published file that carries them — see
[`docs/rkb-profile.md` §5](../docs/rkb-profile.md).
