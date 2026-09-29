---
layer: technique
type: technique
subject: judge-calibration-and-drift
technique: judge-replacement-bridge
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, estimation-announces-itself, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [a public benchmark's original judge model is retired and you must score new systems with a replacement, putting a number you produced under one judge beside a published number produced under another, a benchmark ships reference outputs with published scores but no human labels, a stored verdict does not say which judge produced it]
---

# Judge replacement bridge

The trust machinery in this subject assumes you own the instrument's history:
a frozen golden set, human labels, a kappa per judge, a verdict keyed to the
judge's identity. A new judge model "starts uncalibrated" and earns its way
back through agreement with humans. That is the right rule for a judge you
run over your own traffic. It says nothing useful about the other situation,
which is common and arrives on a date you did not choose: a benchmark you did
not write scored its systems with a judge model, the provider stopped serving
that model, and every system you now want to compare has to be scored by a
substitute. There are no human labels for a benchmark you do not own. The
published numbers stand, and the instrument that made them is gone.

The bridge is a measurement for that gap. It is **provisional** by design, it
certifies less than a golden set does, and it is worth doing because the
alternative is presenting the substitute's numbers beside the retired judge's
as though they were one series.

## The procedure

1. **Find the anchor.** A benchmark that publishes scores usually ships the
   artifacts those scores were computed over: the reference outputs, the
   reference recordings, the gold answers a strong system produced. Those items
   have a published aggregate under the retired judge, and that aggregate is the
   only fixed point the replacement can be held against. If the benchmark ships
   no reference outputs, there is nothing to bridge with. Record a lead that
   names the missing anchor and score nothing you intend to compare. Name
   **which** published aggregate is the target: a reference row is sometimes
   published twice, in the paper and in the project's own repository, computed
   at different times or under different judge versions, and the two can
   disagree with each other. Bridge against both. A replacement cannot be shown
   closer to the published series than the series is to itself.
2. **Replay the replacement over the anchor, per axis.** Score the reference
   outputs with the replacement judge, once per reported axis and per subset
   the publisher reports (per language, per split). Compare each cell to its
   published aggregate. Do not pool cells: the retired judge may have been
   generous on one axis and harsh on another, and a pooled mean hides the
   difference the bridge exists to find.
3. **Take the tolerance from the replacement's own floor.** Re-score the same
   anchor several times with the replacement, everything held identical, and
   read the spread. That spread is the size of gap the replay cannot
   distinguish from the judge disagreeing with itself
   ([repeatability-floor](./repeatability-floor.md)), or the distance between
   two published anchors if that is larger. A gap inside it is
   indistinguishable from noise; a gap outside it is a judge-swap effect and is
   reported as one. Without this step the word "aligned" cannot be wrong, and a
   verdict that cannot be wrong is not a verdict.
4. **Count the rows on both sides.** A published run and a replay rarely score
   the same number of valid rows: items a judge refused, returned nothing for,
   or could not parse drop out differently. A coverage difference is a
   confound on the gap and is stated beside it, never absorbed into it.
5. **Read the signs before deciding anything.** If the gaps take both signs
   across cells, the replacement has no systematic offset to subtract, and
   applying a correction factor would manufacture one. If every gap has the same
   sign, there is an offset, and it is still not subtracted: it is disclosed as
   a comparability limit, because a constant applied to a mean cannot be checked
   against any item.

## What the bridge licenses, and what it does not

It licenses **aggregate-level comparison with a stated caveat**: this system
scored so much under the replacement, the retired judge scored the reference
outputs so much, and here is the gap and the floor. It does not license:

- **Item-level claims.** Two judges can agree on a mean while disagreeing on
  most items, and the anchor is an aggregate. Nothing in the replay measures
  per-item agreement.
- **A trusted verdict.** The replacement is bridged, not calibrated. Anything
  that gates a release or reaches a customer as fact still needs the
  human-label path in
  [golden-set-agreement-measurement](./golden-set-agreement-measurement.md);
  until then its scores are leads, not measurements
  ([_laws: the-judge-is-both-untrusted-and-under-test](../../../_laws.md#the-judge-is-both-untrusted-and-under-test)).
- **A merged series.** The retired judge's published row and the replacement's
  row sit in separate columns under separate headers. A leaderboard row that
  mixes them has restated history with an instrument that did not produce it.

## Carry the judge's identity, or there is nothing to bridge from

The bridge scopes itself to "the rows the retired judge produced", which is a
query, and the query only works if every stored verdict names the judge that
made it. The shape worth naming is a fallback ladder inside a judge client: on
a rate limit or an outage the call retries against the next model in a list,
the pick is recorded, and the model that made it is dropped on the way to the
stored row. Every stored verdict then reads as one judge's while being a
mixture, and the day a rung of the ladder is retired there is no way to say
which stored rows it touched. Write the judge's full identifier into the row
where the verdict is written, name it in the header of every result table, and
treat an error as its own state rather than a tie: a failed call that is stored
as "no preference" is an outage counted as an opinion.

## Decision rules

- **No anchor, no comparison.** A replacement judge with no reference outputs to
  replay is scored alone and never placed beside the published series.
- **Per cell, not pooled.** Each axis and each subset is its own comparison.
- **The tolerance is the replacement's measured floor**, or the distance between
  two published anchors when that is larger, and never a threshold chosen
  because the gaps looked small.
- **Name the anchor.** Two publications of one reference row are two anchors.
- **Both signs mean no correction; one sign means a disclosed limit.** Neither
  means a subtracted constant.
- **The bridge expires the moment the verdict gates something.** At that point
  the golden-set path applies.
- **The judge's identity is a column of every result and every stored verdict**
  ([_laws: estimation-announces-itself](../../../_laws.md#estimation-announces-itself)).

## A measured case, and what it left out

A public benchmark for instruction-following speech synthesis was scored by a
preview-tier judge model that was later withdrawn. A reproduction team replayed
a substitute over the benchmark's own reference recordings and compared with
the published aggregates. Across six axis-by-language cells the gaps ran from
about -2.2 to +1.5 points, four positive and two negative, and the two runs
scored different numbers of valid rows. The team concluded the results were
"broadly aligned" and supported the integration's correctness. The design was
sound: the anchor was the right one, the cells were reported apart, and the
substitute's identity was named beside the results. What the conclusion
could not carry was its own adjective. No floor was reported, so a two-point gap
on a thousand items could not be sorted into "the judge disagreeing with
itself" or "the judge being different", and the coverage difference was named
but not separated from the gap. The mixed signs were the useful finding and the
right reason to apply no correction; the tolerance was the missing half. The
anchor was also less fixed than it looked. The same reference row had been
published a second time in the benchmark's paper, and the two publications
differed by up to about four points on individual cells, more than the replay
moved. Against the paper's row the same replay ran from about -4.3 to +4.1, so
whether it "aligned" depended on which published number was picked.

## When not to use this

- **You own labels.** A golden set of human-scored items beats an aggregate
  anchor on every axis the bridge covers; use it.
- **The anchor is small.** An aggregate over a few dozen reference outputs has a
  sampling error larger than any gap worth detecting. Report the replay as
  inconclusive rather than aligned.
- **The benchmark measures something the replacement cannot perceive.** If the
  retired judge listened to audio or looked at images and the substitute reads
  only a transcript or a caption, the two are different instruments, not a
  replacement and its predecessor. No replay closes that gap.
