---
layer: technique
type: technique
subject: agent-memory
technique: pending-beliefs-live-apart
status: forged
laws: [silent-state-is-ungoverned, one-validation-door, deletion-is-not-repair, unknown-is-not-a-value]
shared_with: []
use_when: [designing the store for beliefs an agent proposed and nobody has confirmed, a forgotten filter could recall an unconfirmed item as settled, deciding what a review card must show beside an extracted claim, a rejected proposal comes back on the next pass, an assistant replies before its extraction has run, several agents write memory under one person's identity]
---

# Pending beliefs live apart

[memory-governance](./memory-governance.md) decides *which* writes go to the
proposal-reviewed lane. This technique is the **shape of that lane**: where a
proposed belief sits while nobody has nodded, what the person reviewing it is
shown, what the proposer remembers about verdicts already given, and what the
assistant is allowed to say in the meantime. Each of the four is a place
where a system that has the lane on paper leaks around it in practice, and
the measured failures below were all found in systems that had the lane.

The originating case is small and exact. A person told an assistant to
remember that a company had moved its headquarters. The assistant replied
that it had recorded the move. The store received an edge with an **empty
relation**, confidence 0.9, live and recallable — the ontology had no word
for "moved to", which was handled correctly, but nothing stood between the
extraction and the belief store, so a meaningless edge became a belief and
the reply claimed a completion that had not happened. The disease is not the
missing gate. It is the **gap between what was said and what the store
got**, with no moment at which anyone could see it.

## The pending store is a separate table, not a status on the live one

The tempting design is a column: `status = pending` on the belief row, and
every read adds `AND status <> 'pending'`. It is the wrong design, and the
reason is a **failure direction**, not a preference.

Count the read sites first. A belief store of any age has dozens of queries
that select live items — in one measured store, 27 in six files when first
counted and 56 in seven files a day later — and every one of them would need
the new clause. Miss one and an unconfirmed belief is recalled as settled,
which is the single outcome the lane exists to prevent. The compiler does
not help: the filter is a string inside a query, and a query that omits it
is well-formed.

Put pending items in **their own table** and the omission fails the other
way. A read that forgets the table hides the queue — a visible, recoverable
defect — and cannot leak a belief, because the belief store never held the
row. The one thing the feature must never do becomes the one thing an
omission cannot produce. The same argument decides the storage of derived
beliefs in the same tree: rules that infer new items write to a second table,
where a forgotten union makes derivations invisible rather than mixed in
with assertions, and of forty-odd queries over the assertion table only one
knew the flag that would have separated them.

Two consequences follow from the split:

- **The columns differ, and that is a feature.** The pending row carries
  what the reviewer needs and the belief row does not: the exact utterance
  it came from, the model's own wording for a relation the vocabulary lacks,
  and who proposed it. The relation itself may be *empty* — and that
  emptiness is precisely what the person must see, so it is a nullable
  column, never a placeholder word
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **After the nod the row leaves.** Confirmation writes the belief through
  the same path every other belief takes — evidence attached, temporal
  reconciliation run, so confirming a succession closes the predecessor as
  an extraction would — and the pending row is deleted. A pending table
  whose semantics is "waiting for a person" must not hold rows a person has
  already seen, or its count lies; the one door still governs
  ([one-validation-door](../../../../_laws.md#one-validation-door)).

**The boundary is the write's shape, not its source.** Bulk ingest stays
optimistic — extracted, written, reviewed afterwards by confidence and
evidence — because nobody confirms ten thousand items from five hundred
documents one at a time. The gate covers the interactive single-item write,
which differs on all three axes: one claim at a time, the person still in the
conversation, and material they said on purpose. The cheapest moment to
confirm is right after they said it. A hand-added edge belongs in the same
table; a scheduled sweep does not.

## The review surface shows the utterance above the extraction

A triple alone asks for a judgment from nothing. Shown `Acme --?--> Shenzhen`
a reviewer can only guess what was meant; shown the sentence they typed a
minute ago with the extracted claims beneath it, they say "that is wrong"
at once. The value of confirmation is mostly that **the person sees what is
about to be asserted** in the terms they used, and the card's job is to make
the gap between said and got visible at the moment it is cheapest to close.

Three things the card carries, and one it must not:

- the **original sentence**, whole, as the quote — not a summary of it;
- each extracted claim with its **empty parts empty** — an unnamed relation
  shows the model's proposed wording beside a blank, never a filler;
- **who said it**, at the granularity the reviewer judges by (below);
- and no **confidence number** dressed as a measurement. A proposal is a
  proposal; the person's stance lives in the audit ledger as an event
  (`confirmed`, `rejected`) with the person as actor, not as a float on
  the row.

The same rule reaches the assistant's reply. Extraction is usually
asynchronous — making it synchronous blocks the conversation for seconds
per sentence — so at the moment of replying the count of extracted claims
does not exist. The assistant may say **the sentence is recorded and its
claims will be shown for confirmation**; it may not say "three facts
extracted" or "I have recorded that the company moved". The card then grows
into the conversation when extraction completes, fetched by the utterance's
id so a replayed session finds it the same way. Claiming completion the
system has not reached is the same disease on the reply side.

## The proposer remembers the verdict, by identity

A pass that re-reads the same episodes under the same prompt re-derives the
same claim. If rejection only flipped a status, the claim returns on the
next pass and the rejection lasted exactly one cycle — the operator is asked
the same question forever, and the review lane's bypass pressure
([memory-governance](./memory-governance.md) § *Audit*) rises for a reason
nobody can see in the queue.

Before a proposal is written, the proposer checks three stores in order and
reports which one answered, because none of the three "did not propose"
outcomes is an error:

1. **Already asserted** — the exact claim is live in the belief store.
   Do not ask; it is known.
2. **Already pending** — the claim is in the queue. Do not ask twice.
3. **Rejected** — a person refused this claim before. Do not ask again.

Rejections live in **their own table** too, for the same reason the pending
rows do: a row the person has already seen must not sit among rows they
have not. And the rejection is keyed on **the whole claim** — subject,
relation, object — never on the subject and relation alone. The measured
system's rejection table has no value column, so a literal-valued claim is
exempt from the check on purpose: blocking on `(subject, relation)` would
turn "salary 28000 was rejected" into "never propose salary again", and a
new value for a rejected key is a new question. Asking it once more costs a
click; refusing it silently costs a true belief. This is the identity
discipline that
[decision-records](../../../../operations/governance-and-records/audit-logging/techniques/decision-records.md)
states from the audit side — key a decision on what survives regeneration,
never on the wording — applied at the proposer, where it prevents the
re-ask instead of merely surviving it.

## Who proposed it, when several agents act as one person

The lane reads the evidence's author
([memory-governance](./memory-governance.md) § *The evidence has an author*).
The pending row must record it at the granularity the reviewer actually
judges by, and "the person" is often too coarse: a base with several agents
attached, each holding a credential that acts *as* that person, produces
three cards that all read "the person said" when what the reviewer needs is
that one came from a code assistant and one from a meeting-notes agent —
not the same trust. So the row carries the **credential** that proposed it
beside the person, and the credential's revocation is a trace rather than a
deletion, so the attribution on a pending row does not vanish when the key
is rotated ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).
Deleting the person is the one path that clears it, and the pending row
outlives that too: it was already waiting.

## What this technique does not decide

- **Which writes take the lane** — memory-governance's stakes and author
  tiers. This technique assumes a write has been classed proposal-reviewed.
- **What happens after the nod.** Confirmation is an ordinary belief write
  through the one door; supersedence, validity windows and reinforcement are
  [consolidation](./consolidation.md)'s.
- **What the proposer may recall in the meantime.** Nothing pending takes
  part in recall, retrieval or inference; an item that must be recalled as
  "unconfirmed" is a different lane with a different table.

## Failure modes

- **The status column.** Every read site becomes a place to leak a belief,
  and the leak is silent
  ([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
- **Confidence 0.6 for "proposed".** A binary state encoded as a float,
  which also lands the item in the low-confidence queue — two queues asking
  different questions, sharing one number.
- **The card shows triples only.** The reviewer confirms a claim they cannot
  check against what they said, and the said-versus-got gap is now signed.
- **The reply claims completion.** "I have recorded that…" before extraction
  ran; the person stops reading the card because the assistant already
  said it was done.
- **Rejection keyed on the key alone.** One refusal generalises into a
  standing prohibition on a whole attribute.
- **Rejection stored as a status on the pending row.** The pending count
  lies, and the queue surfaces rows a person already decided.

## When not to use it

- **Bulk ingest.** Optimistic write plus post-hoc review by confidence and
  evidence is correct there; routing it through a nod queue produces a
  queue nobody drains.
- **No person in the loop.** An unattended pipeline has no nod to wait for;
  its proposals are auto-lane observations with provenance, or they are
  not written.
- **A store with one reader.** If exactly one query reads beliefs, the
  failure-direction argument collapses and a column is fine — until the
  second reader appears, which is the day to split.
