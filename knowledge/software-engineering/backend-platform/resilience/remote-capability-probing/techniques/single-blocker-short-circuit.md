---
layer: technique
type: technique
subject: remote-capability-probing
technique: single-blocker-short-circuit
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [every row of a capability report failed for the same reason, deciding whether to keep probing after the login or network check failed, a capability doctor should tell the operator the one command that unblocks it]
---

# Single blocker short-circuit

A capability probe runs a list of rows, each with its own request. Before any
of them can say anything about the peer, a short chain of preconditions on
**the prober's own side** has to hold: the client binary starts, the host
answers on the network, the credential is accepted, the scope the rows live
under can be read. When one of those fails, every row fails for the same
reason, and the naive report prints that reason ten times in ten slightly
different words — or worse, prints ten *unavailable* verdicts, each true about
a request and false about the peer.

The technique is to read those preconditions first, name **the one cause** that
stops every probe, and stop: no row request is sent, every row is *unknown*
with basis *none* and the reason *blocked by: <cause>*, and the report leads
with the blocker and the command that fixes it.

## Procedure

1. **Run the preflight reads together and keep every error.** The identity
   read, the scope read and the server-metadata read are cheap and
   independent; issue them at once and keep each outcome — value or typed
   error — rather than failing on the first.
2. **Pick the blocker in a fixed order of causes.** The order is causal, so
   the first match explains the rest: *the client cannot start* explains a
   network error that was never attempted; *the host is unreachable*
   explains an authentication read that never got an answer; *no valid
   credential* explains a scope that cannot be read. Test them in that
   order against the kept errors, by their typed kind, never by message
   text.
3. **Call a scope a blocker only when the identity read succeeded.** A
   scope that answers forbidden or not-found to a signed-in identity is a
   real cause — a wrong identifier, or a scope this credential cannot see.
   The same response with a failed identity read is explained by the
   credential and must not be named twice.
4. **Anything else is not a blocker.** A server error, a rate limit, one
   route's refusal: these stop one row, not every row, and the rows report
   them as *unknown* on their own. A blocker is a cause that makes the
   whole report meaningless; inflating a partial failure into one hides
   the rows that did answer.
5. **Spend nothing once blocked.** Rows are built as deferred thunks, so a
   blocked run materialises each as *unknown, blocked by …* without issuing
   its request. Probing against a host that is unreachable or a credential
   that is rejected spends the remote's rate budget, and the operator's, to
   learn nothing.
6. **Give the blocker its own shape and exit.** The blocker carries a kind,
   a sentence naming what is wrong and where (*not logged in to <host>*),
   and a fix — a command to run, a variable to set. The process exit code
   distinguishes three outcomes: the probes answered; every row is unknown
   with no single blocker; blocked. An automation that wraps the probe can
   branch on the third without parsing text
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Decision rules

- **A scope blocker may still let unscoped rows run.** When the failed
  precondition is the scope rather than the client, network or credential,
  rows that do not live under the scope — server version, account-wide
  endpoints — can still answer; the scope's own routes report that they
  cannot be judged. Short-circuit only the rows the cause actually blocks.
- **The blocker is not a health verdict.** It is not shown as the peer
  being down, and it is not cached as a capability: it describes the
  prober's setup on this run, and the next run re-reads it.
- **One cause, named once.** If the report would show the same reason on
  more than half its rows, that reason was a precondition and belongs in
  the preflight order.

## When not to use

A probe of one capability has nothing to short-circuit; its single failure is
already the report. The technique earns its place when a report fans out into
many requests that share a chain of client-side preconditions.
