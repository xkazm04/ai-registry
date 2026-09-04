---
layer: technique
type: technique
subject: prompt-assembly
technique: consumer-coupled-decoration
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [auditing what a returned payload spends per item rather than per call, a peer tool changed how it addresses or matches content, a per-item prefix or wrapper looks too small to be worth measuring, deciding whether to compress a payload or remove something from it, a formatting choice was added for a consumer nobody can currently name]
---

# Consumer-coupled decoration

[context-budgeting](./context-budgeting.md) decides how much a section may
spend. [context-reachability](./context-reachability.md) decides whether the
material in it earns a place at all. Neither asks what the **markup on** that
material is for.

A decoration is neither a section nor an item. It is the per-item prefix,
wrapper, marker or separator a producer attaches to *every* element of a
payload — a position marker on each line, a header on each record, a delimiter
around each field, a repeated label on each row. It is argued for at the unit
of one item, where it is visibly trivial, and it is billed at items times
payloads times sessions. That gap — between the unit the admission argument was
made in and the unit the bill arrives in — is what this technique is about.

## The multiplier nobody computed at admission

`context-budgeting` separates the ceiling from the recurring bill and
denominates the repayment of a shrink in **inclusions**. A decoration carries a
second factor: its own width, times the item count of the payload, times the
payloads a session reads. A marker worth a handful of characters on one line
can therefore outrank a standing layer that three people reviewed, and nothing
in the assembler will ever say so.

Two properties keep it out of view. **The cap never fires** — the decoration
rides inside a payload that already fits, so it never walks a degradation
ladder, never appears in a fitting argument, and never reaches the place where
spending is discussed. And **it is not material**, so no feeder classifies it:
reachability runs on what a payload *contains*, and a decoration contains
nothing. It is the one line item in the prompt that is both large and
unowned by any of the disciplines above it.

## The consumer is the entire justification

Every decoration was attached for something that reads it. The audit is that
sentence turned into a form and run once per decoration on a payload:

1. **Name the current consumer** — not the one it was built for, the one that
   reads the field today.
2. **Name what that consumer does with it** — parses it, addresses by it,
   branches on it, renders it.
3. **Name what fails without it** — a concrete failure in a named consumer,
   not a discomfort.

**A decoration whose consumer cannot be named is residue**, and it is charging
the multiplier above for the privilege. The form is cheap precisely because it
is not an experiment: two of its three answers are found by reading the code
that consumes the payload.

Which is possible because **the consumer is frequently not the model**. A
producer decorates for whoever consumes its output, and that is often a peer
operation — an editor, a parser, a downstream renderer — with the model merely
carrying the bytes past on the way. This is the seam that separates this
technique from
[substrate-coupled-expiry](../../agent-instruction-files/techniques/substrate-coupled-expiry.md),
which owns the same *shape* of rot on the other side of the subject boundary:
there the reader is the model, so the only honest instrument is to withhold the
line and watch the current model's behaviour. Here the reader is a program. It
can be read, and a trial is not needed to establish that nothing consumes a
field.

## The expiry is silent by construction

Nothing signals when a decoration goes inert. There is no error, no failing
test, no exit code, no drift in any count. The producer keeps producing the
field and the field keeps being **correct** — only its *use* stopped. A broken
decoration announces itself; an unread one cannot, because being unread is
indistinguishable from being read successfully.

The mechanism behind that is a peer changing method independently. A consumer
that once addressed content by position begins matching surrounding content
instead; a consumer that parsed a header begins receiving the same fact
structurally. Nothing in the repository changes, the producer does not change,
and the model does not change. The accommodation built for the old method stays
attached and stays priced.

The admission test is the casualty. It observed the consumer as it then was and
returned a verdict about the consumer as it now is — a check reading a proxy
that passes exactly when the proxy has diverged from the target, which is the
moment it existed for
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Nobody re-ran it,
because nothing asked anyone to.

So this needs a **scheduled question rather than a signal**, and the schedule
has one trigger worth stating: *whenever a consumer of a payload changes how it
addresses or matches content, re-open every decoration produced for it.* That
trigger only fires if the decoration recorded which consumer it was for, at the
site where it is attached — the same discipline `context-reachability` asks of
feeders, applied one level down. A producer that cannot say who reads a field
it emits has not decided what the field is for.

## Sort candidate removals by purity, and run the pure ones first

Not every removal costs the same to evaluate, and the cheap ones are
identifiable in advance. A removal is **pure** when it introduces no new
instruction, leaves no information the consumer must recover by another route,
and creates no additional decision for anyone. Dropping an unread field is
pure. Shortening the content around it is not.

The distinction is operational, not aesthetic, because it decides how much
apparatus the change needs before it can be evaluated:

- A **lossy** transform needs a recovery path and a policy governing it, and it
  needs the path instrumented before it ships, because how often the consumer
  goes back is the only outside measurement of how much the transform took that
  mattered ([recovery-path-as-loss-signal](./recovery-path-as-loss-signal.md)).
  That technique's readings are two-sided and its zero is ambiguous.
- A **pure** removal has no recovery path because nothing was lost, so that
  instrument does not read low — it does not apply at all. There is no way back
  to instrument and no aggressiveness dial to resolve. What remains is a single
  question, answerable directly: did the task outcome move? An A/B on the
  complete unit of work settles it, and there is nothing to design first.

The ordering follows, and it is this technique's practical demand: **audit the
decorations before designing a compressor for the same payload.** A compression
scheme is a policy, a recovery path, a class list and an evaluation cycle; a
decoration audit is a form. Running them in the wrong order means paying the
expensive apparatus to shrink bytes that could have been removed outright — and
worse, tuning that apparatus against a baseline still carrying the residue.

This ordering is sharpest exactly where compression is least available.
[elision-to-a-refetch-pointer](./elision-to-a-refetch-pointer.md) classes
payload material by what produced it, and declares one of those classes — output
returned unchanged because the consumer asked for the bytes in order to reason
over the bytes — **not compressible at any size**. That verdict is about the
content, and it is correct. The decoration attached to every item of that
content is not the content, is not covered by the verdict, and is frequently the
only saving available on the class at all. The two audits are orthogonal: one
asks whether the payload should be smaller, the other asks whether part of what
is being counted is read by anyone.

Remove in a change that touches nothing else. A removal revertible in one
command is a cheap experiment; folded into a feature it is a decision nobody
revisits.

## The bound: the wrong granularity, not a wrong idea

A decoration that fails the audit on one surface is usually still right on
another. Position markers earn their place in a change diff and in a short
excerpt, where they are few, the reader is named, and the marker is what makes
the excerpt addressable at all — the pasteable reference format in
[an agent-addressable surface](../../../runtime-and-io/agent-addressable-ui/techniques/agent-pasteable-reference-format.md)
is the case where a single position marker is the payload's whole point, and
where that technique makes the same argument in the same direction: everything
wrapped around it is a token its consumer pays for.

So the defect is rarely the idea. It is the **granularity** at which the idea
was attached: to every item of every payload of a type, rather than to the one
surface whose consumer uses it. The corrective follows the diagnosis — *move the
decoration to the narrowest surface whose consumer can be named*, and let the
broad payload return the bytes it was asked for. Deleting the concept because
one siting failed the audit trades a fixable overcharge for a real loss.

The counter-signal is worth stating plainly, because the audit is severe enough
to be misapplied: a decoration whose consumer *is* the model, and which the
model demonstrably uses, passes on exactly the same terms as any other. The
question was never whether markup is legitimate. It is whether this markup, on
this surface, at this multiplier, still has a reader.

## What the record is worth, and what it is not

One first-party account of a coding agent, dated 2026-09, n=1, one harness:
removing a per-line position marker from the file content a read operation
returned cut model-inference cost by roughly 5% on offline agentic-coding
benchmarks, with task success inside run-to-run variance and no increase in
edit failures; an online experiment reduced average daily model-inference cost
per user by about 3% with no material regression in the quality and satisfaction
metrics that account tracked. The decoration had been added for a peer editing
operation that once targeted changes by position and had since moved to
matching surrounding content.

The account's own framing of the class is the part worth carrying: it calls this
the ideal shape of change, because there is no new instruction for the model, no
information to recover, and no additional decision to make. That is the purity
argument above, stated by someone who had just measured it.

The numbers are not. They are one system's saving on one payload shape with one
decoration, measured on that harness's own evaluations against that harness's
own baseline, and they carry those predicates wherever they travel
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). The
transferable claim is that a decoration nobody had costed was worth a
single-digit percentage of total inference spend — an order of magnitude for
what an unowned multiplier can hide, never a constant to expect.

## Decision rules

- **When a payload is decorated per item, name the decoration's current
  consumer and what it does with the field.** A decoration with no nameable
  consumer is residue and comes out.
- **Record the consumer where the decoration is attached**, so a consumer's
  change of method has somewhere to land.
- **When a consumer changes how it addresses or matches content, re-open every
  decoration produced for it.** Nothing else will raise the question.
- **Sort candidate removals by purity and run the pure ones first.** Pure
  removals need no recovery path and no policy; evaluate them with an A/B on the
  complete unit of work and nothing else.
- **Audit decorations before commissioning a compressor for the same payload**,
  and especially for payload classes a compressor is not allowed to touch.
- **When a decoration fails the audit, re-site it before deleting the idea.**
  The narrowest surface whose consumer can be named is where it belongs.
- **Quote a decoration's measured saving with its harness, its payload shape and
  its baseline**, or it is a number that will be spent on a claim it does not
  support.
