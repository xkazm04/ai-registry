---
layer: technique
type: technique
subject: audience-steering-economies
technique: binding-votes
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [calling a vote on a live show, handing a vote result to a generative host, checking that a host honours results its character dislikes]
---

# Binding votes

A vote is a promise the host makes by calling it: whatever wins, happens. Every other part
of the steering economy rests on that promise holding, and it is broken far more easily
than it is kept. A result overturned once — declared void, reinterpreted, or replaced with
something adjacent the host preferred — teaches the room that the ballot is theatre, and
turnout falls on the next one and keeps falling. There is no partial credit: a vote the
host honours nine times in ten is a vote the room cannot trust.

## Design the ballot so it can bind

Bindingness is decided before the vote opens. Put on the ballot only options the show
**can and will** execute — options the host has the means to perform in the time
available and the willingness to perform with conviction. If the host would refuse one of
the options, it must not be offered; if the host would be unable to deliver it, it must
not be offered. A ballot with a decoy option the show quietly cannot run is an overturn
waiting for its turn.

State the rules before the first vote is cast: the closing time, what happens on a tie,
and what happens on low turnout (a minimum count, below which a stated default applies).
Rules announced after the result look like rules chosen to fit it.

## Hand the host a fact, not a suggestion

A generative host has a character with preferences, and a host told "the room voted,
decide how to proceed" will, some fraction of the time, argue, reinterpret, delay, or
misstate the winner. The obvious theory is that this happens when the persona dislikes the
result, and the dramatic case does fail. But measured, the failures are not concentrated
there: hosts drop and misstate ordinary results too, because a closed ballot is one fact
among many in a crowded context and the host's attention moves on. A smaller, faster model
does this markedly more often than a larger one, and no model does it never. So the
binding is structural, and it covers every ballot, not only the contentious ones:

1. **Code tallies the ballot.** The model never counts votes or reads them from chat.
2. **Where the winning option is a show operation, code enacts it at the close.** If the
   options are "summon this guest" or "run this segment next", the runtime performs the
   winner the moment the ballot closes, and the host's job shrinks to announcing and
   playing it. A result the host cannot fail to enact is the strongest binding available,
   and it should be the default whenever an option maps to an operation.
3. **Otherwise, the winner enters the host's context as a settled fact** — the option, the
   margin, the turnout — framed as what the show is now doing, and kept there until it has
   been acted on. A context that simply stops mentioning the ballot once it closes leaves
   the host to remember the winner from the last running tally it saw.
4. **The host's next turns are checked** for an accurate announcement and an enactment of
   the winning option. A turn that names the wrong winner, refuses the result, or performs
   a different option is a failure the system catches, not a style choice.
5. **A missed enactment is recovered**, not forgotten: the result stays pending and the
   host is reminded until it is performed or the ballot is formally withdrawn.

## Reluctance is allowed; refusal is not

A host with a personality may perform its feelings about the result — a villain can sulk,
a bureaucrat can file a protest, a showman can pretend to be wounded — and that
performance is half the entertainment of losing a vote to the room. It must end in
compliance, and it must be short: a line of protest, then the thing the room chose, done
properly. Grudging enactment is a bit; half-hearted enactment that sabotages the option
is an overturn wearing a costume.

## The only legitimate withdrawal

If a winning option has become impossible or unacceptable since it was put on the ballot
— the guest left, events made it harmful — the host withdraws it **openly**: says what
changed, says the option is struck, and states what happens instead (the runner-up, a
re-vote). It never simply fails to happen. Withdrawal is rare by construction, because
the ballot only offered options the show could stand behind; a show that withdraws often
is designing its ballots badly.

A ballot cut short by the show's own machinery is a withdrawal too. When a change of
segment, a sign-off or a timeout closes an open ballot without resolving it, the room
voted and nothing happened; the host must be told, and must say on air that the vote was
overtaken and what becomes of it. A transition that silently discards an open ballot is an
overturn the system committed on the host's behalf.

## Measuring it

Measure honouring votes as a hard rule per closed ballot — pass or fail, at a bar of every
ballot — not only as an average over the host's turns. The two readings diverge sharply:
a turn-level rate in the mid-nineties can coexist with roughly one stream in seven breaking at least
one result, and it is the broken result the room remembers. Report the unwelcome results
as their own slice so the persona's pull is visible when it does bite. A result the check
could not evaluate — the stream ended, the transcript was cut — is recorded as unchecked,
never counted as honoured.

## Decision rules

- **When composing a ballot**, every option must be one the host can perform and will
  perform; strike any option that fails either test before voting opens.
- **When the vote closes**, code computes the winner; if the winner is an operation, code
  performs it, and otherwise the host receives it as a fact that persists until acted on.
  Never let the host count.
- **When a transition would close an open ballot**, resolve it or have the host withdraw it
  on air; never discard it silently.
- **When the host's character dislikes the result**, let it protest in one line and then
  comply in full; check that it did.
- **When an option must be withdrawn**, do it on air with the reason and the replacement;
  never by omission.

## When not to use it

Not every question to the room is a ballot. "Should I be cruel or crueller, chat?" asked
for a reaction is a prompt for banter, and the host may treat the answers as colour. The
line is the word **vote**: once the host frames a question as a decision the room makes —
with options, a count and a close — it binds. If the host wants to keep the choice, it
must not call a vote.
