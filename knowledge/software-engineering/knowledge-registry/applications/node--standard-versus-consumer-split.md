---
layer: application
type: application
subject: knowledge-registry
technique: standard-versus-consumer-split
stack: node
---

# Evidence stays home — how the split was drawn when this bundle moved

The `software-engineering` bundle — 105 subjects, 624 techniques, 236
applications — was authored inside a consuming repository and moved here. The
move is the clearest instance of the split this technique describes, including
the part that nearly went wrong.

## What moved and what did not

Each golden path carried three frontmatter keys that are pointers into ONE tree:

```yaml
evidence:          # files proving the standard is followed here
counter_evidence:  # a file that violates it, kept deliberately
deviations:        # anchors in that repo's deferred-fixes register
```

They are noise to every other consumer and would couple the standard to a
codebase nobody else can see. The mirror lifts all three out of every published
file into a per-subject overlay excluded from publication, leaving the standard
and the teaching material to publish.

Counts from the run: **321 frontmatter key blocks lifted** across 105 subjects,
**968 files published**, **26 links that resolved in the source repository but
would dangle here** rewritten into inline citations.

## The gate is the guarantee

`scripts/check-bundles.mjs` fails any published file that declares
`evidence`, `counter_evidence` or `deviations`. That check was **fault-injected
rather than trusted**: re-adding an `evidence:` key to a published subject fails
the gate with the specification's message; removing it returns to green. A gate
that has only ever passed has not been tested.

## Splitting the gate is where half of it nearly disappeared

The source repository's corpus checker validated both halves at once. Moving the
standard here moved the structural half — layer contract, body purity, link
resolution, status vocabulary — and the evidence half had nowhere to go.

It did not move; it was **rewritten on the consumer side** as a separate check
that:

- resolves every evidence path against the consuming tree;
- verifies mirror parity as **set equality**, not counts — two sets can agree on
  size and disagree on every member;
- reports **105 / 624 / 236 on both sides**, which is the parity claim measured
  rather than asserted;
- treats a missing registry clone as a failure under an explicit flag, so a
  networking blip cannot silently downgrade the job to half a gate.

Both halves now state in their own output what they do NOT check, naming the
other side. That sentence is the only thing standing between a split gate and a
dropped one.

## The consumer-side gate found a defect the split had hidden

Once separated, the evidence check failed in continuous integration while passing
locally, for the same commit: a citation named `SKILL.md` where the file is
`skill.md`. The author's filesystem is case-insensitive; the integration runner's
is not.

The fix was not just the citation. The check now resolves against the parent
directory's real entries, so it means the same thing on every platform, and
reports a *mismatch* rather than an *absence* — "it is not there" sends someone
hunting for a deleted file when the file is present under another capitalization.

That lesson was written back up into the standard as a section of
`quality-gates/techniques/gate-liveness.md`, which is the direction this
arrangement exists to make possible: a defect found in one codebase becomes
guidance every consumer gets.
