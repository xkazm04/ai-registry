---
layer: application
type: application
subject: people-analytics-ethics
technique: risk-framing-anonymization
stack: process
status: forged
verified_on: 2026-08-20
---

# A deliberate naming asymmetry, documented at the computation site

The strongest realization of this technique in the source app
(`C:\Users\kazda\kiro\ascent`) is not code — it is a doctrine comment above the
code, written so the asymmetry survives the next engineer who notices it.

## The two panels, from the same rows

`src/lib/db/org-contributors.ts` computes both:

- `RepoConcentration` (`:36-46`) — per repository: `contributorCount`,
  `totalCommits`, `topLogin`, `topShare`, `busFactor`, `soloMaintainer`. It
  **does** name a person (`topLogin`), under the population floor.
- `OrgResilience` / `RepoResilienceRisk` (`:100-120`) — the fleet-level
  key-person exposure read, banded `critical | high | moderate | low`. It
  names **nobody, at any population size**.

Both are derived from the same contributor rows. The difference is the framing
of the panel, and that is the whole decision.

## The doctrine comment

`src/lib/db/org-contributors.ts:83-101`, headed "WHERE THE PRIVACY LINE IS
DRAWN, and why it is drawn TIGHTER than the rest of this module", is the
technique's test worked through in prose:

> "Key-person risk" is the one metric on the dashboard whose natural phrasing
> is a claim about a named human ("the bus factor here is Dana"). Everything
> below is deliberately a claim about a REPOSITORY instead: it has one point of
> failure, N contributors, X% concentration. That statement carries the entire
> decision value — you fix it by pairing, rotating ownership, or writing the
> repo down, none of which needs the name — while a name adds only the ability
> to point at someone in a leadership review as a liability.

That is test question 1 (does the name add decision value the artifact phrasing
cannot?) answered no, with the fixes enumerated to prove it. The comment then
answers question 2 explicitly:

> the asymmetry is intentional, because a "Risk" framing is exactly where a
> name stops being descriptive and starts being an accusation. The existing
> concentration table remains the one place a name appears, under the existing
> floor, where it reads as attribution rather than exposure.

## Why the comment is the artifact

The rewrite itself is one line of type design — `RepoResilienceRisk` carries no
login field, and the interface is annotated "Deliberately carries NO contributor
login — see the note above" (`:102`). Nothing enforces that at runtime; nothing
needs to, because the identity is never fetched into the shape. What needs
enforcement is the *reason*, against a future engineer who sees an
inconsistency (one panel names, its neighbour does not) and tidies it up. The
comment states, in advance, that the inconsistency is the policy and that the
tighter side is deliberately stricter "than it strictly has to be".

## The same move at team granularity

`src/lib/db/org-teams.ts:298-305` applies the technique to a derived label
rather than a name. The "knowledge leader" headline is withheld unless the
team clears the population floor, because on a one-person team "'@acme/x is the
org's AI knowledge leader' names that person by proxy across the Teams tile,
the Adoption spectrum and the Copy-for-LLM brief. Withheld at the producer, so
none of those three can re-surface it." A label whose value implies an identity
is subject to the same floor as the identity — realized here, not theorized.

## Adoptable form

The transferable practice is a three-line convention for any repository doing
people-adjacent measurement:

1. Where two panels over the same rows differ in whether they name, state the
   asymmetry in a comment **at the computation site**, in the form *this is
   phrased about the artifact deliberately, because a name here would add
   liability without adding decision value*.
2. Make the risk-side type structurally unable to hold an identity, so the
   tidy-up cannot be done by editing a template.
3. Name the fixes the artifact phrasing enables (pair, rotate ownership,
   document) inside the same comment — that list is the evidence that the name
   was decoration.
