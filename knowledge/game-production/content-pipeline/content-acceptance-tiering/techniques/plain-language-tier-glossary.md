---
layer: technique
type: technique
subject: content-acceptance-tiering
technique: plain-language-tier-glossary
status: forged
laws: [law-and-check-share-one-source]
shared_with: []
use_when: [artists cannot read the acceptance board, naming the rungs of a ladder, an authoring surface must show acceptance state]
---

# Plain-language tier glossary

Every rung and every status carries a second name in the language of the people who make
the content, generated from the same definition the evaluator uses. This technique is
how those names are written, and how they are kept from drifting away from what they
name.

## Why this is structural, not cosmetic

The people who consume an acceptance ladder most often are not the people who built it:
artists, animators, designers, producers. To them, a rung named by an internal code and
defined in a type declaration is not merely opaque — it is invisible. The observed
failure is not misinterpretation. It is *abandonment*: they stop consulting the board and
go back to asking a person whether the thing is done. At that point the ladder is an
expensive internal detail with no consumers, and it will be the first thing cut.

A second, subtler cost: without shared names, the team has two vocabularies for the same
distinctions, and the translation between them happens in someone's head during a
standup. Every such translation is a chance to lose the distinction the rung existed to
preserve.

## Writing the names

Rules that produce names that work:

**Two or three words, no jargon, verb-or-noun-phrase.** *data check*, *human pick*,
*rules check*, *live test*, *looks-good test*. If a name needs a parenthetical it is not
a name.

**Name the evidence, not the mechanism.** *live test* names what was done; *harness
invocation* names how. The mechanism will change; the evidence kind will not, and a name
tied to mechanism goes stale and then lies.

**Preserve every distinction exactly.** The plain name is a translation, not a
simplification. If two rungs get plain names a reader would consider synonyms, either the
names are wrong or — check this first — the rungs failed the strictly-more test and are
genuinely the same rung.

**Name the statuses too, and this is where teams stop too early.** *deferred* is the one
that most needs translating, because its plain meaning is precisely what is hardest to
convey: *not run here* or *needs the game running* reads correctly to everyone; *deferred*
reads as *postponed by choice*, which is the exact misunderstanding that turns the status
into a mute button.

**Translate the operations and the predicates too, not just the rungs.** The glossary
that actually gets used covers four families: the rungs (*data check*, *human pick*,
*rules check*, *live test*, *looks-good test*), the statuses (*done*, *needs a fix*,
*waiting on the live runner*, *not started*), the predicates (*all set up* for
configuration-complete, *proof level* for the rung axis itself), and the **operations**
someone might perform (*run the waiting tests* for draining the deferred gates). Teams
translate the rungs, stop there, and leave the reader fluent in the nouns and helpless
at the verbs.

**A status name that implies an action names the action.** The plain definition of a
deferral is the place to say what resolves it and who does it — "waiting on a live run;
queue it with the run-waiting-tests action". This single sentence converts the status
from a thing to be tolerated into a thing to be dispatched, and it is why deferrals get
drained in studios where the glossary does this and accumulate in studios where it does
not.

**Say what a rung cannot see, in the same register.** One short clause per rung —
"a data check can't tell you whether it moves" — attached to the name wherever the name
appears. This is the cheapest possible defence against a low rung being quoted as
stronger evidence than it is, and it reaches the audience that most needs it.

## One source for the name and the check

The plain name is not a comment beside the evaluator, and not a hand-maintained page
somewhere else. Both the evaluator and every display surface read the rung's definition
from one place: identifier, plain name, blindness clause, deferral legality. Adding a
rung means adding one entry, and a surface that renders an unknown rung fails loudly
rather than displaying a raw identifier.

The drift this prevents is specific and common. A rung's meaning is tightened — it now
also verifies magnitudes, not just activation — and the evaluator is updated while the
glossary keeps the old plain name for a year. Every non-engineer in the studio now holds
a wrong model of what green means at that rung, and nobody finds out until an incident.
If the definition is single-sourced, tightening the rung and renaming it are the same
edit.

## Where the names must appear

- On the authoring surface, next to the artifact, at the moment someone is deciding what
  to do next. This is the position that produces almost all of the value.
- In run summaries and reports read outside the pipeline team.
- In the deferral reason text, so an absence explains itself in the same vocabulary.

Where the names should *not* appear: inside the stored data. Store the identifier;
translate at the edge. A plain name persisted into records becomes unrenameable, and you
will want to rename it — the first draft of these names is rarely the one that sticks.

## Validating the names

The test is not whether the names sound clear to their author. Hand the rung list, with
plain names only, to two people who make content and did not build the ladder, and ask
them to say what each rung proves and what it cannot see. Names that survive that
unaided are done. Names that require you to speak are not names yet, and rewriting them
is a twenty-minute job that pays for itself the first time a board is read without you in
the room.

Repeat the test when the ladder changes, and when the team turns over — a glossary
validated only against the people who were present at its design is validated against the
one audience that never needed it.

## When not to use this

Do not maintain a plain glossary for a ladder with no non-engineer consumers — an
internal pipeline whose only readers are the people who wrote it. The names cost
maintenance, and unread names drift silently, which reintroduces exactly the divergence
this technique exists to prevent.

Do not let plain naming become renaming of the underlying concepts. The identifiers stay
stable and precise; the plain name is a second label on the same thing. A team that
replaces its identifiers with friendly words loses the ability to talk precisely when
precision is what the conversation needs.
