---
layer: technique
type: technique
subject: delivery-analytics
technique: attribution-channels
status: forged
laws: [one-authority-per-vocabulary, count-carries-predicate]
shared_with: []
use_when: [deciding what produced a change, measuring tool-authored or agent-authored share, comparing attribution rates across time or across repositories]
---

# Attribution channels

"What produced this change?" reads like a field lookup and is not one. The
declaration can arrive through at least five independent channels, each with a
different population that uses it, a different failure mode, and a different
coverage:

1. **Account identity** — the author or committer is a recognized machine
   account. Precise when present; present only when the producer runs under its
   own credentials, which most do not.
2. **Structured message trailers** — a conventional key-value line appended to
   the message declaring a co-author or generator. High precision, and the
   channel most likely to be preserved through rebases and squashes because it
   lives in the message body.
3. **Branch or reference naming conventions** — a prefix a tool applies to the
   branches it opens. Cheap, and the first thing lost when a team renames.
4. **Message body phrasing** — a signature sentence a tool appends. Precision
   drops fast: humans quote these lines, templates copy them, and a substring
   match on a common phrase will find changes that merely *mention* the tool.
5. **Side-channel records** — a session log, a metadata store, or an audit
   trail kept by the producing tool, joined back to the change afterwards. The
   highest-fidelity channel and the least available, since it requires
   cooperation from the producer's own systems.

The load-bearing empirical fact: **the channels barely overlap.** Published
census work over very large repository populations has found that
account-identity lookup alone — the channel most adoption studies rely on —
recovers a small single-digit percentage of what the union of channels
recovers, an order-of-magnitude relative-recall gap. A single-channel scheme
therefore does not produce a conservative estimate. It produces a wrong one,
sampled by whichever convention the observed teams happened to adopt, and
presented with the same confidence as a right one.

## Procedure

**Declare the producer vocabulary once.** The set of producers a change may be
attributed to — each machine or tool identity, plus `human` and
`unattributed` — is one authoritative enumeration
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Every channel's detection rules map into that enumeration; no channel may mint
a producer name of its own. Two hand-maintained lists of producer identities
diverge on the day someone adds a tool, and they diverge silently, because both
still return well-formed answers.

**Evaluate channels in a declared precedence order.** Order by precision, not
by convenience: side-channel record, then account identity, then trailer, then
branch convention, then body phrasing. The first channel that fires wins, and
evaluation stops. Precedence must be explicit and stable, because it is the
only thing that keeps two changes carrying conflicting signals from being
counted differently depending on evaluation order.

**Separate automation from authorship, and authorship from review.** The
costliest attribution defect in practice is not a missed change — it is a
category collision. Routine automation (dependency bumps, release tagging,
format passes) runs under machine identities that look exactly like
tool-authored work to an identity-based detector, and a repository whose only
machine activity is version bumps will report an enormous tool-authorship share
that is entirely false. Automation, tool-assisted authorship, and tool-assisted
*review* are three vocabularies, kept separate on purpose; an identity may
appear in more than one, and a detector that reads a single merged list
produces confident nonsense. Corollary: the headline share should be derived
from the channel with real attribution semantics (a declared producer), not
from the machine-account fraction, which is a proxy for automation adoption.

**Record which channel fired, with every attributed change.** This is the
technique's non-negotiable output and the one most implementations skip. Two
quarters of "18% tool-authored" are not comparable if the first quarter's
number came mostly from a branch convention that the team stopped using. The
channel breakdown is what lets a reader distinguish *behaviour changed* from
*our instrument changed* — [count-carries-predicate](../../../../_laws.md#count-carries-predicate)
applied to provenance rather than to the count itself.

**Keep `unattributed` as its own bucket.** A change no channel claimed is not a
human-authored change; it is a change whose producer is unknown. Folding it
into `human` inflates the human share by exactly the amount of the instrument's
blindness, and does so in the direction that makes the instrument look
complete. Report three quantities, always: attributed-to-a-tool, attributed-to-
a-human by positive evidence, and unattributed.

## Decision rules

- **When a change carries signals from two producers, take the precedence
  winner and record the conflict rate.** A rising conflict rate is the earliest
  warning that a detection rule has become too loose.
- **Record each channel's presence independently of the precedence outcome.**
  Precedence answers "what is this change labelled"; it must not be allowed to
  answer "how many changes carried a trailer". A change labelled by a
  higher-precedence channel that *also* carries a trailer belongs in the
  trailer-grounded numerator, or that rate silently under-reports by exactly
  the overlap. Keep the winner and the per-channel flags as separate outputs.
- **When an authorship record is missing or its account was deleted, read it as
  human.** The conservative read never inflates the tool share, which is the
  direction a reader will treat as a finding.
- **When a channel's precision cannot be stated, do not enable it for a metric
  that is published.** Body-phrase matching is acceptable for exploration and
  unacceptable as the sole basis of a customer-visible share, because its false
  positives are invisible in aggregate.
- **When squash-merging is the norm, weight the trailer channel above the
  branch channel**, and verify that the squash preserves trailers — a host that
  drops them converts a high-precision channel into a silent zero.
- **When attribution feeds a per-repository comparison, require the same
  channel set to be enabled on both sides.** Comparing a repository where the
  side-channel join is available against one where it is not compares
  instruments, not teams.
- **When the unattributed share exceeds the attributed share, report coverage
  instead of the rate.** A number derived from a minority of the population
  should be presented as "we could identify a producer for 38% of changes",
  not as a producer mix.

## When not to use this

Do not use attribution to answer "how much of our code did a tool write". The
channels attribute *changes*, not lines, and the relationship between the two
is not stable across teams, tools, or task types. A change-level attribution
rate is a legitimate measure of *where tools are in the workflow*; converting
it into a code-share percentage adds a fabricated conversion factor to an
already lossy signal.

Do not use attribution to rank people. The channels record which producer
declared itself, which correlates with a team's disclosure conventions far more
than with anything about an individual — and the ethics of identifiable-human
delivery claims belong to the people-analytics subject, not here.

Do not retrofit attribution onto history and treat the result as a trend. The
conventions that make older changes detectable did not exist for most of that
history; the resulting curve mostly plots the adoption of disclosure practice.
If a historical series is published anyway, it carries the channel breakdown
per period, so the reader can see the instrument change under the line.
