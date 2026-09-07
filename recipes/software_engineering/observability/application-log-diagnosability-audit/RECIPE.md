---
name: application-log-diagnosability-audit
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/observability
---

# Application log diagnosability audit

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** What a system emits accumulates one line at a time, each added by somebody
debugging something that afternoon, and nobody ever asks the reverse question: when the
next incident arrives, which of the things an operator will need to know can this system
actually say. So the volume grows, the bill grows with it, and the answer that matters
is still missing at three in the morning. Every check that reads the emitted signal
passes over such a system exactly as it passes over a healthy one, because a reader can
only report what was emitted.

**Input.** The code that emits this system's signal at each of its boundaries, the
questions the people who operate it actually ask when it misbehaves, whatever fresh
output or test can be captured as evidence of what is really emitted, and the totals an
earlier audit recorded.

**Core action.** Work from the question rather than from the line. For each question an
operator asks, decide which kind of record should answer it, then establish on fresh
evidence whether the system emits something that does, separating a question with no
signal behind it from one whose signal exists and cannot be used.

**Output.** A ranked reading of which operational questions this system can answer and
which it cannot, each finding quoting the passage or the captured event it rests on and
naming where the fix belongs, with the emitted totals recorded so the next audit reports
movement rather than restating the size. No code is changed and no event is added; the
reading is the deliverable.

## Activities

1. Collect the questions this system's operators actually ask when it misbehaves
*(observe)*
2. Enumerate what is really emitted at each boundary, and measure the volume each
carries *(observe)*
3. Decide which kind of record each question belongs to before asking whether the logs
answer it *(decide)*
4. Capture fresh output or a test showing which events and required fields actually
appear *(act)*
5. Judge each question answered, unanswered, or answered by a signal nobody can use
*(decide)*
6. Hand over the ranked reading with its evidence and the recorded totals, having
changed nothing *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**What this system emits is answerable to the questions its operators ask, rather than
to whatever was convenient to add while somebody was debugging.**

- Every finding names the operational question it is about, so an event that answers
  nothing for anybody is visible as volume rather than as coverage
- A request to emit everything is declined as a requirement rather than costed, because
  it has no condition under which it is finished and it buys volume faster than it buys
  answers
- Each question is assigned to the kind of record built to carry it, so a question about
  who changed a protected thing, about how much and how often, or about the exact path
  one request took is not answered from application logs by default
- Accountability, billing, ownership and compliance history are reported as questions
  application logs cannot be the source of truth for, whatever those logs currently
  happen to contain
- An operator who says a question does not matter here, or supplies one the audit never
  asked, has that written into the question set the next audit opens from, because the
  question list is the bar everything else is judged against and it is the input this
  work is most likely to have wrong

**An area is called covered only where a fresh run or test has shown the event and the
fields it needs.**

- Every area marked covered points at the captured output or the test that proved it,
  and an area judged from reading the source alone is marked unproven rather than
  covered
- An area that could not be exercised is recorded as unexercised, with what exercising
  it would take, and is never counted toward what the system can answer
- A correlation identifier is reported as present only where a real context produces
  one, and no identifier is invented to make a required field look populated
- A boundary that emits nothing is distinguishable in the reading from a boundary the
  audit never reached

**A signal that exists and cannot be used is reported as a gap rather than counted as
coverage.**

- An event name or an aggregation label built from exception text, a raw path or a
  caller supplied value is reported as unbounded, since nothing can be counted over it
  and a raw path carries whatever its query string held
- A schema wide enough that most of its fields arrive empty is reported as a cost rather
  than as thoroughness, because empty fields invite whatever is at hand into them
- A path that degrades what the user sees without an error signal and a paired count is
  reported as a silent failure rather than as a handled one
- The instrumentation is judged as code that can itself break the thing it observes, so
  a wrapper placed around a response or a stream is reported against what it may have
  broken in flushing, streaming and the byte counts it reports

**The next reading of this system reports what changed since the last one instead of
restating its size.**

- The emitted totals and the count of questions answered, unanswered and unusably
  answered are recorded where the next audit will read them
- Each finding quotes the passage or the captured event it rests on and names where the
  fix belongs, so it can be acted on without redoing the audit to understand it
- A first reading over a system says it is establishing the totals and reports no
  movement
- Nothing was edited to produce the reading, and a finding is a claim about the system
  rather than a change already made to it

## Guidance

Start from the question, not the line. An event exists because somebody will need to
answer something, and a request to log everything has no done condition. Route each
question to the record built for it: logs explain, metrics aggregate, traces show a
path, audit records are accountable, and application logs are the source of truth for
none of the last three. Coverage read from source is a guess; only a fresh run proves
it. A signal nobody can aggregate is a cost, not coverage.

## Where this is worth adopting

- A team just out of an incident where the answer was in nobody's output, about to
  respond by adding lines everywhere rather than by naming the questions they could not
  answer.
- A service whose telemetry bill has grown faster than its traffic, where the volume is
  certain, the diagnostic value is unknown, and nobody can say which of those lines has
  ever been read by a person.
- A system where every standing check comes back clean and incidents still take hours,
  because a check can only report on signal that was already being emitted and nobody
  has audited the emitting side.
- An on call rotation inheriting a service none of them wrote, who need to know before
  the next page which questions this system can answer and which it cannot.
- A service that has quietly started settling ownership or approval questions from its
  application output, where the record everybody now trusts has no durability guarantee
  behind it.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`self_paced`. Diagnosability decays by accretion and by change of shape, and neither
announces itself. A boundary added this quarter emits nothing and nothing pages anybody
about a question that went unanswered while the incident ended anyway. The reading is
owed when the code has moved enough that the last one was about a different system, and
the party positioned to see that is the one reading the code. Where nobody watches the
shape of the codebase, an adopter's clock is a defensible fallback and the interval is
theirs.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The questions this team actually asks when the system misbehaves, because that list is
  the bar the whole reading is judged against and a list borrowed from elsewhere audits
  somebody else's system
- Which kinds of record this organization actually runs, since a question routed to a
  store nobody has is a finding the adopter cannot act on, and the honest reading names
  the routing before it proposes the store
- How this system's output can be observed from a real run, because an audit with no way
  to capture fresh output can only report unproven and should say that before it starts
  rather than mark areas covered from source
- Which parts of this system carry an obligation the output is being asked to discharge,
  because a question about accountability that must be answered durably turns a finding
  from a missing field into a missing record

## Dependencies

- a way to run the system and capture what it emits, since an area this work cannot
  exercise is recorded as unproven rather than counted as covered
