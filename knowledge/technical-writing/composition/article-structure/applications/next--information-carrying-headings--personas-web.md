---
layer: application
type: application
subject: article-structure
technique: information-carrying-headings
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# Three tutorials on a product blog, reviewed as tutorials and as arguments

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by
package.json:48 "^16.3.8". All posts live in one static data file, and three of the ten are
filed in its tutorial category.

## What the three tutorials are made of

Each one opens with a short paragraph, then a headed preview,
src/data/blog.ts:122 "## What You'll Build", and then numbered steps named by their action:
src/data/blog.ts:144 "## Step 2: Connect Slack", src/data/blog.ts:302 "## Step 2: Connect Email",
src/data/blog.ts:436 "## Step 3: Connect the Data Flow". Thirteen step headings in all. One
tutorial lists what the reader needs first, src/data/blog.ts:130 "## Prerequisites"; the
other two go from the preview straight to step one. Two set per-post cross-links that the
site renders after the body as the next thing to do, src/data/blog.ts:109 "relatedLinks: [";
the third falls back to the site's generic links.

## The same three posts under two policies

Mode `simulation`, three real cases. **Policy A** is the subject as written before
2026-10-10: the argued-article shape for every post. **Policy B** decides the genre first
and holds a tutorial to the tutorial shape.

| Check | Policy A findings | Policy B findings |
|---|---|---|
| Preview placement | 3 (each preview sits under a heading, so "no longer a preview") | 0 (a headed "what you'll build" is the tutorial preview) |
| Headings | 13 (every step heading is a topic, not a claim) | 0 (every step names its action, in order) |
| Close | 3 (no recap numbers, no return to an opening scene) | 1 (one tutorial ends with no next step of its own) |
| Prerequisites | not checked | 2 (two tutorials never say what the reader needs) |
| **Total** | **19, none actionable for the genre** | **3, each a missing part a reader would hit** |

Policy A's nineteen findings would have the author rewrite "Step 2: Connect Slack" as a
claim and append a numbers recap to a setup guide. Policy B's three are the gaps that stop
a reader halfway: no list of what to have ready, and no pointer to what to do once the
agent runs.

**Falsifier:** a usability test on step-by-step tutorials in which claim-phrased step
headings beat action-phrased ones on task completion or time, or in which readers of a
tutorial use a numbers recap at its end. The convergence behind policy B is two other
lanes, not this tree: technical-writing guidance that splits tutorials, how-to guides,
reference and explanation into separate shapes, and course material that asks a long
document's introduction for its scope and prerequisites and its end for what to learn next.

## What this witness does not show

Policy B was not applied to the site: the project's map does not join this bundle, and
the posts are the owner's public copy. Whether readers finish these tutorials was not
measured; the counts above are review findings, not reader outcomes.
