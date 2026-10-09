---
layer: golden-path
type: golden-path
subject: racing-career-economy
status: forged
use_when: [designing the money and progression loop of a vehicular racing career, a damage-heavy racer where repair bills can eat the prize, deciding what rivals do between races, a career that can dead-end or double-pay]
techniques:
  - repair-share-prize-cap
  - participation-floor-no-dead-end
  - idempotent-race-ticket-settlement
  - finite-garage-end-state-honesty
  - rival-shopping-windows-no-player-read
  - pr-ratio-boss-dip
  - qualified-wreck-advancement
---

# Racing career economy

A racing career is a loop of four beats: enter a race, finish it somewhere, get paid, spend
the payout on a better car. Every other feature of a career mode hangs off that loop, and
the loop has one property that distinguishes it from a general resource economy: **the
player's performance in the last race sets the budget for the next one, and the player
cannot opt out of the race that sets it.** A player who plays badly is poorer, and a
poorer player has a worse car, and a worse car plays worse. Left alone, that is a positive
feedback loop pointed at the player's own failure. Almost everything in this subject is a
decision about where to cut that loop and how to cut it without making losing free.

The subject holds the money-and-progression design of that loop for a vehicular racing
career, with damage as a first-class cost. It does not hold the general machinery of
economy measurement, and it does not hold how difficulty is chosen or adapted; both have
neighbours, named below, and the line between them is drawn in the boundary section.

## The four obligations of a career's money

A career economy is correct when four things are true at once, and each of them is cheap to
break and expensive to notice.

**A loss still pays.** The worst finish the game allows must leave the player with more
than they started the race with. Not because losing should be rewarded, but because a
career in which a bad night costs net money is a career with a ratchet that only turns one
way: the player who most needs the next upgrade is the one the economy is pushing away from
it. The mechanism is a ceiling on what repair may take out of a prize, expressed as a
fraction of that prize rather than as an absolute, so the guarantee holds at every tier
without re-tuning. A career may choose otherwise on purpose: a buy-in race, or a mode where the
bill is uncapped, can leave a bad night poorer, and one critic of a shipped street racer called
that risk exhilarating. That is a stakes design, not a mistake. It moves the no-dead-end duty
onto a stated rescue, such as a cheaper day to fall back to or a car that is always free to
race. It never leaves that duty to luck.

**There is no dead end.** No sequence of results leaves the player unable to start the next
race. A player at zero cash with a wrecked car must still be able to enter, in a car that
works, and the thing that makes this true is a rule of the system, not a hope about the
price list. A career that can strand a player has a loop with a hole in it, and the player
discovers the hole at the moment they are least inclined to forgive it.

**Paying happens once.** A race result settles into the player's money exactly one time,
however many times the settlement is attempted, replayed, restored from a save, or
interrupted. A career is a ledger, and a ledger that double-pays is as broken as one that
loses a payment, with the added property that players find the double-pay first and share
it.

**The end of the shop is honest.** A finite catalogue ends. When the player owns the whole
garage the career says so, never lets a purchase that does nothing be bought, and does not
invent a sink to keep the number moving. A wallet cap is part of the same honesty: what the
cap discards is shown on the receipt as the difference between what the race earned and what
was banked. The player who has finished the shop is the player who has
finished the economy, and the correct response is a clean end state, not a treadmill.

These four are not tuning. They are rules of the system, and each is stated so that a test
can falsify it without playing the game: for every prize and every repair bill, net is
positive; for every cash value including zero, the next race starts repaired; for every
ticket, settling twice leaves the balance where settling once left it; for every garage
state, an offer is either affordable and useful or not purchasable and says why.

## Repair is the sink, and it is a sink with a ceiling

In a racing career the principal drain is not a fee the designer invented; it is the
damage the player took. That makes it unlike most sinks in two ways. It is **proportional
to the player's mistakes**, so it punishes exactly the thing that already punished them in
the race. And it is **correlated with the prize**: a player who wrecks often is also a
player who finishes low, so the large bill and the small prize arrive in the same race.
The first property holds only while the bill prices inflicted damage. A bill that also prices
wear, mileage or the value of the car charges careful driving and progress too. Players of
one shipped racer reported repairs that outran a first-place prize "even without any contact".
That part of the bill is a running cost, and the cap has to cover it as well.

The naive fix is to make repair cheap, which also makes a core consequence of the game
meaningless. Dropping the bill altogether is a different and honest choice, and a shipped
destruction racer made it after part wear drained its early players. It gives up the sink
instead of pretending to keep it. The craft fix is to make repair real and to cap the *share*
of the prize it may consume. The bill the player sees is the true service cost; what the player is charged
is the smaller of that and a fixed fraction of the gross prize; the remainder is
**insured** — the game absorbs it. Insurance here is a design fiction with an accounting
meaning: the remainder is created-and-destroyed within the settlement and never touches the
player's balance, so it is a sink that does not charge, and the receipt must show it.

The share is a single number with a large reach. At a share of one half or more, a bad race
still pays about half the prize; at a share near one, the cap does nothing and the ratchet
returns; at a share near zero, repair is decoration. It is the one number that sets how
much a mistake costs relative to a success, and it belongs in the data a designer can edit,
not in code.

## The floor under the ceiling

Capping repair at a fraction guarantees that a prize which exists is mostly kept. It says
nothing about a race whose prize is zero, and a career whose last place pays nothing has
simply moved the dead end from the repair bill to the payout table. So every finishing
position pays something: a **participation floor**, set so that the worst result is
survivable and the best result is clearly better. The floor and the cap are a pair. The cap
bounds how much of a prize repair may take; the floor ensures there is a prize to bound.

The two together do not make losing free. A loser is poorer than a winner by the whole
spread between the floor and the top prize, and the repair share still consumes a real
fraction of every result. What they remove is the *trap*, not the *consequence*.

A debt does not change this. That includes a loan the player chooses and a creditor the story
imposes. The debt is a second ledger, and it takes from net after the cap:
- as a share;
- stopping at a stated minimum take-home;
- with interest that does not compound.

Its arithmetic has to clear one more bar: the worst result's repayment covers at least one
event's interest, or a losing streak grows the debt and the dead end returns through the
ledger.

A consequence that takes the car, such as a seizure, supplies one. The player races a car the
game provides, whole, and the floor still pays. Progress may wait on a win. Entry and money may
not.

## A ticket, a receipt, and one settlement

Once a race ends the game owes the player a number, and the engineering of paying it is
where careers quietly lose money integrity. The shape that holds is a **monotonic ticket**
issued when the race begins, a settlement that is keyed by that ticket, and a **receipt**
that records what was paid and why.

The receipt is also a conservation statement. Gross prize, repair charged and net paid must
satisfy an identity the receipt can be checked against, and a settlement that cannot
reproduce the identity from its own fields is wrong regardless of whether the balance
looks plausible. Anything else that takes from net gets its own line, and the identity closes
over all of them. Debt repayments and the wallet cap's discard are examples. Otherwise the gap
between earned and banked means several things at once, and nobody can check it. Settling the
same ticket a second time is refused and changes nothing. This is the same property payment systems call idempotency, and it is
needed here for the same reasons — retries, crashes mid-write and restores — with the
added reason that the whole point of the receipt is that the player can read it.

## Rivals are in the economy, and they do not watch you

A career where the opposition has no economy is a career where the player's progress is
the only thing that moves, and the field feels like furniture. A career where the opposition
adapts to the player's progress feels, correctly, like a treadmill. The structure that
avoids both has rivals who **buy through the same shop the player uses, on a schedule fixed
by the campaign, and never read the player's state**.

One trap deserves a name before the consequences. A rival with a wallet is filled by results,
and if its results come from races the player also runs, the player moves the rival's wealth
by beating it: the schedule reads the player one hop away. The audit for "never reads the
player" is transitive, and the fixed part of the schedule has to be the ceiling the wallet
cannot cross, not merely the list of intentions.

The consequences are the point. A rival's car at stage *n* is a fact of stage *n*, so a
player who knows the stage knows the field, and a player who loses can see exactly how far
behind they are in the units the game uses for everything else. Skill and preparation buy
real outcomes, because the opposition does not compensate. Compare the alternative that
many racing games ship: opposing cars whose speed is nudged up when the player leads and
down when the player trails. It makes every race close, and it makes the player's car
upgrades and driving mistakes irrelevant to how close.

Whether players resent it depends on the form, and the evidence is narrower than the folklore:
- **A visible boost is resented.** Players read an opponent in the same car with plainly more
  speed as cheating, and both practitioner and critical sources say so.
- **A modulation of driver skill can go unnoticed.** One that leaves the cars alone may pass, and
  in one lab study balancing between human racers was preferred by experts and novices alike.
- **A third form shipped.** A pacing script that still reads the player's position.

All three are in-race adjustments, and they belong to difficulty design. This subject's
position is narrower and holds either way. Nothing between races reads the player: not the
cars the field owns, not their ratings, not the prices. A fixed schedule is not harder or
easier than a banded field; it is *legible*.

The same fixity gives the designer something rubber-banding never can: a target curve.

## The tension curve is authored, not regulated

Because rivals are fixed by stage, the relationship between the player's expected car and
the field's car is a function of the stage and the player's purchases — and a designer can
author where that relationship should sit. The unit is a **performance-rating ratio**: the
player's car over the field's. A career should start with the player slightly behind,
recover through the middle as the garage fills, and **dip at each boss** — the boss is
deliberately an ascent the player has not yet bought their way out of — before ending with
the player modestly ahead, so the final stretch feels earned. Modestly is the operative word.
In a lab study of a competitive game, not a racer, wins by a wide margin felt most competent
and were enjoyed less than close ones. The last stretch should stay contestable.

That curve is a **design target**, and it must not be implemented as a runtime controller.
The moment the game reads the player's rating and moves the field, it is rubber-banding
with extra steps and every property in the previous section is gone. The curve is used
offline: to set prices, prizes and rival schedules so that a player on the intended path
needs a stated number of races to afford each step. It is checked by simulating a
reference driver along the path, and its claims are exactly as strong as that driver.

## Where wrecks fit

In a racing career with combat or collision, a wreck is both a cost and a currency: it
damages the player when suffered and pays when inflicted, and a wrecked player may still hold
a finishing position. Two rules keep that from being farmed. The bounty for destroyed
opponents is capped per race, which is an economy rule. And a result in which the player's own
car was wrecked or eliminated advances the career only if the car was *racing* — it completed
a lap or covered a minimum share of the course — which is a progress rule. The unqualified
result still pays, because the money guarantee does not depend on progress; it simply does not
promote. The two rules are separate on purpose.

## The failure modes of the naive reading

- **Repair as an absolute price.** A flat repair cost is catastrophic in the first tier and
  invisible in the last. A cost that is a share of the prize holds its meaning throughout.
- **A prize table that starts at zero.** The floor is the guarantee; a payout curve with a
  zero at the bottom is a dead end with a paper trail.
- **Settlement by balance arithmetic alone.** Adding the net to the balance and saving is
  not a settlement; without a ticket the same race pays twice on a retry.
- **A shop that always has something to sell.** An offer that cannot raise any stat, kept
  on sale to give currency a destination, is a tax with a label.
- **A field that rubber-bands.** It makes the economy irrelevant to the race and the race
  irrelevant to the economy.
- **Reading the curve as proof of feel.** A target curve is a target. The only evidence
  most careers have for it is a simulated driver, and a simulated driver does not feel a
  boss.

## Boundary with the neighbouring subjects

The general method for measuring any resource economy belongs to game-economy-tuning:
enumerating faucets and sinks, stating the balance band, sweeping sensitivities, signing
the feedback loops and testing the shape of a progression curve. This subject does not
restate those. What it owns is the set of rules that are specific to a racing career and
that a generic economy audit would not know to ask for — the insured share, the floor, the
ticket, the finite shop, the fixed rival schedule, the rating curve and the wreck rule. The
rule a reader uses to pick: when the question is "is this currency in balance and which
lever moves it", it is the general subject; when the question is "can a bad race strand the
player, can a result pay twice, or what does the field do between races", it is this one.
A career economy passes through both, and the general subject's band applies to the
numbers this subject's rules produce.

Difficulty design and adaptation owns how hard a game is, who chooses it, and what an
adaptive system may do while the player is playing; it names rubber-banding and
dynamic difficulty as the family of runtime adjustments. This subject takes one position
inside that family — the field is fixed by schedule and never reads the player — and
owns the consequences of that position for money and progression, including the authored
rating curve that replaces runtime adjustment. When the question is "should the game adjust
itself", it is the difficulty subject; when the question is "given that the field is fixed,
where should the player stand relative to it and what does each step cost", it is this one.

## The path, in order

1. **State the four obligations as testable rules** before choosing any number, and write
   the property tests: net positive for every prize, repair-free start at zero cash,
   double-settlement leaves the balance unchanged, no useless offer on sale.
2. **Choose the repair share and the participation floor together**, as data, and derive
   the worst-case net from them. Where a debt exists, derive the worst-case take-home after
   its repayment too, and check that it covers an event's interest.
3. **Issue a ticket at race start**, settle by ticket, write a receipt that satisfies its
   identity, with a line for every take from net.
4. **Declare the shop finite** and render completion as a state.
5. **Fix the rival schedule by stage**, bought from the same catalogue, and forbid the
   rival system from reading anything about the player.
6. **Author the rating curve with boss dips** and derive prices and prizes from a
   races-to-afford target; label the curve design intent until a person has played it.
7. **Cap paid opponent wrecks per race, and require a lap or a minimum share of the course** before a wrecked player's result
   advances the career; pay the unqualified result anyway.
8. **Say which numbers are simulated.** Every figure from a proxy driver is reported as
   one.
