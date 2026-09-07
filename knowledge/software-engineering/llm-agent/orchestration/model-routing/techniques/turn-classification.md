---
layer: technique
type: technique
subject: model-routing
technique: turn-classification
status: forged
laws:
  - one-authority-per-vocabulary
shared_with: []
use_when: [designing a closed vocabulary of call classes, a new class shows up unlabeled on one chart, effort half of a routed pair going missing, one class both plans a deliverable and writes it, the caller is a person at an interactive prompt and no call site can assert a class, a routing decision flapping between tiers inside one turn]
---

# Turn classification

The routing decision is only as good as the question it is asked. "Which model
should serve this call?" is unanswerable in general; "which model serves a
background aside?" is a table lookup. Turn classification is the technique that
converts the first question into the second: a **closed vocabulary of call
classes**, asserted by the caller, mapped to a tier and effort setting in exactly
one place.

## The vocabulary is closed, small, and semantic

The class names what the call *is in the product*, never what it wants from the
roster. The recurring axes:

- **Who waits.** A human synchronously watching; a human who will glance later; a
  pipeline that only cares about aggregate throughput.
- **Blast radius of a bad answer.** The product's main output; a decoration that
  can be quietly wrong; a label whose individual errors wash out at volume.
- **Expected output shape.** Long-form open-ended; a sentence; a token or two
  under a hard cap.
- **Which part of the deliverable the call produces.** Whether the call is
  *deciding* what the artifact should be — the plan, the structure, the
  audience read, the brief another call will execute — or *rendering* the
  surface a person will actually receive.

The first three axes describe how the call is *consumed*. The fourth describes
what it *produces*, and it is the one that gets left out, because a single
capable model doing both stages hides the seam: one call takes a request and
returns a finished artifact, so there is nothing to classify. The seam appears
the moment the plan is written down. A judgment call that emits a brief and a
rendering call that consumes it are two classes, and they want opposite ends of
the roster — the judgment call rewards capability and is short, cheap and rare;
the rendering call is long, frequent, and rewards whatever produces the register
the audience wants, which measurement does not reliably place at the top tier
(see [effort-calibration](./effort-calibration.md)). Collapsing them routes the
expensive stage on the cheap stage's requirements or the reverse, and the table
cannot express the difference because the vocabulary never named it.

Two cautions before splitting on this axis. It is only real when the intermediate
artifact is **explicit** — a brief that exists as text and could be handed to a
different executor; a split asserted over one model's internal phases is a class
with no call site. And it is a *product* distinction, not a prompt-engineering
one: if the same call site sometimes plans and sometimes renders, that is one
class behaving inconsistently, not two classes.

Three to five classes cover almost every system: the *interactive main turn*, the
*background aside*, the *headless micro-call*, sometimes a *batch analysis* class
between the last two. Resist growth. A class per feature recreates per-call-site
model choice with extra steps — twelve classes with one consumer each is the
naive design wearing a uniform. A new class is justified only when calls genuinely
need a different tier-and-effort contract *and* more than one call site will
assert it.

The vocabulary has one authoritative definition, and mapping, policy, audit, and
dashboards all consume that definition (law: one-authority-per-vocabulary). The
moment the audit view hand-maintains its own list of classes, the next class
added shows up as an unlabeled bar on a chart — the copies drift precisely when
someone extends the vocabulary and finds only one of them.

## The caller asserts the class

Only the call site knows its role. The router cannot infer "a human is waiting"
from prompt text — inference from content is fragile (the same prompt string can
be a main turn or a regression fixture), unauditable (the record would say "the
router guessed"), and inverts the dependency: the router now needs product
knowledge that belongs to features. So the contract is:

- **The caller states the class** as part of the call, the way it states the
  prompt. It is a required argument, not an optional hint.
- **The router owns the mapping** from class to tier and effort, and nothing
  else about the choice. Callers say what they are; the table says what they get.
- **An unclassified call fails loudly.** Any silent default is wrong in one
  direction or the other: defaulting cheap quietly degrades the call someone
  forgot to label; defaulting expensive converts every future omission into
  invisible spend. The absence of a class is a bug at the call site, and the
  system should say so at the call site.

## The mapping is one table, and it is data

Class → (tier, effort) lives in a single structure, readable in one screen,
answering "what serves our interactive turns today?" without a search. Each
entry carries its provenance: the measurement that set it and when (see
effort-calibration — the table is the *output* of calibration, and an entry
without a cited measurement is an opinion in a table costume). Changing an entry
is a routing-policy change and goes through the same review as any other (see
policy-governance): the table is small, but it is the highest-leverage spend
knob in the system.

## The pair travels whole

The mapping's output is a **tier-and-effort pair, and it moves as one value** —
one structure, taken together or not at all. The two axes have asymmetric
visibility: the tier has a visible consequence in the output, the effort does
not, so when call sites are allowed to take half the pair, it is always the
effort half that gets dropped — and nobody notices, because a dropped effort
does not land on a neutral middle. It lands on the serving side's default,
which sits *above* the calibrated level on exactly the calls the calibration
existed to make cheaper. If a function downstream of the mapping has a slot for
the tier and none for the effort, that missing parameter is the bug; add it
before adding the caller.

## Decision rules

- **Class names survive roster changes; tier assignments do not.** When a new
  model generation lands, the table is re-pointed and re-measured; no call site
  changes. If a roster change forces call-site edits, model knowledge leaked
  into the callers — hunt it down.
- **One call, one class.** A call site that picks between classes at runtime is
  usually two call sites sharing code; split them. Conditional classification is
  where "the caller knows its role" quietly stops being true.
- **The class travels into the record.** Every downstream artifact — the audit
  record, the usage timeseries, the spend rollup that cost-metering prices —
  keys on the class. A decision record without the asserted class cannot answer
  the only interesting retrospective question: was this class of call worth
  what it was routed to?
- **Test and evaluation traffic gets its own class**, not a borrowed one.
  Letting fixtures assert the interactive class poisons both the calibration
  data and the spend attribution for the class that matters most.

## When there is no call site to ask

Everything above rests on a premise worth stating plainly, because a whole class
of system violates it: **that the caller is code**. A call site inside a product
knows whether a human is waiting, knows the blast radius of its own output, and
can be made to pass a required argument. An interactive client whose caller is
*the person typing* has none of that. There is one call site, it serves every
class of work the user happens to want, and the only party who knows the class is
the one party the contract cannot oblige — a user will not annotate their turns,
and a required-argument rule pointed at a human is a prompt for a label they did
not come to write.

The rule above does not bend for this case; the case is outside it. "An
unclassified call fails loudly" presumes a bug at a call site, and here there is
no call site and no bug — the absence of an asserted class is the normal
condition. A system in this position either routes everything to one tier, which
is the cost problem this subject exists to solve, or infers the class from
content, which this technique rejects for reasons that remain good ones:
inference from prompt text is fragile, the record says the router guessed, and
the same string can be two classes.

What changes is what makes the inference *acceptable*, and it is not accuracy. A
classifier that is right most of the time is still wrong on some turn the user
cared about, and no reachable accuracy removes that. What removes it is
**designing the error to be asymmetric, and publishing which way it points**:

- **The uncertain turn goes to the expensive tier.** The classifier's job is not
  to identify cheap turns; it is to identify turns it is *confident* are cheap
  and to abstain everywhere else. The failure mode is then a turn that could have
  been cheap and was not — a missed saving, invisible in the output and
  recoverable on the next turn — rather than a degraded answer on work that
  mattered. Document that direction where the feature is enabled: an operator
  switching it on is deciding about the failure, not about the accuracy, and the
  honest sentence ("you may lose savings, you will not lose quality") is what
  makes the decision informed.
- **The decision is taken once per turn and pinned for that turn's whole
  execution**, including every underlying call it fans out into. This is where
  "one call, one class" needs restating for an interactive client: the unit the
  user experiences is the turn, and a class re-derived per underlying call flaps
  mid-turn — one piece of work answered partly by each tier, which is neither the
  cheap outcome nor the good one.
- **A misroute is repaired, not merely regretted.** A turn routed cheap whose
  call then fails may retry once on the expensive tier. Scope the retry to
  failures a different tier could plausibly fix; a refusal, an authorization
  failure, a malformed request or a user abort is not one, and retrying those
  buys a second bill and the same answer.
- **The inference is the router's, so the record says so.** The decision record
  carries the class *and* the fact that it was inferred rather than asserted.
  Without that flag the retrospective question this technique cares about — was
  this class worth what it was routed to — cannot be separated from the prior
  one, which only exists here: was the class right at all.

Two constraints ride along, and both are ordinary consequences of the tier
mapping rather than new rules. An inferred tier is still subject to whatever
roster policy governs the caller, so a tier the operator has disallowed is not
reachable by inference either — the router coerces to the permitted one, and if
none is permitted it stops inferring for the session rather than quietly
selecting. And where the client also exposes a programmatic surface, that surface
has real call sites: they assert their class in the ordinary way, and only the
human-facing turn falls back to inference. A system that infers on both has given
up a contract it was owed.
