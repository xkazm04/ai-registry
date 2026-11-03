---
layer: technique
type: technique
subject: agent-host-experience
technique: journey-shaped-tool-surface
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [deciding which operations an outside agent gets, a tool catalog that mirrors the product API, an agent chains four calls to finish one user task]
---

# Journey-shaped tool surface

The first tool surface most products ship is their API with a new wire: list, get,
create, update and delete for every noun, named after the tables. It looks complete and
behaves badly. The model must discover by trial that finishing one thing the user asked
for takes four calls in a particular order; every call is a selection it can get wrong
among dozens of near-synonyms; and in every host that loads definitions upfront, the
catalog spends context before the user has said anything. One published account of a
tool-heavy workflow measured the context it consumed falling from about a hundred and
fifty thousand tokens to about two thousand once the definitions stopped being loaded
whole — the number belongs to that workflow, but the direction is general: catalog size
is a cost paid on every turn in every host.

The surface is instead shaped by **what the user comes to do**. Each operation finishes
something: it finds and holds, it compares and recommends, it drafts and files. The
caller's agent stays in control and composes these, but it composes a handful of
meaningful steps rather than reconstructing a workflow from primitives.

## Procedure

1. **List the journeys before the operations.** Write the five to ten things a user
   would ask an assistant to do with the product, in the user's words. Each becomes an
   operation or a short sequence of two. An operation that serves no listed journey is
   a candidate for removal, not for completeness.
2. **Name for selection, describe the blast radius in words.** The name says the
   journey; the one-sentence description says what it reads, what it changes, and what
   it never does ("moves no money", "waits for the owner; pays nothing"). The behavior
   hints are published too, but a sentence the model reads is the only blast-radius
   statement every host carries. Naming and argument discipline are
   [tool-schema-design](../../../runtime-and-io/mcp-tools/techniques/tool-schema-design.md).
3. **Give every read a concise and a detailed mode**, and pagination and filtering on
   anything that lists. The concise mode is the default an agent can afford to call
   speculatively; the detailed mode is what it calls once it knows what it wants.
4. **Ship one state read that names the next moves.** The most valuable read in a
   journey surface is one that returns the current state *and which operations can
   succeed now, and why the others cannot* — whose turn it is, which limit binds,
   what is waiting for a person. It replaces the model's guess about preconditions with
   the product's knowledge of them, and it is the read every refusal can point back to.
5. **Refuse with a closed code and the rule's own words.** A refused operation returns
   an in-band error carrying a code from a closed set, the clause that refused, and the
   text of the rule the user set — in the structured result and in the text, so a host
   that reads only one still gets the code. The refusal taxonomy is one vocabulary
   ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
   the same one the product's audit records.
6. **Say "unknown" when the outcome is unknown.** An operation abandoned at its deadline
   may still have taken effect. Its answer says the outcome is unknown and tells the
   agent to read the state before acting again, never "failed" (which invites a retry
   that doubles the effect) and never silence
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The same
   honesty applies to an oversized result: withhold it, say how large it was against
   what limit, and say how to ask for less. Partial answers under a budget are
   [budgeted-partial-response](../../../runtime-and-io/mcp-tools/techniques/budgeted-partial-response.md).

## Model-visible versus view-only

Some operations exist only so a rendered view can fetch or act on what the user is
looking at: the next page of a carousel, the full record behind a card, a toggle the
user clicked. When the model should neither see nor choose an operation, publish it as
view-only. The test is whether the model choosing it would ever be right: a pagination
cursor the view owns is view-only; a search the model would phrase is model-visible.
View-only operations are still authenticated, scoped and audited exactly like the
others — hiding an operation from the model is a selection decision, not an access
decision. In hosts that render nothing, view-only operations are simply never called,
which is one more reason the model-visible set must finish every journey alone.

## One door, different grants

Outside agents, the product's own assistant, and agents the product launches for a
specific task all reach the same operations through the same door, each with a catalog
computed from what its role is **granted**, never from what was excluded. A negotiating
agent sees the operations for one deal; a read-only assistant sees one grouped read; a
future outside-agent role might see the reads plus a single write that opens the
decision in the product. Reusing a catalog built for one role to serve another hands a
model operations it should not have. The principal model is
[first-party-agent-is-a-principal](../../../runtime-and-io/mcp-tools/techniques/first-party-agent-is-a-principal.md);
scoping and per-consumer tokens are
[authentication-and-scoping](../../../runtime-and-io/mcp-tools/techniques/authentication-and-scoping.md).
A grant may also be issued before it is enabled — the catalog discoverable, nothing
executable until the person or the launching process switches it on — which lets an
agent plan against the surface without being able to act on it.

## Errors a host reads before the model does

A host sits between the operation's answer and the model, and some of its readings are
not the model's. An expired session answered with a bare authentication challenge is
read by some hosts as a sign-in prompt and shown to the user as one; renew or answer
in-band instead, and keep authentication failures for actual authentication. A protocol
error ends the call in hosts that would have let the model recover from an in-band one.
The channel rules are tool-schema-design's; what this surface adds is the obligation to
test them in more than one host.

## Catalog size has a budget

The catalog is a product surface with a budget, shared with every other server the user
installed. Few operations, sharply named, at the altitude of intent. When an operator
must fit a large capability set under a host's tool ceiling, the remedy is projection at
an operator-chosen altitude, not deletion
([catalog-projection-modes](../../../runtime-and-io/mcp-tools/techniques/catalog-projection-modes.md)).

## When a thin operation is right

Journey shaping is a default, not a ban on primitives:

- **A thin read is right when the agent's composition is the value.** A grouped query
  over the user's own records, with a closed set of views, metrics, filters and
  groupings, is a primitive — and the right one, because the questions are open-ended
  and the closed grammar keeps it safe. Close the grammar; do not wrap every question.
- **A coding agent wants primitives.** An agent working in a repository composes small
  operations well and is hampered by opinionated ones; the journey there is the
  developer's, and it is finer-grained.
- **When the journeys are unknown**, ship the few reads you are sure of and watch what
  agents chain. Repeated chains are the journeys; fold them into operations then.

## When not to use this

- When no outside agent will ever call the surface — an engine the product launches and
  fully scripts is an internal contract and can be shaped to the script.
- When the product's value is a single operation; there is nothing to shape.
