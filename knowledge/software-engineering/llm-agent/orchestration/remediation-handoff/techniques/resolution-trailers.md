---
layer: technique
type: technique
subject: remediation-handoff
technique: resolution-trailers
status: forged
laws: [identity-survives-reuse, failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when:
  - designing how a remote executor reports completion without a callback
  - deciding what a resolution claim in commit history may and may not prove
---

# Resolution trailers

A resolution trailer is a **key-and-identifier line in a commit message that
names the finding the commit resolves**. It is the cheapest completion
channel that exists between a system and an executor it cannot observe: the
agent writes one line it was already writing a commit message for, and the
signal arrives in the codebase's own durable history, where any later
analysis can read it without infrastructure, credentials, or a callback URL.

The move is only obvious in hindsight. The alternatives all cost more and
deliver less: a status endpoint requires the agent to have network access and
a token; a report file requires the agent to commit an artifact the codebase
does not want; a human confirmation requires a human. The trailer requires a
convention.

## Grammar

Keep the grammar boring, because it is parsed by you and written by a
language model reading a rule in a prompt.

- **A key on its own line, then a colon, then identifiers.** One key, chosen
  once, distinctive enough not to collide with existing conventions in the
  ecosystem.
- **Several identifiers per line**, separated by commas or whitespace,
  because one change legitimately closes several related findings and
  demanding one commit per finding will produce either artificial commits or
  omitted markers.
- **Several trailer lines per message**, accumulated, for the same reason.
- **Case-insensitive on the key, exact on the identifier.** Agents vary the
  capitalization of a key; they do not vary an opaque identifier they were
  told to copy. Being lenient where variance is expected and strict where it
  is not is the whole art of parsing a convention.
- **Anchored at line start, tolerant of leading whitespace**, so a mention of
  the key inside prose does not register as a claim.

The key is a closed vocabulary with exactly one definition, shared by the
artifact builder that instructs the agent and the parser that reads history
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Derive both from that one constant.

## What the identifier must be

The identifier that travels is the **persisted identity of the finding**, not
its position, not its title, not "the third item in the batch". It has to
survive the round trip through a text document, a model's copying, a commit
message, and a later parse — and it has to still mean the same finding when
the ledger has been regenerated several times since
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). Mint it
once when the finding is persisted, and carry it. Ordinals break the moment
the batch is regenerated; titles break the moment the assessor rewords.

## Presence is a signal; absence is not

This is the rule that keeps the mechanism honest. A trailer's presence means
*an executor claims to have resolved this item in this commit*. Its absence
means only *no claim was made in the commits sampled*. It does not mean
unresolved, and a system that reads it that way will hold items open forever
after they were fixed by anyone who did not know the convention — a human, a
different agent, a merge from another branch.

Two consequences follow.

First, **the parse must distinguish "no markers found" from "could not read
the history"** ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
A history read that failed, a sample window that returned nothing, or an
analysis that never reached the history step must not be reported as a clean
"no resolutions claimed" — that is precisely the shape of the lie that makes
an automated closer look broken and a broken closer look automated. Assert
that the sample was taken before interpreting its emptiness.

Second, **a second closing rule is structurally required**, because the
trailer alone leaves a permanent class of invisible completions. That rule is
[evidence-based-auto-close](./evidence-based-auto-close.md), and the trailer is
its high-confidence half rather than its whole.

## The sample window

Trailers are read from a bounded sample of recent commits, not from the whole
history — usually the same sample another part of the analysis already takes.
That bound has a consequence to state in the design rather than discover: a
resolution claimed long ago, behind more commits than the window holds, is no
longer visible as a claim. In practice this is harmless, because such an item
will have been closed by the inferential rule at the first assessment after
the fix landed. It stops being harmless if assessments are rare and commit
volume is high, in which case widen the window rather than trusting luck.

Where the assessed branch is the authoritative one, the trailer only counts
once the work merges. That is the honest semantics — resolved means landed —
and it belongs in the artifact so the operator expects it.

## Decision rules

- **When the analysis already reads commit messages for any purpose, put the
  marker there**; the marginal cost is a regular expression.
- **When it does not, weigh the trailer against a first-class channel** — if
  you must build history reading solely for this, a small committed manifest
  or a status endpoint may cost the same and carry more.
- **When a trailer names an unknown identifier, ignore it silently** at the
  parse and record it at the apply step; a stale batch, a typo, or a copied
  prompt from a neighbouring system all produce this and none of them is an
  error worth failing on.
- **When a trailer names an item that is not claimed, treat it as a claim
  anyway** if the item is open — an executor that resolved something nobody
  handed to it did useful work.
- **Never treat the absence of a trailer as evidence of anything.**

## When not to use this

- **When you cannot observe the history at all** — a target you never clone,
  or an executor working in a system without durable messages. Then the
  return path must be an artifact the executor commits or a channel it calls.
- **When commit messages are rewritten by policy** — squash flows that
  discard bodies, or automation that regenerates messages — because the
  signal is destroyed after being written, which is worse than never having
  been written: the agent complied and you still see nothing.
- **When the identifier would leak something.** Trailers are permanent and
  public to anyone with the codebase; the identifier must be an opaque
  handle, never a customer name, a vulnerability description, or a token.
