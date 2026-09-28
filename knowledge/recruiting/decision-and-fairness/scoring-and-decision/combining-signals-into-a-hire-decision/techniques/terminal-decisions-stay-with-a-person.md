---
layer: technique
type: technique
subject: combining-signals-into-a-hire-decision
technique: terminal-decisions-stay-with-a-person
status: forged
laws: [no-adverse-outcome-is-solely-automated, every-decision-names-its-actor, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [designing the stage machine around a combined decision, deciding which transitions automation may execute, recording who made a hire or reject call]
---

# Terminal decisions stay with a person

A combination engine that produces a good verdict will, within a quarter, be
asked to *act* on it. The request is always reasonable-sounding: the recruiters
are drowning, the verdicts are accurate, the obvious ones could just move
themselves. This technique is the line that does not move, and the reason it does
not.

## The line

Some transitions are **terminal** — they end the process for a person, or they
commit the organization to them. Terminal transitions are human acts. Automation
may prepare, surface, rank, remind and recommend right up to the edge, and then
it stops.

| Transition | Who acts |
| --- | --- |
| new → screening | automation may |
| screening → interview | automation may, subject to the hold rules |
| **interview → offer** | **a person, always** — extending an offer commits the organization |
| **offer → accepted** | **the candidate, always** — nobody else can accept on their behalf |
| **any stage → rejected** | **a person, always** — recommendation may be automated, the act may not |

The two rows that surprise people are the offer rows. The interview-to-offer
move is not automatable no matter how confident the verdict, because an offer is
a commitment with compensation, headcount and legal consequences attached. And
offer-to-accepted is not the employer's transition at all; a policy engine that
marks an offer accepted because the deadline passed, or because the candidate
went quiet, has recorded a candidate's decision that the candidate never made.

**Policy never advances or closes an offer. It only surfaces aging.** An offer
sitting unanswered for eleven days produces a notification to a human, and
nothing else. This distinction — surfacing versus acting — is the whole
technique in one sentence.

## Rejection is not a routable outcome

A model may recommend a decline. The machine-actionable route admits **advance**
and **hold** and nothing else; a decline recommendation parks at a human gate
([law](../../../../_laws.md#no-adverse-outcome-is-solely-automated)). This is not a
courtesy. An adverse decision that a system makes *or materially influences*
is, in a growing number of jurisdictions, a regulated act with disclosure,
explanation and contest obligations attached. Independently of law, it is the
decision most likely to be wrong in a way nobody ever discovers, because rejected
candidates do not generate outcome data.

Two conditions keep this rule honest about what it buys:

- **It is stricter than most law, on purpose.** Some regimes permit solely
  automated sifting under safeguards. Keeping the act human is this subject's
  choice, not a legal minimum, and it should be defended as a choice.
- **A human act only counts if it is one.** Moving the click to a person does
  not take the recommendation out of scope. The EU's top court held in 2023
  that a score the decision-maker draws strongly on can itself be the decision.
  Newer statutes reach any system that materially influences a consequential
  decision, and regulators treat a reviewer who routinely applies the output as
  no reviewer at all. In experiments, people followed a biased system's hiring
  advice most of the time, even when they rated it poorly. The gate below is
  what turns a click into an act.

The corollary for bulk work: where a human is approving many declines at once,
they approve the *exact set they reviewed*. Re-derive the set at commit time and
refuse if the cohort has drifted — a preview approved at noon and executed at
five over a different population is an automated decision with a human's name on
it, which is worse than an honest automated one.

## Every terminal act names its actor

The record stores who acted: a named human, or the automated process, with a
third honest state for *cannot determine*
([law](../../../../_laws.md#every-decision-names-its-actor)). Three rules that get
violated constantly:

- **A null actor renders as "not identified", never as a default person.**
  Attributing an unattributed decision to the requisition owner because they are
  the obvious candidate is the one lie an audit surface may never tell.
- **A human reversing a machine's recommendation seals to the reverser**, and
  does not inherit the machine's attribution. The reversal is a new decision.
- **Authority may be downgraded, never upgraded.** Where the record is unclear
  whether a human or the system acted, record automated. Guessing upward
  manufactures human oversight that may not have happened.

## The decision must be more than a click

A human gate that presents a verdict and a button is not oversight; it is a
rubber stamp with an audit trail, and it satisfies neither the spirit nor —
increasingly — the letter of meaningful-human-involvement requirements. A
terminal gate must give the actor what they need to disagree:

- the **component signals**, not just the composite, so the actor can see what
  drove it;
- the **flags and the unresolved discrepancies**, prominently;
- **what was not measured**, so absence is not read as a clean result;
- a **path to disagree that is as cheap as agreeing** — if advancing is one
  click and overriding requires a written justification in a different system,
  the gate has a designed-in bias toward the machine's answer;
- and a **reconsider path** afterwards, reading the sealed reason back, so an
  adverse outcome stays reversible.

Measure override rates, but do not read them alone. A gate where humans agree
with the machine 99.5% of the time is either an excellent model or an unstaffed
formality, and the rate cannot tell you which. A high rate is no better sign:
overrides are wrong more often than right in the field evidence. Three
instruments can tell the two apart:
- **seed known-wrong recommendations** into the queue and count how many
  reviewers catch them;
- **record review time**, since a decision made in two seconds was not weighed;
- **score each override against its outcome** when one resolves.

A model trained on past human decisions will agree with the humans by
construction, so for such a model agreement proves nothing.

## A guard window around a fresh human decision

There is a quieter way for automation to take a terminal decision away from a
person: re-run the policy pass over a file a human just decided, and let it move
the candidate on its own reading. The human's decision is not reversed — it is
overtaken.

The guard: **while a human screening decision is recent, the automated pass
skips the file entirely.** Not "defers to it", not "weights it" — skips, and
records that it skipped. The window is a named constant defined in exactly one
place, because the message a reviewer reads ("a decision was made in the last
day; automation stood down") must not drift from the gate that produced it. A
window of roughly a day is a reasonable default; what matters more than its
length is that it exists and is checkable.

## Stage identity comes from a role, not a name

Terminal-ness is a property of the stage's **role in the process**, not of its
display name. Teams rename columns constantly. Key every rule off a stable role
vocabulary — entry, screening, interview, offer, terminal — so a board renamed
"Final Chat" does not silently become automatable
([law](../../../../_laws.md#meaning-does-not-live-in-a-label)).

## Decision rules

- **When a transition ends the process or commits the organization, require a
  human actor** and refuse the automated route at the policy layer, not in the
  interface.
- **When an offer ages, notify; never transition.**
- **When a verdict recommends decline, route to a gate**, never to an action.
- **When the actor is unknown, record unknown**, and downgrade rather than
  upgrade authority.
- **When a human overrides, record the override with its reason and what the
  human knew that the rule did not**, and feed it to the outcome loop as a
  labelled disagreement. An override that is later borne out by the outcome is
  evidence that the combination rule is mis-specified. One that is not is
  evidence about the reviewer. Nothing tells the two apart until the outcome
  resolves.

## When not to use this

There is no exemption for accuracy, volume, or seniority of the requester. There
are two genuine boundaries worth stating so the rule is not applied where it does
not belong:

- **Non-adverse automation is fine.** Sending an invitation, scheduling a slot,
  moving a candidate *forward* under the hold rules, requesting a document —
  none of these are terminal and none need a gate.
- **Candidate-initiated terminal acts belong to the candidate.** A withdrawal is
  terminal but it is theirs; do not insert a human approval into a person's own
  decision to stop.
