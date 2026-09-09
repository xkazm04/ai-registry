---
layer: technique
type: technique
subject: zero-budget-channel-planning
technique: channel-family-taxonomy-by-lifecycle-kind
status: forged
laws: [label-convention-as-convention]
shared_with: []
use_when: [designing the channel model of a free-visibility plan, deciding what "done" means for a channel, deriving a channel's next step from its stage]
---

# Channel family taxonomy by lifecycle kind

Free channels are named by family - directory, marketplace, community, owned
content, organic social, PR, partnership - because that is how a marketer talks
about them and how a generating model is asked to enumerate them. But the family
is not what decides how a channel behaves once the business is on it. What decides
that is the channel's *kind*: the broad shape of the interaction the business is
entering. Seven families fold into four kinds, and the kind, not the family,
drives the lifecycle, the derived next step, the suggested mode of operation and
whether a target query can be aimed at the channel at all.

## The fold

| Family | Kind | Won by | Can be "done" |
|---|---|---|---|
| directory, marketplace | listing | completing a registration | yes |
| community, organic social | conversational | sustained presence | never |
| owned content (blog, newsletter, video) | content | publishing the next piece | never |
| PR, partnership | outreach | a pitch someone accepts | per pitch |

The table is the whole technique. A listing is a bounded task: verify, fill the
fields, add photos, mark it done, revisit when something changes. A conversational
channel is a standing commitment whose cost is attention and whose failure mode is
being read as spam; it has no completion state, only live, paused or abandoned. A
content channel continues by producing the next piece and is the only kind that
can carry a target query. Outreach is a series of discrete pitches; a single
placement can be closed, the channel cannot.

Everything downstream keys off the kind. The default mode of operation is manual
for a listing (one-shot work) and delegated for a conversational channel (where a
trained assistant earns its keep answering reactions). The derived next step for a
live listing is "mark done"; for a live conversational channel it is "check the
inbox"; for a live content or outreach channel it is "create the next piece". A
query is dealt only to kinds that carry content. Every one of those rules would be
wrong if written against the family list, because two families in one kind share
the rule and one family in two kinds would need it split.

## Lifecycle: stage stores intent, readiness is derived

The stage vocabulary is deliberately small - identified, planned, live, paused,
done - and it records what the business *intends*, not what is true. Whether a
planned channel is actually ready (a voice trained for the delegated mode, an inbox
source chosen for a conversational channel, a first action taken) is derived at
read time from the state of the modules that own those facts, and never persisted.
Persisting readiness lets the plan's signpost disagree with the module it
describes; deriving it means the next step is always computed from what is true
now.

Two rules follow:

- **When the business edits a channel's settings, keep its stage.** A live channel
  stays live; if the edit opens a readiness gap - say, switching to a delegated
  voice that is not trained - the derived next step surfaces the gap. Demoting the
  stage would erase intent to state a fact the derivation already states. Only an
  undecided channel advances to planned on a decision.
- **When a stored value could make the derivation demand something impossible,
  drop the value.** A delegated-voice scope that names no real channel would derive
  "train this voice" forever; the sanitizer rejects it and the derivation falls back
  to the kind's suggested scope. A trap nothing can satisfy is worse than a default.

The absent track is the identified state and is never persisted, which keeps the
stored blob to the channels the business has touched.

## The anti-spam cap belongs to the conversational kind

Conversational channels get one extra field: a per-week cap on posts the business
sets when it plans the channel. The range - one to fourteen a week - is a
practitioner convention, not a platform rule, and the technique labels it as such.
The cap is a ceiling the business chose for itself, recorded as intent and handed
to whatever module enforces cadence across posting; it is never a target, and this
plan never enforces it a second time. The reason a cap exists at all is that
community norms are the one place where over-participation costs the channel:
discussion forums commonly expect roughly nine contributions for every promotional
mention (a widely repeated convention, formally retired as a platform rule and now
enforced per community by moderators), and a 2026 check of forty-nine
founder-frequented communities found about two in five banning self-promotion
outright. The first action on any conversational channel is therefore "read this
community's rules", ahead of anything about posting.

## Decision rules

- When a channel's category is unknown or malformed on the wire, coerce it to
  content, because content is the kind whose lifecycle assumes the least - it can
  neither be marked done by mistake nor demand an inbox.
- When deriving a deep link for a next step, gate it on whether the target module
  exists for this business type; when it does not, fall back to "work the first
  action here", because a signpost to a page that does not exist is a broken
  promise and the playbook's first actions are always real.
- When a channel is done, deal it no query and derive no step, because the plan
  would be proposing work on something the business closed.

## When not to use

Do not apply the kind taxonomy to paid channels; a paid campaign's lifecycle is
governed by spend gates and pacing, not by a listing/conversation/content split. Do
not use the fold to decide *within* a kind - which directory outranks which is a
fit-and-effort question, not a kind question. And do not let the kind table grow a
fifth row for a single odd channel; a channel that fits no kind is usually a
family named too finely, and folds into one of the four on inspection.
