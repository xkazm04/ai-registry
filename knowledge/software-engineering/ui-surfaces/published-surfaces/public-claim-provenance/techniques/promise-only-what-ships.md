---
layer: technique
type: technique
subject: public-claim-provenance
technique: promise-only-what-ships
status: forged
laws: []
shared_with: []
use_when: [writing a confirmation or success panel, copy says a follow-up will arrive, a surface advertises a capability that is planned, deciding what to say after a form is submitted]
---

# Promise only what ships

Numbers are not the only claims on a public surface. Every forward-looking
sentence is one — *we'll be in touch*, *you'll receive a confirmation*, *your
account will be reviewed within a day*, *this integrates with everything you
already use* — and each names a mechanism that either exists in the shipped
product or does not.

The canonical instance is the success panel after a form. It is written when
the form is built, in the same afternoon, by someone whose attention is on
validation and layout. It says something warm about being in touch. Then the
delivery mechanism it presupposes is deferred, descoped, or was never planned,
and the sentence stays — because **nothing in the system fails when a promised
message is not sent**. The recipient's inbox is not instrumented. No test
covers it. No alert fires. The absence is invisible to the team and total to
the reader, who waits, concludes they were ignored, and does not write in to
report the discrepancy.

## Name the mechanism, or delete the sentence

For each forward-looking sentence, point at the thing that fulfils it. Not a
plan for it, not a ticket, not a service you have an account with: the code,
the queue, the person, the schedule. If you cannot point, the sentence is a
promise the product does not ship, and it goes.

A planned mechanism does not count, and this is the rule people argue with. It
feels harsh to strip a promise out of copy that will be true in three weeks.
But from the reader's side a planned pipeline and no pipeline are the same
pipeline, and the surface is not shipping in three weeks — it is shipping now,
to people who will form an expectation now and be disappointed on the current
schedule rather than the intended one. The copy can be added on the day the
mechanism lands, in a change small enough to be trivial.

A mechanism operated **by a human** does count. Someone reading a list every
morning is a real pipeline with a real latency, and a surface may promise
exactly what that human achieves. What it may not do is promise a *tighter*
latency than anything enforces: "within one business day" is a claim about a
service level, and a service level with no owner and no alarm is a sentence,
not a commitment. "We read every one of these" is true, unfalsifiable in the
right way, and costs nothing to keep true.

## Replace the promise with a real surface

Deleting a promise leaves a hole, and a hole in a success panel reads as
indifference. The replacement is not an apology and not a hedge — it is a
**pointer at something that exists**: here is what is available today, here is
where to continue, here is the thing you can go and look at now.

This is a strictly better trade for both sides. The reader leaves with a
surface instead of an expectation, and an expectation is the only thing that
can be disappointed. The team gets a link whose target is testable — a broken
pointer is a build failure, where a broken promise is nothing at all. And the
copy stops depending on a future the product may not have.

Where the surface must acknowledge that something is coming, it can say so
without promising a delivery: naming a direction is not the same as naming an
event that will happen to the reader. The line is whether the sentence creates
an obligation the product must discharge. "We are building this" creates none.
"We'll let you know when it's ready" creates one, and discharging it requires
a mechanism that remembers who they were.

## Annotate the constraint at the copy

The removed promise will come back. Someone will read the panel, find it
abrupt, and warm it up — and warming up a confirmation screen means, almost
without exception, promising a follow-up. So the constraint lives beside the
copy, in the same form as a hand-authored value's label
([no-data-source-labelled-inline](./no-data-source-labelled-inline.md)): *there
is no delivery mechanism in this product, so nothing here may promise a
message; point at surfaces that exist instead.* Stated that way it is a rule
the next author can either follow or deliberately retire by building the
mechanism, rather than a tone decision they are free to overrule.

## Decision rules

- **When the promise depends on a third party you have not integrated, it does
  not ship.** An account with a provider is not a pipeline.
- **When the promise is conditional on volume** ("we usually respond within a
  day"), publish the condition or publish the weaker claim. A qualifier the
  reader cannot evaluate is decoration.
- **When a capability list includes something behind a flag**, it ships only
  if the reader can reach it. A capability nobody outside the team can turn on
  is not a capability, it is a roadmap entry, and roadmap entries have their
  own honest slot on the surface.
- **The negative test: what breaks if this sentence is false?** If nothing in
  the system fails, the promise is unowned and will rot. Either give it
  something that fails — a test, a monitor, a scheduled human — or take the
  sentence out.

## When not to use this

A genuine, instrumented commitment should be stated plainly and specifically.
Vagueness where a real service level exists is its own dishonesty: it hides a
strength, and it trains readers to discount every specific claim the product
makes. The technique is not "say less"; it is "say exactly what ships", and
where a great deal ships, that is a great deal to say.
