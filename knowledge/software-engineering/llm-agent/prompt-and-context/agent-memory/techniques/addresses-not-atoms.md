---
layer: technique
type: technique
subject: agent-memory
technique: addresses-not-atoms
status: forged
laws: [unknown-is-not-a-value, gate-sees-target, limits-are-derived]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [choosing how finely to cut a store's items, a proposal to hold one atomic fact per item, deciding between finer items and an always-loaded index, a granularity change raised a recall score and nobody checked what it cost, pricing a little retrieval noise as cheap because each item is small, a recall budget reaches only a handful of items]
---

# Addresses, not atoms

[addresses-before-compression](./addresses-before-compression.md) prices a pass
that merges items. This technique owns the same axis run the other way — **how
finely the store's items are cut in the first place** — because that decision is
made once, at write time, by whoever designs the schema, and it is almost always
made on grounds of tidiness. It is not a tidiness decision. Under a read budget
it decides how much of the store the reader can reach at all, and it decides how
often the reader will guess.

The rule it corrects is the intuitive one: *store one atomic fact per item, keep
each item small, and accept a little retrieval noise because each item costs
almost nothing.* Measured with the piece count held fixed, the three clauses come
apart: small pieces pay, **atomic** pieces buy nothing over arbitrary ones, and
the noise is not free — it is a bill, paid in abstention, that nobody was shown.

## The gain is reach, and reach is counted in answer-bearing items

One store of sixty-one items and twenty-five thousand words; the same words in
every arm; the same retriever, the same read budget charged identically
(including each item's own address line); the same probe set with answers
verified against real systems and its key frozen before any arm ran; three
replicates a cell; deterministic scoring, no judge. The always-loaded index is
**withheld**, for the reason the last section gives.

| the store's items are | pieces | mean piece | items the budget touched | of the 20 holding an answer | score / 22 |
| --- | --- | --- | --- | --- | --- |
| whole documents | 61 | 410 w | 9 | 6 | 14.0 [14–14] |
| cut at fact boundaries | 749 | 33 w | 44 | 18 | **16.7** [16–17] |
| cut at equal word offsets | 749 | 33 w | 53 | 18 | **16.7** [16–17] |
| cut into eight-word fragments | 3,149 | 8 w | 61 | 20 | **17.7** [16–19] |

Nine items of four hundred words filled the budget. The store held an answer in
twenty of its items and the reader saw six of them — and no ranking could have
repaired that, because there was no room. Cut the same words finer and the same
budget reaches eighteen. That is the entire gain, and it is worth two and a half
to three and a half points of twenty-two.

**It is reach, not fineness, and one arm separates them.** Atomize *only* the
nine items the budget already reached and leave the other fifty-two whole: item
count rises 61 → 174, reach rises 9 → 15 items and 6 → 7 answer-bearing ones,
and the score **falls** to 12.7 [12–13] — below the whole-document arm, on
non-overlapping ranges, and it is the only arm in the set that also loses a
point on the probes the store cannot answer. Fineness spent inside the reader's
existing reach is a loss on every axis. Fineness that extends the reach is a
gain. They are opposite signs of one variable, and a design discussion about
"granularity" that does not say which one it means is not about anything.

**Reach is not the same as coverage, and only one of them tracked the answers.**
The consumer-free instrument — is each answer key present somewhere in the words
the reader was given — moved by two points across the whole set (12, 13, 14 and
14 of 17 keyed probes) while the score moved by three and a half, and at the
tighter budget it ran *backwards*: the fact-cut arm carried the fewest keys of
any arm, ten of seventeen, and still beat the whole-document arm's eleven. Coarse
items are few but long, so they carry keys the budget cannot make usable. Count
reach in **items the budget touched that hold an answer**, and report coverage
only beside a score, never instead of one.

So state the limit the way it is derived
([limits-are-derived](../../../../_laws.md#limits-are-derived)): the useful
piece size is *the read budget divided by the number of distinct items an answer
typically needs*, and both terms are properties of the deployment. It is never a
token count carried in from somewhere else.

## Where the cut falls does not matter — and that is the finding

The appealing version of this rule says the piece must be an *atomic fact*, so
that a retrieved piece is all signal. Test it with the count held fixed: same
words, same number of pieces, cuts moved from fact boundaries to equal word
offsets — the arbitrary cut scored **identically** at the looser budget (16.7
against 16.7) and **two points better** at the tighter one (16.0 [16–16] against
14.0 [13–15], ranges not overlapping). Atomicity is not the discriminator. Piece
count is, and a taxonomy that survives only while the count moves with it is a
gate scoring its proxy
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The mechanism is worth stating, because it is not that the boundary is harmless:

**A fact-boundary cut produces a piece that is grammatically complete and
epistemically partial.** The qualifier, the mechanism, the flag, the exception —
the thing that makes the claim actionable — lives in the *next* sentence. Two
probes show it exactly. Asked how to clone a deeply nested repository on a
path-limited system, the fact-cut arm retrieved the two atoms holding the
short-path advice, answered with them, and added, correctly, that the
configuration flag was not in the store; the flag was three sentences further
down the document those atoms came from. Asked what a particular flag
combination actually does, it retrieved the atom holding the symptom and
answered with the symptom; the cause was the adjacent sentence, and the
whole-document arm had both. The arbitrary cut won the first probe for the
reason that explains the whole null: a cut that ignores fact boundaries
sometimes keeps two neighbouring facts **together**, and a cut that honours them
never does. It severs precisely the joins a fact depends on.

Which connects this to a rule the subject already holds. Recall items are
substitutes only where the task does not compose; where it composes they are
complements, and a budget that fits four of five jointly required items does not
score four-fifths — it fails while returning a full-looking result
([recall-injection](./recall-injection.md)). **The cut is what creates the
complementarity.** A question answered by one document becomes a question
answered by three atoms, and the store's designer chose that at write time,
usually without knowing it. Atomizing does not make facts independent; it makes
their dependence invisible.

## Reach is paid for in silence, and the score cannot show it

This is the bill. Split every non-scoring answer into an honest abstention and a
confident wrong one — same frozen keys, same eighteen answerable probes:

| the store's items are | score | answered **wrong** | answered "not in store" |
| --- | --- | --- | --- |
| whole documents | 14.0 | 1.7 | 6.3 |
| cut at fact boundaries | 16.7 | **4.7** | 0.7 |
| cut at equal word offsets | 16.7 | **3.7** | 1.7 |
| eight-word fragments | 17.7 | 3.0 | 1.3 |

A finely cut store nearly always has something plausible to say. The
whole-document store declined six times and guessed wrong under two; the
fact-cut store declined under once and guessed wrong nearly five times. Three
points of the score moved up and three answers moved from silence into
confident error, and one total cannot tell those apart.

Two things this is **not**. It is not the store being asked what it never held:
the probes written to be unanswerable scored four of four in every arm and every
cell of the table above, so the guessing is happening on questions the store does
answer. And it is not clipping mid-sentence: the worst
offender is the arm whose every piece is a complete sentence. It is a *fragment
of the right item* reading as the whole of it — unknown rendered as a definite
value ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)),
laundered at the boundary where a piece of a document meets a reader that cannot
see the document.

So the subject's rule against truncating a recalled item generalises to the
store's own boundaries. **A fine cut is a truncation performed at write time**,
and it manufactures the same false beliefs — with one difference that makes it
worse: a packer's truncation is visible at the cut, and a stored piece's is not.
The piece looks whole.

The operational consequence is a measurement obligation. A granularity change is
an abstention change, and it must be measured as one: on the same arm, count the
answers that were wrong separately from the answers that were missing. A score
that rose while abstention collapsed has bought points with false beliefs, and
that is a different product from the one the change was proposed for.

## Above the addressing surface, none of it happens

Repeat every cell with the always-loaded index present and all three stores score
**21.0 of 22 — identically**. Granularity stops existing as a variable.

That is the same boundary [addresses-before-compression](./addresses-before-compression.md)
found from the other side: merging cost accuracy where an index survived the pass
and bought accuracy where none did. One axis explains both. An index is a dense
layer of addresses the reader consults before the items; fine items are a dense
layer of addresses the retriever ranks. **A store needs one of the two, and
buying both pays twice for the same thing** — which is why a fine cut is worth
proposing for a store that has no surveyable surface, and worth refusing for one
that does, where it costs abstention and returns nothing.

The corollary is a cheap first question, before any granularity work: does the
reader see a list of what the store holds? If yes, the finer cut is not the
repair, and the measurement that would have shown it is saturated — every arm
lands on the same twenty-one of twenty-two, so the comparison can register a
loss and never a gain.

## What would falsify this

- **A cut-position effect.** One store where cutting at fact boundaries beats
  cutting at equal word offsets by two points or more, at equal piece count and
  equal words. Then atomicity is a real variable and this technique names the
  wrong one.
- **Reach held fixed and fineness still paying.** The restricted-split arm is
  the load-bearing observation here; one contrary instance retires the
  reach explanation and the whole first section with it.
- **A finer cut that keeps its abstention.** A store cut finer that raises the
  score while the wrong-answer count holds. Then reach is free after all and the
  measurement obligation above is over-cautious.
- **A fine-cut store beating a coarse one with the addressing surface present**,
  on a probe set that is not saturated. Then the surface is not the ceiling and
  the two address layers are not substitutes.
- **A regime where finer stops paying.** None was found down to eight-word
  address-less fragments, which was predicted to be worst and scored best,
  paying a twenty-seven per cent address tax out of its own budget and winning
  anyway. Any store where accuracy turns over as the pieces shrink bounds this
  technique, and the bound would be worth more than the rule.
