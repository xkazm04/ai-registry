---
layer: technique
type: technique
subject: index-free-random-access
technique: structure-derived-read-budget
status: forged
laws: [limits-are-derived, count-carries-predicate]
shared_with: []
use_when: [bounding a speculative parse whose wrong branch has no natural end, choosing what a head sample must record, a lookahead constant written as a literal]
---

# Structure-derived read budget

A speculative parse must be bounded in **bytes derived from sampled
structure**, never by "read until some number of records parse". The rule
sounds like tuning advice and is not: it is the difference between an
operation whose cost is bounded and one whose cost is proportional to the size
of the file, and the whole design exists to avoid the second.

## The asymmetry is the entire technique

The two hypotheses a recovery step tests do not fail symmetrically.

Read a region that is genuinely unquoted, correctly, and records terminate
every few hundred bytes. Read that same region under the hypothesis that a
quote opened just before you — the wrong hypothesis — and the parser is now
inside a field that will not close until it finds the next quote character.
On text that contains no further quotes, that is **the end of the file**.

So a stop condition phrased in records is a stop condition the wrong branch
may never reach. The correct branch stops in microseconds; the incorrect one
reads to the horizon. And this is not the rare case — it is the *common* case,
because roughly half of all landings are on unquoted bytes and every one of
those runs the quoted hypothesis to exhaustion. A jump that was supposed to
cost a bounded read has become a full scan, per jump, and the feature is
slower than the linear pass it replaced.

Phrase the stop condition in **bytes** and the asymmetry disappears: the
failing hypothesis costs exactly what the succeeding one costs, and the
operation's cost is a constant chosen at sample time rather than a property of
the input. That is the only thing that makes the primitive composable — a
segmenter performing a handful of jumps, a bisection performing a logarithmic
number of them, and a sampler performing one per drawn record all rely on each
jump costing the same bounded amount.

## The sample is the source of every constant

The budget is not the only derived number, and treating it as one is how a
codebase ends up with four unrelated literals that should all have moved
together. **One head sample, read once at open, supplies every constant this
subject uses** ([limits-are-derived](../../../../_laws.md#limits-are-derived)).
It must record:

- **the field count** — the structural invariant the rejection step tests
  against;
- **the maximum record size in bytes** — the base the read budget is derived
  from;
- **the per-field mean sizes** — the shape profile the tie-break compares
  against;
- and, derivable from the mean record size and the stream length, **an
  estimated record count** — which is what lets callers decline the cheap path
  when it would not pay.

The budget is then the sampled maximum record size times a constant, and the
constant's job is to guarantee that a correct hypothesis parses several
complete records within the budget even when the region contains records
larger than any the head held. It is a headroom multiplier and it must be
written as one. A measured instance uses a sample of 128 records and a
multiplier of 32; both are instances rather than laws, and the multiplier
comes from a base-two habit rather than from a measurement, which is worth
saying out loud because a reader who copies it should copy it as a starting
point and not as a finding.

What makes this a derivation rather than a decoration is that it is
**computed**. A comment reading "32 times the maximum record size" beside a
hardcoded byte count is the failure in its most convincing disguise: it stays
correct until somebody meets a file with wider records, and then it is a
number that no longer tracks its input while still explaining itself as though
it did.

The one genuinely free parameter is the sample size, and it is a **floor**
rather than a target: enough records to characterise the field count and to
give the per-field means a stable shape. Raising it is the honest remedy when
an artifact's head does not represent it, and it is the only remedy — there is
no multiplier that rescues a sample drawn from an unrepresentative region.

## What a budget cannot buy

A bounded read makes the wrong hypothesis cheap. It does not make it
identifiable, and conflating the two produces a real defect: near the end of
the stream, the budget cannot be filled, both hypotheses parse too few records
to reject, and an implementation that treats an unfilled budget as a normal
short read will resolve the tie on almost no evidence. **An unfilled budget is
a refusal, not a smaller sample.** The remedy for the tail is to land earlier
and scan forward, or to read the stream in reverse.

The budget also bounds only the *speculative* read. It says nothing about what
happens after the boundary is found, when a caller streams from that offset to
wherever its work ends. Those are different costs with different owners, and a
report that adds them together is describing neither.

## Publishing the numbers

Every constant here travels — into a flag's help text, a tuning guide, a
defect report — and each one is meaningless without what it was derived from
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). A
budget quoted as a byte count is unusable by anyone with different data; the
same budget quoted as "thirty-two times the largest record in a
hundred-and-twenty-eight-record head sample" transfers to any artifact. The
same holds for the estimated record count, which is an **estimate from a
sample** and must be named as one wherever it surfaces: a caller that decides
whether to take a cheap path based on it is making a sound decision, and a
report that prints it beside exact counts is manufacturing a false one.

## Decision rules

- **When a speculative branch has no natural termination, bound it in bytes.**
  Any stop condition phrased in units the failing branch does not produce —
  records, matches, complete structures — is unbounded on the branch that
  matters.
- **When choosing the bound, derive it from a measured property of the input**,
  not from a benchmark on one file. A bound tuned against a sample corpus is a
  bound that fails on the first artifact outside it, and the failure is a
  refusal on data that should have worked.
- **When the budget cannot be filled, refuse.** Do not decide on a partial
  read; the tie-break's evidence quality is what the budget was sizing.
- **When one sample can supply several constants, collect it once and derive
  them all from it.** Four constants sampled independently drift; four
  constants derived from one record of the file's structure move together.
- **When an artifact defeats the sample, raise the sample rather than the
  multiplier.** The multiplier buys headroom against record size; only the
  sample buys representativeness, and representativeness is what was missing.
- **When publishing any of these numbers, publish the derivation with them.**

## When not to use this

**When the format's framing is unambiguous.** A format whose record separator
cannot occur inside a field — line-delimited records with no in-band escaping —
has no second hypothesis, so there is no failing branch to bound and no sample
to collect. Recovery there is a scan to the next separator, and importing this
machinery adds an open-time cost for nothing.

**When the whole artifact fits comfortably in memory.** A budget is a device
for not reading everything; where reading everything is affordable, read
everything and skip the apparatus.

**As a substitute for the refusal.** A budget makes a wrong hypothesis cheap;
only the rejection step makes it *detectable*. An implementation that bounds
the read and then returns whichever hypothesis got furthest has a fast wrong
answer, which is the worst combination available.
