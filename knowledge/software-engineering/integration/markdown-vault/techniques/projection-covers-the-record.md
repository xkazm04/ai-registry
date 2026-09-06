---
layer: technique
type: technique
subject: markdown-vault
technique: projection-covers-the-record
status: forged
laws: [gate-sees-target, derivation-names-recomputation]
shared_with: []
use_when: [a record is split into several indexed fields before it is written to a mirror, a note is provably present and search still cannot find it, one pass extracts a construct and another removes it, deciding what a mirror is allowed to store]
---

# Projection covers the record

A mirror is not written from the record; it is written from a **projection** of
the record into the mirror's fields. A note becomes a title, a body, a tag set,
a timestamp — and something has to decide which bytes go where. That decision is
a stage in the rebuild pipeline, it is where content is lost, and it is
routinely the only stage nobody owns.

The distinction that makes this its own technique: every other honesty
obligation on a mirror is about **freshness** — the rebuild path exists, the
incremental gate is hash-keyed, the skip-gate's proxy is confessed
([mirror-indexes](./mirror-indexes.md)). Freshness asks *does the mirror reflect
the record as of the last write?* Fidelity asks *does the mirror reflect the
record at all?* They are independent, and the second one fails silently in a way
the first cannot detect. A mirror rebuilt from scratch on every single query —
maximally fresh, the hash gate irrelevant, no staleness window whatsoever — is
still missing whatever the projection dropped, because the loss happens *inside*
the rebuild. Re-running the rebuild reproduces it exactly.

## The projection is a partition, and partitions have holes

The common shape is extract-and-strip: one pass pulls a construct out of the
body into its own field, another pass removes that construct from the body so
it is not indexed twice. Tags, front-matter blocks, task markers, inline
citations, embedded queries — all the same shape.

Two passes, and the defect is that **each pass carries its own predicate**. The
extractor usually earns an exclusion the stripper never hears about: *a tag
inside a code sample is not a tag*, *a link inside a quote is not a citation*.
The exclusion is correct, it is the more thoughtful of the two rules, and it is
applied on exactly one side. What lands in the gap is content that the
extractor declined to claim and the stripper removed anyway — present in the
record, absent from **every** field of the mirror.

That is worse than either single-sided failure. Content in the wrong field is
findable by the wrong query; content duplicated across fields is merely
double-weighted. Content in no field is unreachable by any query, and the user's
evidence for the bug is the strongest evidence a search engine can be given:
*I am looking at the word on my screen and search says the note does not exist.*

The rule is not "use one pass". It is that extractor and stripper **resolve one
named predicate** rather than two clauses that happen to agree on the easy
cases. Where the two must genuinely differ — the extractor is stricter on
purpose — the difference is named as a third destination, and the content goes
there: still indexed, just not as the construct.

## Why the tests do not catch it

This defect survives an ordinary test suite because every test is written from
one field's point of view, and each field is individually correct:

- *Is `#alpha` in a code block excluded from the tag set?* Yes. The extractor
  is right, and its test passes.
- *Is the tag syntax removed from the indexed body?* Yes. The stripper is
  right, and its test passes.

Neither test asks the only question that would fail: **after projection, is
every token of the record present in at least one field?** That question is a
property of the projection as a whole, and nothing that tests the fields one at
a time can express it. Per
[gate-sees-target](../../../_laws.md#gate-sees-target), the field-level tests
read a proxy — each pass in isolation — and pass exactly in the configuration
where the pair diverges.

The check that does work is a coverage assertion over the projection, and it is
cheap because it needs no oracle: project a record, concatenate every field the
projection produced, and assert that the token set of the original is a subset
of the token set of the union. Deliberate droppings — stop words, the syntax
characters themselves, a genuinely non-indexed field — go in a declared
exemption list with a reason each, per
[count-carries-predicate](../../../_laws.md#count-carries-predicate); an
exemption list is the honest form, and a coverage number with no predicate is
the dishonest one. Run it over the vault's own corner cases and over the
records the humans actually wrote, because the constructs that collide are the
ones a real vault is full of and a fixture never contains.

## What the mirror may store, and what that costs

A projection that stores none of the record — an inverted index with no
document store, fields analyzed and discarded — is the strongest position
available on fidelity's *other* axis. Nothing in the mirror can contradict the
vault, because the mirror holds no content to contradict it with; a result set
is a list of addresses, and rendering re-reads the file. The vault stays the
only place the text lives, which is the whole premise of the subject.

It has a real cost and one non-obvious consequence:

- **The cost** is that anything which must show the content — a snippet, a
  highlighted fragment, a preview — re-reads the source file per result, so a
  page of results is a page of file reads, and the read happens after the query
  has already committed to that result set.
- **The consequence** is that the projection becomes *unverifiable by
  inspection*. When the mirror stores the projected text, a human debugging
  "why can't I find this" can dump the indexed document and see the hole
  immediately. When it stores only terms, there is nothing to read back, and the
  only way to see the projection is to run it — which is precisely why the
  coverage assertion above has to exist as a test rather than as a debugging
  habit.

Either choice is defensible; the undeclared one is not. Say which the mirror
made, because it decides whether "search does not find it" is diagnosable in a
minute or in an afternoon.

## Decision rules

- **One named predicate per construct**, resolved by both the extractor and the
  stripper. Two clauses that agree today are the defect in its incubating form.
- **A construct the extractor declines still needs a destination.** Declining to
  treat it as a tag is not a decision to make it unsearchable.
- **Assert coverage over the union of projected fields**, not correctness of
  each field. The field-level tests are the ones that pass while the note
  vanishes.
- **Declare the exemptions with reasons.** A token deliberately dropped is
  fine; a coverage number that does not say what it excused is not.
- **Say whether the mirror stores content or only terms**, because that choice
  decides whether the projection can be inspected after the fact or only
  re-executed.
- **A "not found" complaint on a record the human can see is a projection bug
  until proven otherwise** — check the projection before the query parser, the
  analyzer, or the freshness path, all of which are likelier to be blamed and
  rarer to be wrong.
