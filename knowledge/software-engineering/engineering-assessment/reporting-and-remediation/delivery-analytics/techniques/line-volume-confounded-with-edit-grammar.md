---
layer: technique
type: technique
subject: delivery-analytics
technique: line-volume-confounded-with-edit-grammar
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [comparing two code-writing tools or models by lines written, ingesting a volume figure a producer reported about its own output, summing a lines metric across more than one producer, defining the unit of a change-size metric whose source is an editing tool's own log rather than version-control history, deciding whether a producer-reported volume figure may be shown at all]
---

# Line volume confounded with edit grammar

A tool that writes code reports how much it wrote, and that number is not a
measure of how much it wrote. It is mostly a measure of **how the tool is built
to change a file**.

Two edit grammars are in wide use. A **whole-file rewrite** sends the complete
new body on every change, so a three-line correction to a five-hundred-line file
emits five hundred lines. A **ranged replace** sends an anchor plus its
replacement, so the same correction emits perhaps a dozen. Both are reasonable
engineering choices, neither is trying to mislead, and a counter that sums what
the tool emitted will report numbers that differ by a large factor for identical
work. A comparison of two producers by lines written therefore ranks their edit
grammars, and it does so in the confident register of arithmetic
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

This is the same disease as
[path-class-confounded-with-size](./path-class-confounded-with-size.md) moved one
level down. There a predictor was measuring a confound; here the **unit** is. And
it defeats the safeguard that
[batch-size-thresholds](./batch-size-thresholds.md) relies on, because both
producers will tell you their unit is "lines added". A stated unit *name* is not
a stated unit when each producer computes it differently.

## The correction the folk version gets backwards

The mechanism is usually stated as *rewrite tools over-count, ranged-replace
tools under-count because they only show insertions*. The first half is right.
**The second half is wrong, and the sign error matters**, because it sends an
implementer to add a correction to the ranged-replace side when the repair is
needed on both.

Measured over one author's real editing history, where both grammars belong to
the *same* producer — so the model, the operator, the repositories and the period
are all held constant and the grammar is the only thing that moves. 11,791
file-edit chains, of which 2,030 reached a recovered baseline, replayed without
losing a single anchor, and were **edits to a file that already existed**:

| grammar | reported payload | reconstructed new lines | inflation |
| --- | --- | --- | --- |
| whole-file rewrite | 23,948 | 3,476 | **6.89x** |
| ranged replace | 65,076 | 54,545 | **1.19x** |

Both grammars **over**-report, by factors that differ by **5.8x**. Ranged replace
over-reports because the anchor context it restates is counted as written: 17.7%
of its entire payload across the wider corpus was text that already existed at
that position. It never under-counts against a reconstruction. What it does is
over-count *less* — and that gap is what destroys the comparison.

Four readings that decide how much of this to believe:

- **The effect is specifically about rewriting something that exists.** The same
  instrument, over the 3,083 chains that *created* a new file, returns **1.02x**.
  A whole body that is genuinely new is not over-counted, correctly, and an
  instrument that reported inflation there would be manufacturing it. Pooling new
  files with rewrites hides the entire finding: pooled, the rewrite grammar reads
  1.09x and lands *below* ranged replace's 1.19x, which inverts the result.
- **A second, baseline-free measurement agrees on direction.** Restricted to the
  second and later rewrites of a file — where the previous version is in the
  record and no baseline has to be recovered at all — the rewrite grammar inflates
  **2.03x** (13,862 against 6,812), with a per-chain median of 2.00x across 114
  chains, against ranged replace's 1.22x. That is a *lower* bound, because it
  excludes the first rewrite of an existing file, which is where the largest
  inflation lives. It matters because it needs nothing from the baseline
  machinery whose limits are the subject of the next section.
- One chain rewrote a file repeatedly and added nothing new at all, reporting 211
  lines against zero.
- **172 pure-deletion edits reported a positive payload against zero added
  lines.** A grammar that restates an anchor in order to delete something inside
  it books the survivors as new work.

Diffing each call's before and after without reaching back to the baseline — the
obvious middle repair — does not fix it: that method returned **6.76x** for the
rewrite grammar, because for the first rewrite of a file it has no prior version
to diff against and books the whole body.

## There is no correction factor, because the inflation is not a constant

The tempting repair is to divide the rewrite grammar's number by its measured
factor. It does not work, and the reason is arithmetic rather than empirical. A
whole-file rewrite's payload *is* the file's size, so its inflation is
`file size / new lines` and grows without bound as the file grows. A ranged
replace's payload is bounded by the anchor convention and does not. That is why
the same grammar reads 6.89x on one cut of one corpus and 2.03x on another: both
are correct, and neither is the number. Bucketed by the size of the thing being
replaced:

| size of the replaced unit | rewrite inflation | ranged-replace inflation |
| --- | --- | --- |
| under 50 lines | 1.84x (n=53) | 1.21x (n=10,908) |
| 50-150 lines | 1.94x (n=56) | 1.45x (n=30) |
| 150-400 lines | 2.20x (n=21) | — |

The rewrite column rises; the ranged-replace column is flat over 99.7% of its
population. Those band counts are far too small to establish a *correlation*, and
they are not being asked to: the relationship is an identity, and the table only
shows the identity is not cancelled in practice. The consequence is the point.
**The inflation factor is a joint property of the tool and the tree it is pointed
at**, so a producer's number cannot be normalised by knowing its grammar, and two
producers cannot be compared by correcting each.

## The rule

**A volume figure carries the producer that emitted it and the method that
computed it, and it is never summed across producers.** The row is keyed by
producer. The cross-producer total carries only quantities that are one unit for
everyone — changes that landed, sessions attempted, cost in a single currency. A
caller who wants a volume number picks a producer and says which.

Where a comparison is genuinely wanted, compute it from the artifact both
producers left behind rather than from what either reported: reconstruct each file
version from its baseline, diff consecutive versions, count the diff. That is the
only grammar-invariant unit available.

## The repair has a price, and it is not always payable

Reconstruction needs the baseline, and a baseline is recoverable far less often
than the prescription assumes. Over 11,791 real file-edit chains:

- **43.4% replayed cleanly from a recovered baseline.** The rest failed for
  reasons effort does not remove: the working tree the edits landed in no longer
  exists (50.3% of chains were not under version control at all — scratch
  directories, ephemeral workspaces, disposable checkouts), or the replay could
  not find an anchor it was told was present, which means the recovered baseline
  was not the state that was edited.
- Checked against the producer's own record of what each file contained before it
  was touched — **a different layer from the baseline, so the check does not
  inherit the baseline's bias** — a baseline recovered from committed history was
  the true pre-state **84.2% of the time (250 of 297)**. Of the 47 misses, 28
  were content that *is* in history under a different commit, and 19 were states
  never committed at all. A repository's committed state is not the working
  tree's state, and the gap is invisible in the reconstructed number.

So the honest ladder has three rungs, not one:

1. **Baseline recoverable and replay clean** — reconstruct, publish the
   reconstructed count, name the method.
2. **Baseline not recoverable, consecutive versions in the record** — publish the
   version-to-version diff, which needs no baseline, and say it covers only the
   edits after the first.
3. **Neither** — publish no volume figure. An unrecoverable baseline makes the
   quantity unknown, and an unknown rendered as a definite value is the defect
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)), not
   the approximation.

**Where rung 3 is where the comparison lands, the comparison should not be made,
rather than made better.** That is the outcome most often refused, because a
producer-reported number is sitting right there and it is precise.

## Assert both directions

A rule of this shape is passed by over-correcting — by declaring every volume
figure incomparable and publishing none. The pair that catches it must be
asserted together, on the same instrument:

- **Separate when the grammar moves.** Identical net work performed under the two
  grammars must produce different reported payloads. On a planted case with a
  hand-computed true answer of six added lines, the reported payloads were 312
  and 9: a 34.7x spread.
- **Agree when the grammar does not.** Those same two cases must produce the
  *same* reconstructed count. They did — six and six.

An instrument that fails the second assertion is not measuring the work either.
It has replaced one grammar-dependent number with another.

## When not to use this

Do not import the factors above as constants to correct by. They are properties
of one corpus and, as the size bands show, of the trees it was measured on.

Do not read this as a claim that grammar choice is random. It is not: a producer
reaches for a whole-file rewrite on new files and large restructures and for a
ranged replace on surgical edits, so the two populations are different *kinds* of
work. That is why the finding is stated as a within-grammar inflation factor and
never as "one grammar writes more than the other" — the confound would destroy
the second claim and does not touch the first.

Do not extend this to a producer's token counts on the assumption that the
reasoning transfers. It does not transfer cleanly: a token figure's problems are
tokeniser differences and accumulation scope, and those need their own statement.

Do not treat a reconstructed count as a measure of effort or value. It is a
better *unit* for a quantity that still says nothing about whether the work was
worth doing. Everything [batch-size-thresholds](./batch-size-thresholds.md)
refuses to conclude from size, this refuses too.
