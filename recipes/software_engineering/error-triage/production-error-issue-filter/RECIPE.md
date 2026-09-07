---
name: production-error-issue-filter
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/error-triage
---

# Production error issue filter

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Root cause analysis costs real time per issue, so a filter that forwards
everything makes the analysis step worthless and a filter tuned only on occurrence count
forwards the wrong things: it measures how much traffic an error saw rather than how
much harm it did, and it sends six copies of one outage because six services each
reported their own timeout.

**Input.** The window's issues from the error monitor for the scoped projects and
environment, each with its state, its occurrence count, the users or sessions it
reached, the release it last fired in, and the record of which signatures this team has
already judged to be nothing.

**Core action.** Decide which issues are worth an expensive investigation, collapsing
the ones that are a single failure seen from several places, dropping the ones whose
premise the code has already overtaken, and qualifying on consequence rather than on
count, without forming any opinion about what caused them.

**Output.** A short qualified set sized to what the downstream step can actually absorb,
each entry naming why it qualified, alongside a recorded verdict for the window even
when nothing qualified.

## Activities

1. Pull the window's issues for the scoped projects and environment *(observe)*
2. Collapse issues that are one failure seen from several places *(decide)*
3. Qualify on reach, consequence and novelty rather than on count alone *(decide)*
4. Drop signatures this team has repeatedly judged to be nothing *(decide)*
5. Hand on the budgeted set, or record the window as clear *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Everything reaching the analysis step is worth the analysis, and everything worth it
gets there.**

- Each forwarded issue carries the reason it qualified: how many people it reached, that
  it is new or has returned, or that it sits on a path the adopter named as
  consequential.
- A cluster of issues that are one underlying failure is forwarded once, naming the one
  that failed first and listing the rest as its downstream symptoms.
- An issue whose last occurrence predates a release that has since shipped is not
  forwarded, and the reason it was declined is recorded rather than left silent.
- The forwarded set never exceeds what the downstream step was told it can absorb, and
  an over-full window says which qualified issues it held back.

**Whether the filter is set too tight or too loose is answerable from its own record
rather than from an argument.**

- The share of forwarded issues that turned out to be worth investigating is carried
  forward run to run, and a share far below a third is treated as evidence the filter is
  too loose.
- A window where nothing qualified is recorded as scanned and clear, with the scope and
  window it covered, so the same window is not paid for twice.
- The first run states that it is establishing the suppression record and forwards on
  present evidence alone, rather than implying it learned anything from history it does
  not have.

## Guidance

This is a gate in front of something expensive, so its job is to be wrong in a stated
direction rather than to be permissive. Count is the weakest signal it has: a hundred
failures in one retry loop is one person, and three failures at checkout may be every
customer who tried. Never editorialise about cause, but do notice when several issues
moved together, because forwarding all of them buys the same answer several times. Say
what was declined and why.

## Where this is worth adopting

- A team that turned on automated root cause analysis and quietly turned it off again,
  because it ran against everything unresolved and produced more reading than the errors
  did.
- An outage where a connection pool filled and every service that called through it
  reported its own timeout, so the honest count of problems is one and the queue says
  six.
- A product with a small number of high value accounts, where an error touching four of
  them is the most important thing in the window and will never clear a count floor set
  for consumer traffic.
- A monitoring account shared across several products, where the person responsible for
  one of them needs the queue scoped before it is filtered, not after.
- The week after a fix ships, when the backlog is still full of issues that stopped
  happening and each one still costs a full investigation to discover that.

## Connector types

`monitoring`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[sentry](examples/sentry.md) for `monitoring`.

## Recommended trigger

`self_paced`. Nothing outside obliges the filter to run at a given hour, and running it
on an empty window spends the same effort as running it on a full one. It should run
when enough unread issues have accumulated to make the pass worthwhile, or when a
release has just shipped and the shape of the queue is about to change.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which projects and which environment this filter covers, because a monitor account
  almost always spans more than the system in question and a staging exception in the
  queue costs the same investigation as a real one.
- Which code paths the adopter considers consequential, since that is the only way an
  error with a small count can outrank one with a large one and it cannot be derived
  from the monitor.
- How many investigations the downstream step can absorb in the time between runs, which
  is the real budget and is what turns a ranked list into a cut.
- What this team has already dismissed, so the filter starts from their history rather
  than spending its first month rediscovering it.

## Dependencies

None.
