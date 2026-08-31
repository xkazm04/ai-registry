---
layer: technique
type: technique
subject: document-text-extraction
technique: screen-then-confirm-detection
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [a per-region readability check is too slow to run over the whole corpus, users are being shown failures that turn out to be readable documents, someone proposes a second heuristic to clean up the first heuristic's output]
---

# Screen, then confirm

Deciding whether a region of a document holds readable text is cheap and
unreliable, or reliable and expensive, and there is no third setting. The
cascade that gets both is: a **cheap screen deliberately biased toward false
positives**, followed by **the real operation, scoped to what the screen
flagged**. What makes it work is not the two-stage shape — plenty of pipelines
have two stages — but the rule about what the second stage is allowed to be.

## Stage one: a screen, tuned to over-report

The screen samples structure without doing the work: does this region declare a
text stream at all, is the declared text implausibly short for the region's
dimensions, is the region dominated by a single large image. Each of these is a
proxy, and each is wrong in predictable ways — a sparse title page looks
scanned, a dense infographic with a caption looks scanned, a region whose text
is real but stored unusually looks scanned.

Tune the screen so that a region with no text **never** escapes it, and accept
whatever false-positive rate that costs. The asymmetry is not aesthetic: a
missed region becomes silent loss in the output, which this subject exists to
prevent, while an over-reported region becomes an extra call to stage two,
which costs money and nothing else.

The screen's output is a **suspicion set**, and the vocabulary matters because
the implementation will try to leak it. A suspicion is not a verdict, and it
must not escape the component under a name that reads like one — not in a
field called `unreadable`, not in a metric labelled "scanned pages", not in a
message shown to a user. Publishing stage one's guess as a finding is
[unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value) with a
sampling step in front of it: *we did not look properly* rendered as *we
looked*.

## Stage two: the real operation, not a better heuristic

Stage two runs **full extraction** over the flagged regions and asks whether it
produced anything. That question has a property no heuristic question has: it
is answered by the same code path whose output the caller will receive, so its
verdict cannot disagree with reality in the way a proxy can. This is
[gate-sees-target](../../../_laws.md#gate-sees-target) applied to a detector —
the screen reads a proxy for text, and a proxy passes exactly when it diverges
from the target, so the confirming stage has to read the target itself.

The tempting alternative is a smarter second heuristic: a better sampler, a
tuned threshold, a small classifier over the first stage's features. It is
always available, it is always cheaper than extraction, and it is always wrong
for this job, because it does not remove the error class — it moves the error
onto a different set of documents while giving the pipeline the *appearance* of
verification. Two heuristics in series produce one composite heuristic with a
harder-to-explain failure surface. The question "which documents does this
still get wrong?" has an answer for a screen-then-extract cascade (the ones
extraction itself fails on) and no tractable answer for a screen-then-screen
cascade.

**The decision rule:** a cheap detector may over-report only if the confirming
stage is the real operation, and the confirming stage must run on the flagged
subset alone. Drop either half and the design stops paying.

## The economics are the licence, so compute them

The over-reporting is affordable because the expensive stage is billed against
the flagged count rather than the corpus. That is an arithmetic claim, and it
is checkable:

    over-report ratio = flagged regions / confirmed-unreadable regions
    cascade cost      = screen(all regions) + extract(flagged regions)

Track the ratio as an operating number. It is the honest price of the design,
and its drift is diagnostic: rising means the screen has stopped
discriminating — new document sources, a new producer tool, a format revision —
and the cascade is degenerating toward running the expensive stage over
everything with a sampling step wasted in front of it.

There is a threshold at which the cascade stops earning its complexity, and
you should know where yours is before you build it: when the flagged fraction
approaches the whole corpus, or when full extraction is itself cheap enough to
run unconditionally, **delete the screen**. A one-stage pipeline that always
does the real work is simpler, has no suspicion-versus-verdict hazard, and is
easier to reason about than a cascade whose first stage flags everything.

## Confirmed does not mean explained

Stage two says *the real operation produced nothing here*. It does not say
*why*, and the distinction has to survive, because the causes route
differently: a region with no text layer wants optical recognition; a region
whose text is present but undecodable wants a different repair entirely; an
encrypted or structurally broken container is not a region-level problem at
all. Where the extraction path can distinguish causes cheaply, it should, and
the refusal carries the cause alongside the region identities. Where it cannot,
the cause is *unknown* and says so, rather than defaulting to the most common
one — the default is the guess that will be re-derived as fact by the next
three consumers.

## When not to use this

Two cases. First, when the real operation is cheap relative to the screen's
savings, as above — just run it. Second, when the screen and the confirmation
would read the same evidence, which happens more often than teams expect: if
your "cheap screen" is itself a partial extraction and your "confirmation" is
the same extraction with a larger budget, you have one stage with two budgets,
and you should say so and tune the budget rather than pretending to a cascade.
The cascade is honest only when stage two answers a *different kind* of
question from stage one.
