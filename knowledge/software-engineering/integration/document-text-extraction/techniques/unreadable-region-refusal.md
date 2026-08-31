---
layer: technique
type: technique
subject: document-text-extraction
technique: unreadable-region-refusal
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [an extractor returned clean text for a document you know is partly scanned, choosing between a count of unreadable regions and a list of them, deciding whether one bad page should fail a hundred-page document]
---

# Unreadable-region refusal

A partial extraction is a failure **when its partiality is invisible in the
result**. That is the whole test, and it is a test about the *output shape*,
not about how much was lost. Text carries no hole. A hundred-page document
that extracted ninety-nine pages produces prose that begins, flows and ends;
nothing in it says a page is gone, and no consumer of it — an index, an
embedder, a model, a reader — has any instrument for noticing. So the loss has
to be reported by the only party that ever knew about it, at the only moment it
was knowable, or it is not reported at all.

This is the extraction dialect of
[failure-not-empty-success](../../../_laws.md#failure-not-empty-success): *could
not read this region* must be spelled differently from *read this region, it
was blank*. Both produce zero characters. Only one of them is a fact about the
document.

## The fraction is not the trigger

The instinct is to make refusal proportional — fail if more than half the
document is unreadable, warn otherwise. It is wrong, and it is wrong in the
direction that costs most. A document that is entirely unreadable produces an
empty result, and empty is at least *conspicuous*; someone will notice a search
hit that returns nothing. A document that is 1% unreadable produces a
convincing artifact with a hole in it, and that one survives every review it
will ever get.

So the rule inverts the intuition: **the smaller the loss, the more necessary
the refusal**, because a small loss is exactly the one the output cannot
express. Any threshold — any fraction, any character count, any "if it is
mostly fine" — is a decision to be silent about the cases where silence is most
expensive.

## The locus survives, as a list

A count answers *how bad*. A list answers *which*. Only the second can be
handed to the thing that fixes it, and that difference is the whole reason this
technique exists rather than being a sentence in an error-handling document.

The concrete failure is easy to reproduce and common in the field: a pipeline
computes the number of unreadable regions, stores it in a column, renders it in
a warning, and — with a recognition capability sitting in the same process —
cannot route those regions to it, because the identities were reduced to a
cardinality at the moment they were known and nothing later can recover them.
The count was cheap to produce and it destroyed the only information that had
downstream value.

Three rules keep the locus alive:

- **Reduce last, never at the point of measurement.** The stage that discovers
  which regions failed emits identities. Anything that wants a number derives it
  from the list. A count computed early is a list deleted early.
- **Carry the list across every boundary the verdict crosses.** Process,
  language, serialization, network. This is the point at which most
  implementations lose it, because the ergonomic error type at each hop is a
  string.
- **A surface that can only render prose still gets the list — in the prose.**
  The refusal's human-readable form names the regions, compactly and in ranges,
  because a caller that displays only a message would otherwise receive a
  strictly worse report than one that inspects fields. Test this rendering
  explicitly and write the reason in the test's name: the untyped surface is the
  one you will forget.

Whatever number does travel carries its predicate
([count-carries-predicate](../../../_laws.md#count-carries-predicate)): "3
unreadable" is not a finding; "3 of 12 regions yielded no text after full
extraction" is, and it is the version that survives being pasted into a ticket.

## When a count is enough

There is exactly one case, and stating it is what keeps the rule from being
dogma: **when nothing downstream can act per region, a count is honest
reporting and a list is unused ceremony.** If the only available responses are
"accept the document as it is" and "ask the user for a better copy", the
identities buy nothing — the user is asked for the whole file either way.

The test is a design question with a checkable answer: *name the consumer that
would receive the region identities and what it would do with them.* If you can
name it — a recognition pass, a targeted re-fetch, a review queue that shows a
person the specific page — carry the list. If you cannot name it, carry the
count, and record that you made the choice, because the day someone adds a
recognition pass is the day the decision needs revisiting and the reason needs
to be findable.

Note the asymmetry in cost of being wrong. Carrying a list you never use costs
a few integers. Carrying a count you later need costs a full re-extraction of
the corpus, and that is assuming the corpus still has the source bytes.

## Refusal is a typed value, not a message

The refusal is a variant in the component's error vocabulary with the region
list and the total region count as fields, and with a stable machine-readable
name that callers branch on independently of the message text. The message is
copy; it gets reworded, localized and truncated. The name and the fields are the
contract. How that contract propagates and who ultimately learns of the failure
is the resilience domain's discipline, and this technique is one of its
consumers — what it adds is *which fields the variant must carry*, which nobody
outside this subject knows.

## Three states on the record, not two

Once the caller decides to admit a partly-readable document rather than reject
it, the region list has to persist somewhere durable, and the schema that
persists it needs three states rather than two:

| state | meaning |
| --- | --- |
| assessed, complete | every region yielded text |
| assessed, these regions unreadable | the list, non-empty |
| not yet assessed | nothing has looked |

An empty list and an absent list must not be the same value. Collapsing them
renders *we have not checked* as *we checked and it was fine*, which is
[unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value) at the exact
boundary where an optional field meets a query that assumes a non-optional one.
The practical consequence is that a corpus built before the assessment existed
reports itself clean, and the backfill nobody scheduled becomes invisible.

## When not to use this

Do not apply the refusal to *recoverable producer quirks*. A malformed
attribute the reader repaired, a deprecated construct it mapped forward, an
oddity it skipped that carried no content — these are recovered and logged, and
promoting them to refusals trains callers to ignore refusals, which costs more
than the quirks ever could. The line is content: a refusal is owed when
**content-bearing material could not be read**, and never for a defect that cost
the output nothing.
