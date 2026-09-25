---
layer: technique
type: technique
subject: mcp-tools
technique: first-party-agent-is-a-principal
status: forged
laws: [one-validation-door, unknown-is-not-a-value, gate-sees-target]
shared_with: []
applied: code
ab_verdict: better
use_when: [the product's own agent calls the tools the protocol door serves, an in-process companion reuses the tool handlers without going through the route, deciding whether the vendor's agent may skip the public tool door, an agent's tool set is computed by excluding writes rather than by granting reads, a new scoped read tool lands and nobody edits the companion, two doors onto one store resolve their gates separately]
---

# The first-party agent is a principal, not a code path

A service that answers people and agents usually grows several faces onto
one core: a request/response API for its own interface, a live socket for
updates, a tool-protocol door for agents. The discipline that keeps them
honest is that every face is a **thin projection** of one service -
authentication and framing at the face, everything that decides what a
caller may do in the core. [server-composition](./server-composition.md)
and [authentication-and-scoping](./authentication-and-scoping.md) put that
decision in one dispatch door
([one-validation-door](../../../../_laws.md#one-validation-door)).

The caller most likely to get a door of its own is the product's own agent.
It runs beside the core, the handlers are importable, and "it is ours" reads
as trust. The rule for it: **the first-party agent gets no path an external
agent holding the same grant would be refused.** It is a principal with a
grant, admitted like any other - not a code path with its own filters.

## The strong form, and the question that decides whether you can have it

The strongest enforcement is to have no other door: the product's agent
registers against the public tool door with a credential, exactly as a
third-party client does. Then every rule the door enforces *because only
agents call there* - a required rationale on writes, agent attribution in
the audit trail, a narrower verb set than the human API - binds the
vendor's agent too, and the public door is exercised every day by the one
caller its authors watch most closely.

Whether that is available is decided by one question: **can the first-party
agent present the credential type an external agent presents?** When it acts
for a user who authorized it through the same flow any client uses, yes -
take the strong form and build nothing else. When it cannot - it runs
server-side inside a member's session and holds a session, not a bearer
credential - forcing it through the front door means minting a credential
per session to walk through a door whose authentication step is the only
part that differs. It also flattens refusal wording that is deliberately
per-caller: an anonymous token is told "unknown tool" so the door cannot be
used to enumerate what an organization has; a member asking the product's
own agent is owed "this plan does not include that", because it is a fact
they can act on.

## When there are two doors: one admission, not one door

Split each door into what belongs to the face and what belongs to the core:

| per face | shared |
| --- | --- |
| authentication (bearer token, session) | admission: which tools this principal may see and call - scopes, then plan gates |
| refusal wording for its caller class | argument validation and dispatch |
| transport framing and error delivery | the result serializer - both doors show the model byte-identical text |
| **subtraction**: a face may drop tools | nothing a face may *add* |

The second door is legitimate; a second *admission* is not. Two admissions
over one catalog drift, and the direction they drift in is the one this
rule forbids.

## Admit by grant, never by exclusion

The drift has a specific shape, and it arrives through somebody else's
change. A second door that computes its tool set as *the whole catalog minus
the writes, minus the tools that need a work-queue holder* is correct for
every tool that exists and admits every tool that does not. The day another
lane adds a read tool behind a resource scope no credential of the agent's
carries, the protocol door refuses it to every token without that scope -
and the companion offers it to every member who can read the organization.
Nobody edits the companion's file for this to happen. An unclassified future
tool has been read as "allowed", which is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at the
catalog: the exclusion list encoded "no objection known", and the door
spent it as permission.

The repair is to state the first-party agent as a **principal with an
explicit scope grant**, admitted by the same function the protocol door
calls for a token. Its exclusions then follow from the catalog's own markers
instead of from a list: writes need a write scope it does not hold,
holder-bound tools need a holder scope it does not hold, and a new scoped
read is not the agent's until the grant names that scope - exactly as it is
not a token's until an operator grants it. Type the grant against the
scope vocabulary, so a misspelled scope fails the build instead of silently
narrowing the agent. What the face still owns it may keep, as subtraction
after admission: refusing writes by name, or re-asserting a plan gate at
dispatch time so a later refactor cannot dispatch past it
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Pin it with assertions that pull in opposite directions

A single "the agent is not offered X" assertion is passed by an agent that
is offered nothing. Pin three things over the live catalog:

- **Drift:** with a synthetic read tool behind a scope outside the grant
  added to the catalog, the agent is not offered it.
- **Over-correction:** with a synthetic read tool behind the door scope
  alone, the agent *is* offered it.
- **Agreement:** on the real catalog, for every combination of plan gates,
  the agent's tool set equals the protocol door's admission for a token
  holding exactly the agent's grant, minus the face's subtractions - and it
  still does after the drift tool lands.

Measured on a companion that had the exclusion form: the drift probe and
agreement-under-drift failed, the other three held; after the repair all
five held, and the agent's tool set on the real catalog was identical
before and after for all four plan combinations.

## What it costs

One admission means correlated failure. Breaking the plan filter inside the
shared admission turned red the guards of both doors at once - which is the
point, since one change is now seen by both doors' tests - but no door is a
stricter backstop for the other any more. Keep dispatch-time re-checks at a
face that has a reason to be stricter; they are subtraction, and they are
cheap.

The same drift exists one layer down wherever two doors resolve the same
store-level predicate separately. The incident that made the pattern visible
at the measured seam was exactly that: a store behind three doors, where the
request API and the companion checked the workspace's plan and the protocol
door did not - and where two doors onto one store disagree, the looser door
is the policy. Resolve such a predicate once and hand the decision to each
face, or accept that every new gate must be added in N places and write the
agreement test that notices when it is not.

## Boundaries

[caller-differentiated-capability](./caller-differentiated-capability.md)
narrows one tool's option set for an agent below the human's, by removing
options from its schema. This technique is the step before it: which tools a
caller is admitted to at all, when more than one door reaches the same
catalog. The two compose - admission by grant, then per-surface subtraction
- and neither lets a face add.
