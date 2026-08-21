---
layer: technique
type: technique
subject: engine-integration-safety
technique: judge-by-log-markers-not-exit-code
status: forged
laws: [unmeasured-is-not-a-pass, law-and-check-share-one-source, structural-proof-is-never-sufficient]
shared_with: []
use_when: [judging a headless run of a heavyweight application, a process exits non-zero after succeeding, correlating several results out of one run log]
---

# Judge by log markers, not exit code

The concern: deciding what a driven run actually did, when the process's exit status is not
evidence. Large interactive applications run headless routinely exit non-zero after doing
their work perfectly — a null dereference during teardown of some subsystem is the classic
cause — and just as routinely exit zero having done nothing at all. An exit status carries
one bit, and for this class of callee that bit is about the wrong subject.

The replacement is a marker protocol: the run emits agreed sentinels and a structured
result into a channel you control, and the judge parses that channel.

## Procedure

**1. Define the protocol as three parts.** A start sentinel proving your instruction began;
a structured result payload; an end sentinel proving the run reached its own conclusion.
Emit the end sentinel from both the success and the failure path, so a failure is reported
*and terminated*, not merely inferred from what is missing.

**2. Treat a missing end sentinel as its own outcome.** Started-but-never-finished means
crashed, hung, or killed — a statement about the environment. Finished-with-a-failure means
the work ran and was judged bad — a statement about the artifact. These must not map to
the same verdict, because the first one is not evidence about the artifact at all and must
render as not-measured.

**3. Add a third state for "nothing matched".** A run may finish cleanly, emit its
sentinels, and contain no result marker whatsoever, because the work you named was never
registered or matched nothing. Rendering that as a failure paints a board red with work
nobody has written; rendering it as a pass is a lie. It is *deferred* — an honest planned
wait. The signal that distinguishes it from a truncated run is that the callee enumerated
its available work and reported the enumeration: the run happened, the target was absent.

**4. Make markers unforgeable enough for the channel.** The channel carries the callee's
own output, and content under test can print anything. Use a token unlikely to occur
naturally, anchor the match to the line structure rather than to a bare substring, and
prefer a per-run nonce in the token where the content could plausibly mention the marker
by name. A marker match is structural proof that the token was printed — nothing more —
so make the token hard to print by accident.

**5. Correlate to exactly one identity before crediting a result.** When one run's output
carries several results, a marker may be credited to a request only when the candidate set
resolves to a single identity. Zero candidates: unobserved. More than one: *ambiguous*,
which degrades to deferred — never to a pass and never to a fail. Duplicate spellings of
the same identity are one identity, not a collision. This rule prevents the worst output
this layer can produce: a partial run where one item completed and another crashed, and a
whole-run verdict got smeared across both.

**6. Scope per item and never let a sibling's result carry.** Where a batch shares one log,
attribute each result to its own item's marker; an item with no observation of its own
stays deferred rather than inheriting a neighbour's pass. Prefer a structured per-item
report from the callee when it offers one, and fall back to scoping the shared log only
when the report is missing or unparseable — with the fallback's weaker attribution stated
in the result.

**7. Keep one parser.** The marker vocabulary lives in exactly one dependency-free module
that every consumer imports. Two hand-rolled matchers over the same log will drift, and the
drift is a silent honesty bug: the same run passes in one surface and defers in another.
Where consumers legitimately need different *words* for the same fact, map from one set of
neutral counted facts to each vocabulary, and document the mapping in that module.

**8. Prefer a callee that is honestly exit-code-judged when you have the choice.** An
out-of-process build tool that compiles from source and returns a meaningful status is
better evidence than an in-application command whose only signal is log text — take the
deterministic one even when it is slower, and reserve marker parsing for the runs that have
no alternative. Where you must parse, parse strictly.

## Decision rules

- If the exit status and the markers disagree, the markers win. That is the entire premise.
- If the log is empty, the outcome is *no observation*, not a failure — usually the launch
  itself never happened.
- If a fatal-error marker is present, that outranks a pass marker in the same log: a run
  that passed and then crashed did not cleanly pass.
- If zero markers matched but the callee enumerated its work, defer. If zero matched and it
  enumerated nothing, the run is unusable — report *unknown*.
- If attribution is ambiguous, defer. A false verdict is unbounded in cost downstream
  because it reads as proof; an unresolved one costs one more run.
- If the marker vocabulary changes, it changes in one module and both consumers move
  together. The rule and the check that enforces it share one source.

## When not to use this

**Well-behaved processes with meaningful exit codes** — compilers, linters, ordinary test
runners, most command-line tools — should be judged by their status. Marker parsing there
is weaker evidence and more code.

**Streaming or long-lived processes** with no natural conclusion need a different
observable — a health endpoint, a state query, a sampled metric — because the sentinel
pattern assumes a run that ends. And where the callee can hand back a structured result
directly through an API, take that instead: it sidesteps log parsing entirely, which is
always the better trade when it is available.
