---
layer: golden-path
type: golden-path
subject: error-handling
status: forged
techniques:
  - taxonomy-design
  - reclassification-is-not-repair
  - error-doors
  - user-facing-mapping
  - structured-propagation
  - parse-failure-keeps-identity
  - swallowed-error-prevention
  - crash-capture
  - cancellation-attribution
  - consumer-decides-error-shape
---

# Error taxonomy & handling

Every product has more failure paths than success paths — a request has one way
to succeed and a dozen ways to die — yet most codebases design the success path
and improvise the rest. Failure is not an interruption of the domain; it **is a
domain**: it has a vocabulary (the taxonomy), a routing problem (who must learn
of this failure), a rendering problem (what the user is told), and a
measurement problem (whether any of the above actually happened). Products that
treat it as a domain converge on a small set of structures. Products that do
not converge on a single defect, repeated hundreds of times: the failure that
happened and told no one.

## One taxonomy, many consumers

At least three independent systems need to know *what kind* of failure
occurred:

- **Retry policy** needs to know whether trying again can possibly help — a
  timeout is worth a second attempt; a malformed request never is; a rate
  limit is worth exactly one attempt *after the stated interval*.
- **Automated recovery** needs to know which remediation applies — re-issue,
  re-authenticate, reconfigure, or give up and page a human.
- **User copy** needs to know which explanation and which next action to
  offer — "check your connection" and "your session expired" and "that name
  is taken" are answers to three different situations.

The senior structure is that all three consume **one classification, produced
once**. The alternative — each consumer re-deriving "what kind of failure is
this" from the raw error at its own site — manufactures three classifiers that
drift independently, and the drift shows up as the worst kind of bug: retry
hammering a permanent failure, or a user told to "try again" for an error that
will never succeed. One vocabulary, one authority, every consumer derives
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).

The vocabulary itself is a **closed set of categories**, chosen so that the
consumers' branching questions — retryable? whose fault? what remediation? —
are answerable per category. Designing that set, keeping it closed, and
mirroring it across language and process boundaries is
[taxonomy-design](./techniques/taxonomy-design.md).

## The class that must never fire, and what to do when it does

One member of the taxonomy is different in kind from the rest: the internal
class, whose declared rate is zero and whose entire value is its silence. It is
not the catch-all — the catch-all means *we did not recognize this*, the
internal class means *we recognized it and it is impossible* — and because its
expected rate is zero, it is the one category a suite you already run can
detect for free: every occurrence is a defect report with its own reproduction
attached.

What follows a hit is a fork, and taking the wrong branch is the most common
way a team loses the detector. Either the declaration was wrong and the
condition deserves a real class, or the declaration was right and some caller
produced a value it never should have — in which case assigning a friendlier
code states something false and closes the finding without fixing anything
([_laws: deletion-is-not-repair_](../../../_laws.md#deletion-is-not-repair)).
The separating question is whether a user can reach the condition through a
documented interface with values it accepts. See
[reclassification-is-not-repair](./techniques/reclassification-is-not-repair.md).

## Classify on structure, never on prose

Classification must key on **structured fields** — a status code, an error
code, a typed variant, a machine-readable field in a response body — never on
matching substrings of a human-readable message. Messages are *copy*: they get
reworded by upstream libraries, localized by providers, enriched with dynamic
values, and truncated by transports. A classifier built on message text is a
correct program today and a silent misclassifier after any dependency upgrade —
and it fails in the worst direction, sliding everything into the
catch-all category where retry policy and user copy are at their vaguest.

Prose matching is permissible in exactly one place: as a **last-resort
fallback tier** behind structured classification, for raw strings that arrive
from sources that offer no structure at all — and even then the match belongs
in one registry, not scattered at call sites, so there is one place to fix
when the prose changes.

## The error door: every failure reaches somewhere

The central invariant of the whole domain:

> **Every failure reaches at least one door — telemetry, a log, or the user.
> Never none.**

A door is an exit from the code's private world into somewhere a human can
eventually look. Which door depends on one routing question — *is this the
user's problem right now?*

- **User-facing failures** (their action failed, their data did not save)
  reach the user *and* telemetry. Telling the user without recording it means
  the operator learns about outages from support tickets; recording it
  without telling the user means the user resubmits into the same failure.
- **Background failures** (a poll failed, a cache refresh died, a
  best-effort enrichment fell over) reach telemetry and a log, silently. The
  user is not interrupted for problems that are not theirs — but *silent to
  the user* must never decay into *silent to everyone*.

The routing decision, the door primitives, and the discipline that makes an
empty catch block a reviewable event are
[error-doors](./techniques/error-doors.md). What the user-facing door actually
*says* — the registry mapping raw failures to honest human copy with a next
action — is [user-facing-mapping](./techniques/user-facing-mapping.md). How a
failure *renders* on a surface (distinct from empty, retry that retries,
staleness admitted) is the surface side of this subject and lives with the
async-surface doctrine in
[failure-states](../../../ui-surfaces/feedback-and-style/async-ui-states/techniques/failure-states.md) — this
subject decides what the failure *is* and who learns of it; that one decides
what the pixels do.

## The dominant defect is silence, not noise

Ask engineers to name an error-handling failure mode and they describe the
loud ones — the unhandled crash, the cryptic message. The measured reality in
long-lived codebases is the opposite: **the dominant defect is the swallowed
catch** — a handler that catches, does nothing that reaches any door, and
continues. It outnumbers every other class combined, because it is the
path of least resistance at every site where a failure is "not important
right now", and because nothing pushes back: a swallowed failure produces no
symptom at the site that swallowed it, only downstream, later, disguised as
something else — a count that is short, a surface that is stale, an
automation that "just didn't run".

Two structural facts make this defect durable:

- **Handled is not routed.** A catch block that logs to a debugging console,
  or sets a local flag, or returns a default, *feels* handled at review time.
  The test is not "does the code respond" but "does a human ever learn" —
  and most responses fail that test.
- **The gates that exist do not see it.** Automated enforcement tends to
  detect the *syntactic* shell (an empty catch block) and is blind to the
  semantic condition (a catch body that reaches no door). The gap between
  what the gate sees and what the standard demands is exactly where the
  defect accumulates
  ([gate-sees-target](../../../_laws.md#gate-sees-target)).

Making the sanctioned path cheaper than the swallow, and measuring actual
door coverage instead of trusting a green lint run, is
[swallowed-error-prevention](./techniques/swallowed-error-prevention.md).

## Not every non-success is a failure

The taxonomy above sorts failures. Work that stops before it finishes is
neither a success nor, usually, a failure — and a vocabulary with two slots
forces it into one of them, which is how an error stream fills with events
nobody can act on and how a genuinely broken release hides among them.

The correction is not a "cancelled" category routed nowhere. **Cancellation
is an outcome with a cause, and the cause answers every question the taxonomy
asks**: a requester who navigated away is nobody to retry for and nobody to
tell; work superseded by newer input has already been retried by definition;
a local deadline is a real failure the user is owed an answer about; a process
draining for a restart is a real failure attributable to the deployment rather
than to the code. One observable, four answers.

What makes this durable rather than merely overlooked is that the platform's
cancellation signal is **causeless by construction** — a shared sentinel
propagated from whichever holder decided to stop, carrying no record of which
one that was, because a composable cancellation cannot know. So the cause is
recorded where the stop is *called for*, never recovered where it is caught,
and an unattributed cancellation is unknown rather than benign
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)). The
attribution rules, the innermost-first reading of nested cancels, the counters
that carry benign causes without polluting the error door, and the monitoring
that keeps a route-nowhere category from hiding a real failure, are
[cancellation-attribution](./techniques/cancellation-attribution.md). The
two-way discrimination at a streaming hop, where abandonment is the dominant
exit, stays with
[abort-versus-unreachable](../stream-proxy-hop/techniques/abort-versus-unreachable.md).

## Propagation: context grows, class survives

Failures are born deep — in a driver, a socket, a parser — and are decided
high — at a request boundary, a command handler, a surface. Between birth and
decision, a failure crosses layers, and each crossing must obey two rules:

- **Enrich without loss.** Each layer adds what only it knows — which
  operation, which entity, which attempt — while preserving the original
  cause and its classification. Wrapping that discards the cause converts a
  diagnosable failure into "something failed somewhere below".
- **Class survives every boundary.** When a failure crosses a
  representation boundary — thrown exception to returned value, native error
  to serialized payload, one language to another — the *category* must cross
  intact. The cheapest and most common propagation bug is stringification at
  a boundary: the structured error flattened into its message, so the far
  side is left classifying prose it was explicitly forbidden to classify.

The typed-error shapes, the boundary conversions, and the enrichment
discipline are [structured-propagation](./techniques/structured-propagation.md).

## And a second axis: who consumes it, not where it was raised

Everything above is vertical — one tree, one release, layers a single set of
authors can change together. Cutting across it is an **ownership** question
that decides the failure's representation before any of the vertical rules get
a vote: is the code that will branch on this failure shipped on your schedule,
or on somebody else's? Across a boundary whose two sides release
independently, the category is part of the published interface and must be a
value the far side can branch on — a unit that hands out an opaque failure has
forced every consumer into prose matching, which is the one thing this subject
forbids outright. Inside a unit that terminates in a door, the opposite is
true: nothing branches, and one aggregate carrying the accumulated context
trail is cheaper and more informative than an enumeration nobody consumes.
Most systems are both, and the line between the two regions is where the
conversion belongs.
[consumer-decides-error-shape](./techniques/consumer-decides-error-shape.md)
owns the two shapes, the direction the conversion may run, and the
compatibility obligations a published enumeration takes on.
## Some failures never rise, and those need an address

Propagation assumes the failure is going somewhere — up, to a layer that
decides. One class does not: a failure that belongs to *one item of a
collection somebody else writes*. A reader over such a collection meets a
malformed item eventually, and the three reflexes all cost more than they
look: failing the batch lets one writer's mistake take away every well-formed
item too, dropping the item spells failure exactly like empty success, and
keeping an anonymous error produces an honest count nobody can act on —
because telling the owner, quarantining the item and fixing the item all
need a name.

The correction is to isolate the failure to the item and **re-read only the
identity fields**, so the failed item still answers "which one?" and still
satisfies the interface every consumer that only needs a key already uses
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)). One
malformed member then costs exactly itself. The procedure, the stability rule
that governs which fields the identity projection may contain, and the
boundary against a reviewed foreign-artifact import are
[parse-failure-keeps-identity](./techniques/parse-failure-keeps-identity.md).

## The outermost door: crash capture

Everything above assumes the failure was caught by code that expected it.
The final tier handles the failures nothing expected — the unhandled
exception, the unhandled rejection, the panic. These need **last-resort
handlers at the true edge of each execution context**, and their job differs
from ordinary doors: capture maximum context (what happened, and the trail of
recent events that led there), **sanitize before persisting** (a crash report
is the single most likely artifact to accidentally embed secrets, because it
serializes state indiscriminately), persist locally first (the crash may
take the reporter down with it), and ship on next start. Crash capture is
[crash-capture](./techniques/crash-capture.md).

## Measuring the domain

Because the dominant defect is invisible by construction, the health of this
domain cannot be assessed by symptom — it must be *counted*, with the
predicate stated ([count-carries-predicate](../../../_laws.md#count-carries-predicate)):
how many catch sites exist, how many reach a door, what fraction of failures
produce a telemetry event. A codebase that has never run this count should
assume the worst; every codebase that has run it for the first time found the
swallowed-catch population larger than anyone predicted.

## The techniques

- [taxonomy-design](./techniques/taxonomy-design.md) — the closed category
  set, the retryability and fault axes, retry-interval extraction, and
  mirroring one authority across language boundaries.
- [error-doors](./techniques/error-doors.md) — the routing decision
  (user-facing vs background), the door primitives, deduplication across
  layers, and why an empty catch is a reviewable event.
- [user-facing-mapping](./techniques/user-facing-mapping.md) — the registry
  from raw failure to honest message plus suggested action, the fallback
  chain, and translation.
- [structured-propagation](./techniques/structured-propagation.md) — typed
  errors across layers, cause preservation, enrichment, and surviving
  representation boundaries.
- [parse-failure-keeps-identity](./techniques/parse-failure-keeps-identity.md)
  — isolating a decode failure to one item of an externally owned collection,
  the identity projection and the stability rule that governs it, and the
  boundary against both propagation and reviewed import.
- [swallowed-error-prevention](./techniques/swallowed-error-prevention.md) —
  why enforcement misses catch bodies, measuring door coverage, and making
  the routed path the cheap path.
- [cancellation-attribution](./techniques/cancellation-attribution.md) —
  the four causes behind one observable, attribution at the canceller,
  surviving the boundary as a value rather than a name, and the counters
  that keep benign cancels out of the error door.
- [crash-capture](./techniques/crash-capture.md) — last-resort handlers,
  breadcrumbs, sanitization before persistence, and crash-loop protection.
- [consumer-decides-error-shape](./techniques/consumer-decides-error-shape.md)
  — the ownership axis: a closed enumeration where two sides ship
  independently, an opaque aggregate where the consumer is a door in the same
  release, and why the conversion only runs one way.
