---
layer: technique
type: technique
subject: toasts-notifications
technique: severity-taxonomy
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [designing the closed set of severity levels, warnings have stopped meaning anything, a message that fits no existing level]
---

# Severity taxonomy

Every out-of-band message carries exactly one severity level from a closed
vocabulary, and that one classification drives every presentation decision
the message will ever face. The technique is the design of that vocabulary
and the discipline that keeps it singular.

## The level set

Five levels cover nearly every product; more is a smell, fewer loses a
distinction consumers need:

| Level | Defining question: *what if the user never sees this?* | Typical examples |
|---|---|---|
| **info** | nothing — pure awareness | background sync finished, a peer joined |
| **success** | they miss confirmation of their own action | saved, sent, connected |
| **warning** | something will degrade if unaddressed | credential expiring, quota near limit, degraded fallback active |
| **error** | something already failed | save rejected, job failed, connection lost |
| **critical** | the product cannot do its job until a human acts | data integrity risk, security event, unrecoverable subsystem down |

The set is **closed**: a message that fits no level is evidence the level
definitions need revisiting *once*, centrally — not evidence that this call
site should invent `error-but-softer`. An open set decays into a palette,
and a palette answers no consumer's question.

Closed also means **attested, not aspirational**. A level that no real
message ever earns is not completeness — it is an unused word that authors
will eventually bend to mean something ("info, but make it stick around").
Independent products converge on a smaller transient-tier vocabulary than
designers expect — pure *info* frequently earns zero call sites, because a
message with no consequence and no confirmation value usually should not
interrupt at all. Derive the set from the consequence table; delete levels
the table cannot distinguish.

## The non-alarm band is a level, not a second axis

Most level sets are a monotone alarm ladder, and a product that also
announces *good* news — a threshold crossed upward, a degraded subsystem
recovered, a milestone reached — has a real design choice to make: add a
band to the ladder, or add a parallel "tone" axis beside it.

Add the band. A parallel axis forces **every** renderer to switch twice —
once on severity for dwell, placement and politeness, once on tone for
glyph and color — and the second switch is the one that gets forgotten, so
good news arrives wearing the alarm's chrome. As a level, the good-news
band inherits the whole mapping row for free, and the honest consequence
question still answers for it: *what if the user never sees this?* — they
miss news they would have liked, which is a real but low-consequence miss,
so it maps to a short dwell, no escalation and polite announcement.

The band is not *success*. Success is confirmation of the user's own
action, arriving because they acted; the non-alarm band is news about the
system's own movement, arriving because the world changed. A set that
collapses them loses the ability to say "this happened while you were
away, and it is good" — which is exactly the message a durable ledger
exists to hold.

## The widest declaration is the real authority

A closed vocabulary is usually enforced by a **total mapping** — one
structure with a cell for every level, which fails to compile when a level
is added and a cell is not. That check is weaker than it looks, and the
gap is where forked vocabularies actually enter:

> **A total mapping only guards levels that carry the vocabulary's type.**

The level set gets re-declared downstream — most often at a persistence or
transport boundary, where a row or payload shape is written as its own
inline set of literals rather than as the vocabulary's type. That
re-declaration is where a new level enters first, because it is written by
whoever needed the new level and nobody else's file has to change. The
total mappings upstream keep compiling, because the new value never had
the vocabulary's type; the level is simply absent from them, and a call
site papers over the hole with a literal where the mapping would have
supplied a cell. The result is a vocabulary that is closed in the type
system and open in production — the one failure mode the closure was
supposed to prevent.

Two rules follow, and they are cheap:

- **Every re-declaration derives.** A storage shape, a wire contract, a
  helper's return type — each names the vocabulary's type or is generated
  from it. An inline set of literals that happens to match today is a fork
  that has not diverged yet.
- **Widest wins, and it is reconciled upward.** When one declaration
  admits a level the authority does not, the authority is wrong until
  proven otherwise: either the level is real and belongs in the one
  definition with a row in the mapping table, or it is not and the
  downstream declaration narrows. Leaving them unequal is choosing which
  renderer breaks.

The same test finds the fork from the other end: for each total mapping
over the vocabulary, count its cells against the set of values actually
persisted. A level that reaches storage and has no cell anywhere upstream
is a fork already in production.

## Assignment by consequence, not vibe

The failure mode of every severity system is inflation: authors reach for
the loudest level available because *their* message feels important, and
within a year everything is a warning and warnings mean nothing. The
defense is that assignment is answerable by a test, not a feeling — the
*if-never-seen* question in the table above. Two corollaries:

- **Severity is about the user's stake, not the system's effort.** A retry
  loop that recovered after eleven attempts is *info* (or nothing at all);
  a one-line validation rejection of the user's own submission is *error*.
  How hard the system worked is invisible and irrelevant.
- **Recovered problems demote.** A condition that was warning-level while
  live is at most info-level as news of its resolution. Announcing
  recoveries at the severity of the original problem doubles the alarm
  volume for zero added obligation.
- **The level is a claim, and claims have tense.** A positive level asserts
  the operation *completed*; showing it before unawaited work finishes is a
  false statement with a head start on its own correction — and the
  correction, if it comes, arrives as a separate message the user has no
  reason to connect to the first. Optimistic flows have two honest shapes:
  await the work before claiming, or keep the optimistic order and write
  copy that names the stage actually reached ("queued", "cancelling —
  cleaning up"), never the past tense — with a compensating failure message
  attached to the work that was not awaited.

## One authority, one mapping table

The level set is defined in exactly one place, and every consumer derives
from it ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The derivations worth centralizing form one mapping table per product:

| Level → | visual encoding | dwell | dismissibility | ledger record | OS-escalation eligible | announcement politeness |
|---|---|---|---|---|---|---|
| info | neutral | short | auto | no (unless flagged) | no | polite |
| success | positive | short | auto | no | no | polite |
| warning | cautionary | long | auto, ledger twin | yes | if actionable | polite |
| error | negative | long | explicit or acted | yes | if user-initiated op | assertive only if blocking |
| critical | maximum contrast | none — persists | acted only | yes, pinned | yes | assertive |

The exact cells are product decisions; the *structure* is not: one row per
level, one column per presentation channel, and no call site reaching past
the table. When a message needs different presentation, the author's only
lever is choosing a different level — which forces the honest conversation
("is this actually critical?") instead of the quiet fork ("critical dwell,
info color").

Visual encoding derives from the product's semantic design vocabulary
(status colors, iconography) — the severity table maps level to *semantic
token*, and the token system maps to pixels. Two vocabularies, each with
one authority, composed; never a hex value in the severity table and never
a severity conditional in a component picking colors ad hoc.

## Severity is not actionability

The taxonomy answers "how much does this matter"; a separate, orthogonal
bit answers "must the user do something". The pair, not severity alone,
decides transience (see the golden path's decision table): an *info*-level
message can be action-required (an approval request is not bad news, but it
must not evaporate), and an *error* can be awareness-only (a background
retry that will proceed without the user). Systems that overload severity
to imply actionability end up unable to express exactly these two cells,
and authors respond by lying about severity to get the persistence they
need — which is how inflation starts.

## Crossing boundaries

Where messages originate in more than one process or language, the level
set must cross the boundary *as the vocabulary, not as prose*: a shared
enumeration mirrored by contract (ideally generated from the single
authority), never re-derived by matching message strings on the far side.
A boundary that stringifies severity reintroduces per-consumer
classification — the exact disease the single vocabulary cures.
