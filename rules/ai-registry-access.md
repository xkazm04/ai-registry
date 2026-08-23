# The organization's knowledge registry

The registry is a git repository of **Reference Knowledge Bundles**: domain standards
forged from these codebases and hardened against outside research. It sits at the path in
this repo's `.ai/manifest.yaml` under `registry.local` (a sibling `../ai-registry` by
default); `registry.remote` names its origin. The bundles this project consumes are listed
in that same manifest under `knowledge.domains`, and each one has a companion rule file
beside this one listing its subjects.

## Four layers, and which of them binds

| Layer | What it is | How to treat it |
| --- | --- | --- |
| **Golden path** (`<subject>.md`) | what the subject IS and what a principal practitioner holds true | the standard; read it first |
| **Technique** (`techniques/<slug>.md`) | one named concern, with its procedure and decision rules | the actionable rule, stated as "when X, do Y, because Z" |
| **Application** (`applications/<stack>--<technique>.md`) | how one concrete stack realizes it, citing real code | teaching material and evidence - never a mandate |
| Evidence | which file proves a claim in a particular tree | not published; consumer-local by design |

The upper two layers carry no repo paths, file extensions or product names, so they apply
here unchanged. Applications name their stack in the filename.

## Resolving a subject - never construct a path

Bundles are **nested** under `<category>/[<subcategory>/]<subject>/` and the shape is
owned by `taxonomy.json`, so a path built from a slug is a path that breaks the next time
a subject moves. The address is the generated index:

```
<registry>/knowledge/<domain>/index.json  ->  subjects["<slug>"].file
```

That field is the golden path's real location; its techniques sit in `techniques/` beside
it and its applications in `applications/`. The same index carries every technique's
`use_when` triggers, which is what to grep when the right subject is not obvious from the
slug lists.

## When to open one, and what to do with it

**Before a design, architecture or product decision in a covered domain** - not after.
Open the governing subject, read the golden path, then the techniques it names.

- **The standard does not bend to the code.** Where this repo falls short, that is a
  **deviation**: say so out loud, record it where this repo tracks gaps, and let the
  standard stand. Lowering the standard to match the code is how a corpus rots.
- **Numbers carry their measurement.** A figure in an application comes with its n and its
  date; it is evidence about one tree, not a universal constant.
- **A technique that fits badly is a finding.** If the rule is wrong here for a reason the
  corpus does not know, that reason is worth contributing back - it is how the bundle got
  good in the first place.

## The map: which subject governs which part of THIS repo

`.ai/registry-map.json` is the generated join between this repository's contexts and the
subjects above. Consult it **before searching the corpus by hand** - it turns "what does the
standard say about this file?" into a lookup:

- Each row is a context: its `paths`, and the subjects that govern it with a `confidence`
  and the tokens that earned the match. Find the row whose `paths` cover the file you are
  about to change.
- Each pair carries a `state`: `unknown` (nobody has judged it), `conformant`,
  `deviation` (with `evidence` naming the anchor and the consequence), or
  `not-applicable`. **A `deviation` is a known, recorded gap** - do not rediscover it, and
  do not treat it as licence to add another.
- `subjectIndex` inverts it: given a subject slug, which contexts it governs.
- A row marked `governance: "weak"` means the declared domains barely cover that context.
  Treat guidance there with suspicion and say so; it is a coverage question for the
  registry, not a standard to force onto the code.

`/conform` is what fills the states in, a few pairs at a time, and writes the verdicts
back. `/consult <topic>` runs the read loop deliberately and logs it so the registry can
see which knowledge is actually reached for. This rule exists so that the corpus is in
front of you even when nobody invokes either.
