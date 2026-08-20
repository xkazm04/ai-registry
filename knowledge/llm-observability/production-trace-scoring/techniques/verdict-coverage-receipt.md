---
layer: technique
type: technique
subject: production-trace-scoring
technique: verdict-coverage-receipt
status: forged
laws: [estimation-announces-itself, server-owns-the-accounting-clock, the-judge-is-both-untrusted-and-under-test]
shared_with: []
use_when: [storing whole-trace verdicts that must stay honest as traces move, detecting that a judged trace changed after judging, designing verdict provenance for late-arriving spans]
---

# Verdict coverage receipt

A whole-trace verdict is a claim about a moving target. The trace stays
open to late spans forever — a streamed output that fills in after the
settle window, a parent span that lands last, a retry leg appended minutes
later — while the verdict, written once, stays put. Without countermeasures
the verdict *silently stops describing the trace*: a reader sees "8.5/10,
pass" next to content the judge never read, and nothing in the system can
tell them. The receipt is the countermeasure: **every whole-trace verdict
records exactly what it judged**, so any later read can compare the receipt
against the trace as it now stands and disclose the difference.

## What the receipt records

Three fields, each answering a distinct question a future reader will ask:

- **The trace's size when judged** — its true span count at verdict time,
  answering "how much of what I'm looking at existed then". Record the
  *true* total even when the read that fed the judge was clipped by a
  display cap; a receipt that records the clipped count manufactures
  phantom drift the moment anyone compares.
- **The identity of the judged exchange** — which span's input/output the
  judge was actually handed. A whole-trace judge does not read every span;
  it reads the trace's entry-point exchange (the whole-request in and out).
  Naming it distinguishes a whole-trace verdict from a per-call verdict
  that happens to share a rubric.
- **A fingerprint of the judged text** — a content digest over the judged
  exchange (its identity plus input plus output), which changes if and only
  if the text the judge saw changes.

Two disciplines govern the fingerprint. **Scope it to what the judge read,
not the whole trace** — digest every span and any late-arriving child
span "changes" the trace, flagging verdicts whose judged text is untouched;
digest the judged exchange only, and the receipt changes exactly when a
re-judge would see different input. And **use a hash that is stable across
processes and releases** — a digest that changes with a toolchain upgrade
marks every stored verdict as changed at once, and the re-scoring machinery
downstream will faithfully re-buy the entire judged population. Boring,
specified, dependency-free hashes only.

Also record, as provenance rather than drift signal, whether the read that
fed the judge was truncated by any span cap. A clipped read is a fact about
verdict quality; it is *not* evidence the trace moved, and conflating the
two triggers spend for a storage policy.

## The server stamps it; the read compares it

The receipt is stamped **by the receiving API at verdict-write time**, not
composed by the scoring client. The client's view is exactly what is
untrustworthy here — it read the trace some seconds ago through a possibly
clipped page; the server holds the trace as it stands at the write. Per
[server-owns-the-accounting-clock](../../_laws.md#server-owns-the-accounting-clock),
any field that will later drive accounting decisions (and this one drives
re-judging spend) is authored by the server from its own state, never
accepted from a client who could be stale or lying.

Comparison happens **on read**: when a trace is served with its verdicts,
the store recomputes current size and fingerprint, compares against each
verdict's receipt, and attaches the drift classification to the verdict in
the response. The verdict row itself is never rewritten — per
[estimation-announces-itself](../../_laws.md#estimation-announces-itself)
the disclosure travels with the payload, computed fresh, so it can never
itself go stale. Staleness is a property of the *pair* (verdict, current
trace), and only the read moment knows both.

## Degradation rules

- **A verdict with no receipt discloses nothing and triggers nothing.**
  Verdicts written before receipts existed, or posted by third-party
  tooling, cannot be compared. The honest treatment: report no staleness,
  and never spend on a guess — a missing receipt is absence, not evidence
  of change.
- **A receipt with size but no fingerprint compares on size only.** It can
  say "grown", never "changed" — the system must never claim a content
  change it cannot see.
- **The receipt is bounded.** Verdict rows are hot — listed, joined,
  alerted on — so the receipt is a fixed few fields, and the verdict's
  wider provenance (per-dimension reasoning, agreement, notes) lives under
  explicit storage caps with visible truncation. An unbounded provenance
  blob on a hot row is a self-inflicted outage.

The receipt also completes the verdict's provenance duty under
[the-judge-is-both-untrusted-and-under-test](../../_laws.md#the-judge-is-both-untrusted-and-under-test):
a verdict that names its rubric, its judge, and now its exact judged input
is auditable end to end — reproducible in principle, contestable in fact.

What the disclosure *triggers* — which drift classifications justify paying
for a fresh verdict — is deliberately a separate policy:
[drift-classified-rescoring](drift-classified-rescoring.md). The receipt
only ever tells the truth about what was judged; it never decides what to
do about it.

## When not to use it

Per-call verdicts on immutable single events need no receipt — the judged
content cannot change after ingest, so there is nothing to compare. The
receipt earns its storage exactly where the judged aggregate is mutable
after judging: whole-trace scores, session-level scores, any verdict over
a window that can still grow.
