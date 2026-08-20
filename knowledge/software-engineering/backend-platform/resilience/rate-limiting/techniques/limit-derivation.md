---
layer: technique
type: technique
subject: rate-limiting
technique: limit-derivation
status: forged
laws:
  - derivation-names-recomputation
  - count-carries-predicate
shared_with: []
use_when: [choosing a limit's number, adding a limiter to a new endpoint, pacing calls against a provider's quota]
---

# Limit derivation

Every limiter eventually reduces to a number, and the number is where most of
the thinking is skipped. Algorithm, key and refusal shape all get reviewed; the
budget arrives as a round figure someone found plausible and is never revisited
until it hurts. Derivation is the discipline of *computing* that figure from two
independent measurements — **what one admitted request costs**, which sets the
ceiling, and **what legitimate traffic actually produces**, which sets the floor
— and recording both next to the number so the next person can recompute rather
than re-guess.

The two errors are not symmetric. A limit set too high is invisible until the
bill or the outage; a limit set too low is visible immediately, to the most
engaged user you have, as a failure that looks like your system being broken.
Both are guesses that a half-hour of arithmetic would have replaced.

## The ceiling: price one admitted request

Price the whole causal fan-out of one admission, not the handler. The question
is not "how much processor time" but "what does this cause to be spent, in every
system, including the ones I do not own": an inference or model call that bills
per token, a third-party quota consumed against a shared operator credential, a
per-request-billed store read, a message sent against a metered delivery
allowance, a durable row written. The most expensive endpoints usually get a
limiter on day one, because the cost is obvious. Two families reliably slip
through:

- **Read-only is not free.** The endpoints that look cheapest are the ones
  shipped without a limiter: a cache-only probe that returns nothing when it
  misses, a status or quota meter the client re-fires on every focus and
  visibility change, a metadata head request. Each still spends something
  metered — an upstream call against a shared credential, a read against a store
  that bills per request, an origin trip that no edge cache absorbs because the
  response is deliberately uncacheable. A caller looping distinct arguments
  through such an endpoint is an amplifier with no write in sight. The rule:
  **an endpoint's limiter is decided by what it spends, not by whether it
  writes.**
- **The cheap mode is rarely the cheap path.** A dry-run, mock or preview mode
  that swaps only the expensive tail of a pipeline leaves the entire head intact
  — the same fetches, the same upstream quota, the same durable reads. If the
  free-looking mode is unauthenticated, it is the same wallet drain as the paid
  one at the same rate, and it is the mode an attacker will pick. Price each
  mode's actual path; where they differ, they are different endpoints and take
  different budgets.

Because costs differ by orders of magnitude across operations, the output of
this exercise is not one number but a **table of budgets, one per operation
class, each entry carrying its cost justification in a sentence** — "this call
bulk-processes up to a hundred subjects, so it is limited far harder"; "a human
submits this once, maybe twice after a typo, and each accepted call sends mail
against a metered allowance". An entry whose justification cannot be written is
an entry nobody derived (law: count-carries-predicate — the number travels into
dashboards and incident reviews, and it travels with what it counts and why).

## The floor: measure the cadence you must not break

The ceiling alone produces limits that are safe and wrong. The floor comes from
the traffic you *intend* to serve, and it is derived the same way: from a cadence
you can name and multiply.

The shape of the arithmetic: a client that flushes on a known interval produces
a known number of requests per minute per instance; multiply by a realistic
number of instances behind one key. When the key is a network address, that
multiplier is not one user — it is every seat behind one shared egress point,
which for an office or corporate network is hundreds. A limit derived as "this
kind of endpoint is usually quiet" will refuse the largest, most engaged
integration on its first ordinary day, and the customer experiences a
correctly-configured client failing against a service that says the fault is
theirs. Write the multiplication out: interval, instances per key, resulting
rate, chosen cap, and the headroom factor between them. State the headroom as a
factor, not a vibe — "set at roughly a factor above the observed shape" is a
reviewable claim.

The floor also names the inputs you do not control: the client's flush interval
is *their* configuration and can be lowered. That is precisely why the derived
number must be adjustable without a release.

## Write the derivation where the number lives

A limit is a stored derived value and follows the standing rule (law:
derivation-names-recomputation): **the arithmetic lives beside the number.**
When the cost per request changes, or the client's interval changes, or the
provider re-prices, recomputation should be a substitution into a formula that
is already written down, not an archaeology expedition through commit history.
Two corollaries:

- **Every derived limit is overridable at deploy time**, because its inputs
  belong to other people. An operator facing an unusual fan-in shape needs to
  raise a ceiling today, not in the next release.
- **A number nobody derived is labelled as such.** "Placeholder, not derived"
  is honest and reviewable; a placeholder wearing the confidence of a
  computation is how a wrong number survives three years of review.

## On egress, derive from the remote's unit of account

An egress limiter models a boundary someone else drew, so its number must be
expressed in the unit that authority actually counts. Assuming one request costs
one unit is the default, and it is wrong in both directions:

- **A request can cost many units.** A batched query interface that returns a
  whole object graph is commonly billed by the size of that graph, not by
  request count — a single page can be worth tens of ordinary calls. The cost is
  computable from the query's shape before it is sent (breadth times depth,
  summed over the requested collections), and that computation belongs in a
  comment above the query with the provider's published budget for comparison.
  A local limiter counting requests against such a provider is modelling the
  wrong quantity entirely, and will report headroom while the pool is empty.
- **A request can cost nothing.** Where the protocol offers validator-based
  revalidation, an unchanged resource answers "not modified" and mature
  providers do not bill it. Retaining the validator therefore converts a
  recurring poll into a free check, and a quiet subject can be re-verified
  indefinitely at zero quota. Two consequences for the number: a limiter that
  charges every outbound call over-throttles a fleet that mostly spends nothing,
  and the cheapest way to raise an egress ceiling is often not to raise it but
  to make more of the traffic unbilled.

Both facts are properties of the provider, discovered rather than chosen, and
they change when the provider changes — which makes them data recorded next to
the provider's declared pool (see key-design), not constants compiled into a
pacing loop.

## When not to use

Derivation is for limits that protect something measurable. A limit whose
purpose is friction rather than protection — a soft nudge that shapes honest
behavior and is knowingly evadable — is not derived from cost at all; it is
chosen from the product's plan shape, and the honest justification is "this is
what the free tier grants", not an arithmetic. Say which kind a limit is; a
friction limit dressed in cost arithmetic invites a reviewer to harden it at an
expense its purpose never justified.

## Decision rules

- **Price the fan-out, not the handler.** Enumerate what one admission spends in
  every system, especially ones you do not own. If the list is empty, ask again
  — it rarely is.
- **Read-only is not free.** Any endpoint an anonymous caller can loop with
  varying arguments gets a budget, regardless of whether it writes.
- **Price each mode separately.** A cheap-looking mode that keeps the expensive
  head of the pipeline is a full-cost endpoint with a reassuring name.
- **Derive the floor from a named cadence.** Interval times instances per key,
  written out, with a stated headroom factor. A cap with no floor derivation
  will one day refuse your best integration.
- **One budget per operation class, each with its justification sentence.** A
  single global number across operations that differ by orders of magnitude is
  loose for the cheap ones and cruel to the expensive ones.
- **Keep the arithmetic next to the number, and the number overridable.** The
  inputs are other people's configuration; recomputation must be substitution,
  and adjustment must not require a release.
- **On egress, state the unit.** Requests, points, tokens, or bytes — name what
  the provider counts, and note which of your calls it does not count at all.
