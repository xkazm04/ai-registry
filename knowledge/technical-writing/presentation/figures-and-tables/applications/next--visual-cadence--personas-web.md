---
layer: application
type: application
subject: figures-and-tables
technique: visual-cadence
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# Ten short posts on a renderer with no figure: the cadence rule needs a definition to say anything

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The renderer is the one described in the `designed-comparison-tables` application:
headings, lists, a one-line italic block, inline bold and code, and nothing else.

## The count

The field lane ran step 1 of the technique over all ten posts with a script that copies the
renderer's block detection. 3,768 words; 117 prose paragraphs; 54 headings; 26 lists; 5
italic blocks. The longest run of prose paragraphs depends on a choice the technique did not
make:

| Headings | Lists | Posts with a run of 3 or more | Longest run |
|---|---|---|---|
| ignored (do not break a run) | count as visual | 10 of 10 | 10 |
| break a run | count as visual | 1 of 10 | 3 |

Read literally, the technique's list of visual elements (figure, table, code block, diagram
strip, annotated snippet, callout) names nothing this renderer can draw, so every post has
zero. The Director recounted the self-healing post (8 and 2) and the pipeline post by hand
(10 and 2).

## Simulation

Mode `simulation`. Policy A is the technique as it stood before 2026-10-10. Policy B adds:
a list that carries structure counts and a heading does not; the two-paragraph limit is a
prompt to look, not a defect; on a renderer with no figure, the cadence is met with a
numbered or parallel list, and a run of reasoning is shortened or split.

- **The self-healing post** (src/data/blog.ts:89 "three-layer resilience system", whole
  post 8 paragraphs, no list). A, depending on the reading, reports a run of 8 it has no
  remedy for, or a pass because each layer has a heading. B reports the run and names the
  structure: three layers that escalate (retry, then failover, then the breaker), a
  numbered list of three with the trigger and the action in each item, and the prose cut
  to what the list cannot hold.
- **The pipeline tutorial** (src/data/blog.ts:434 "Researcher → Analyzer → Writer.",
  src/data/blog.ts:450 "if the confidence score is below 70%"). A run of 10 under
  headings that already number the steps. B: the build is a sequence with one branch;
  the branch is the part the prose carries worst, and a numbered list with the branch as
  its own item carries it.
- **The Slack tutorial** (src/data/blog.ts:144 "## Step 2: Connect Slack"). A run of 7
  under B's definition too, but each step is one or two short instructions under a step
  heading. B's convention clause applies: look, find no structure the headings do not
  already carry, leave it. A, under the stricter reading, would demand a visual here.

B finds the two passages where structure is buried in prose and leaves the one where it is
not; A, depending on an unstated definition, either flags all ten posts with no permitted
fix or passes nine of them. Judgment on the text; no reader was tested.

**Falsifier:** a reading test on these posts where the list versions of the self-healing
and pipeline passages are no faster to answer questions about than the prose. The copy was
not changed: the project's map does not join this bundle, and the posts are the owner's.
