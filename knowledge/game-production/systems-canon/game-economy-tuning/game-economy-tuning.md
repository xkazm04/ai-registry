---
layer: golden-path
type: golden-path
subject: game-economy-tuning
status: forged
use_when: [designing or auditing a game's resource economy, a currency has become worthless or unobtainable, deciding which tuning lever actually moves an outcome, checking whether a progression curve has the shape it claims]
techniques:
  - faucet-sink-balance-band
  - economy-philosophy-multipliers
  - rarity-inflation-and-affix-saturation-alerts
  - progression-curve-shape-tests
  - wealth-concentration-and-price-imbalance-alerts
  - tornado-sensitivity-sweeps
---

# Game economy tuning

An economy is the part of a game that keeps having to work after the content stops
being new. A quest is consumed once; a currency is consumed every hour of every session
for the life of the product, and it either keeps producing decisions or it quietly
stops. Economy tuning is the craft of holding a resource system in a state where
acquiring, spending and choosing all still mean something across a long play horizon —
hundreds of hours, not the twenty minutes a designer plays while tuning.

The work is not "pick good numbers". It is: enumerate every way a resource enters the
world and every way it leaves, with rates; state the band the net flow must stay inside;
express the design stance as a small explicit vector rather than a hundred scattered
edits; watch for the pathologies that make a reward system stop rewarding; verify that a
progression curve has the *shape* it claims and not merely plausible values; and find
which of the forty knobs actually moves the outcome. Six things, in that order.

## The load-bearing claim: an economy with unmetered drains is unspecified

**A currency that has sources but no drains is not a tuned economy — it is an
unspecified one. A drain that exists in the design but carries no throughput estimate
is equally unspecified.** Both are the same defect wearing different clothes: the
system cannot answer the question "at hour forty, how much of this does a player have,
and is that the amount we intended?" If nobody can answer that from the specification,
the answer will be produced by the players, and it will be produced badly.

The universal objection is that this is a live-service concern — that a game with no
trading, no auction house and no other humans in it cannot have an economy problem. The
objection is wrong in an expensive way, because the single-player pathology is the
harder one to see.

In a game with a market, an unbalanced economy announces itself: prices move, a
currency hyperinflates, someone posts a chart. In a game without one, nothing announces
anything. The currency accumulates until every price is trivially payable, and at that
moment every purchase decision silently stops being a decision. Nothing breaks, no
metric spikes; the player becomes gradually less engaged with a third of the systems
that were built, and the post-mortem calls it "pacing". The absence of a market removes
the *symptom*, not the *disease* — and removes the corrective pressure with it, because
there is no price signal to push back.

So: single-player games have economies, they have the same failure modes, and they
have them with the alarms disconnected. Specify them the same way.

## The specification shape

A resource specification that is worth checking has one entry per source and one entry
per drain of each currency, and each entry carries three things:

- **a base amount** — what one occurrence yields or costs;
- **a scaling term** — how that amount changes with progression, stated as a formula,
  not as "it goes up";
- **a frequency estimate, per hour of play** — how often the occurrence happens for a
  representative player at a representative point in progression.

The third one is the one teams skip, and skipping it is what makes the specification
decorative. A base amount without a frequency is not a rate, and a system of rates is
the only thing you can actually balance. Two hundred units per kill is not information
until someone states that a representative player gets thirty kills an hour at that
tier; those two facts together are six thousand units an hour, which is a number you
can put on the other side of an equation. A number handed across a boundary without
its basis is not information — that is a law of this bundle, and this is its sharpest
instance.

The corollary is a hard rule about representation: **an unestimated frequency is
recorded as unestimated, never as zero and never as a placeholder default.** A drain
whose throughput nobody has estimated must render as *unspecified* in every report,
and an economy containing one is reported as unspecified rather than as balanced. A
zero silently makes the economy look more inflationary than it is; a placeholder
silently makes it look balanced. Both are lies with a plausible face, and the second is
worse because it passes.

Expect the enumeration itself to be the highest-yield hour of the whole exercise. The
common finding is not "the numbers are wrong" — it is that four drains that everyone
believed existed are not reachable by a player who has passed a certain tier, so the
real drain count is smaller than the design document's, and the economy has been
inflating since launch for structural reasons no amount of coefficient tuning fixes.

## Three structural rules that outrank all tuning

Tuning cannot repair a structural defect, and three of them recur often enough to be
stated as law before any number is chosen.

**Every currency declares at least one drain, in its own definition, as a required
field** — alongside its identifier, its class and its per-hour faucet and drain
estimates, not in a spreadsheet beside it. That is the difference between a rule people
intend to follow and a rule an author cannot skip: if the type carries a drain list and
two throughput estimates, an incomplete currency is visible at the moment of authoring,
which is the only moment it is cheap to fix.

**Currency classes do not convert freely into one another.** A conversion between a
soft currency and a premium or crafting one is a faucet for the receiving currency
funded by an unrelated economy, and it silently merges two economies whose bands were
computed separately. Either the conversion is a designed, rate-limited drain in one
direction with its throughput specified like any other, or it does not exist.

**The best drain is a system players want to use, not a tax.** The strongest form in
this genre is a crafting economy where the consumable currencies *are* the modification
operations — spending is how you improve an item, so the drain scales with engagement
instead of fighting it. A repair fee is a drain players resent and route around; a
crafting step is a drain they seek out. When an economy needs more drain throughput,
look first for a system that could consume the surplus as part of its own appeal, and
only then at fees.

## The band, not the point

The balance target is never a point. A perfectly neutral economy is neither achievable
nor desirable: a small positive net flow is what makes progression feel like
accumulation, and a small negative one is what makes a scarcity design bite. What
matters is that the intended net flow is *stated as a band*, that the band is written
down where humans read it, and that the check that enforces it reads the same
statement.

The band needs one basis that is easy to forget: **the player's own reward
multipliers.** Genres in this family let players stack modifiers raising reward quantity
and reward rarity, and at endgame those stacks reach several hundred percent. A rate
computed with them at zero describes a player who has not existed since mid-progression.
State the assumed stack next to the rate, or the check certifies a fictional economy.

A defensible default is a net flow within plus or minus fifteen percent of neutral, over
the specified sources and drains at a stated progression point. Fifteen percent is not
sacred; what is sacred is that a band exists, that it has a stated basis, and that "we
are inside it" is measured rather than felt.

Two disciplines make the band real. First, the band and the check share one source — a
number in a design document and a threshold typed into a validator drift silently, and
the unreviewed copy wins. Second, **the band applies to the configuration that ships.**
The characteristic embarrassment of this work is a project that authors a rigorous band,
builds a rigorous checker, and never points it at its own default tuning — which turns
out to violate it. Point it there on day one and treat the failure as the finding it is.

## A stance is a vector, not a thousand edits

Games do not have one correct economy; they have a *stance*. A loot-driven game wants
generous acquisition and light friction. A survival or scarcity game wants the
opposite. A balanced stance sits between them. Teams usually express that stance by
editing dozens of individual numbers over months, at which point the stance exists only
in the aggregate and cannot be stated, compared, reverted, or handed to anyone.

The transplantable move is to express the stance as a **small vector of multipliers
applied over the whole specification** — one factor on acquisition rates, one on
consumption rates, one on reward generosity — keeping every individual number at its
neutral, first-principles value underneath. Three numbers describing a philosophy is a
design artifact you can hold an argument about; a hundred edited numbers is archaeology.
It also unlocks comparison: "what happens if we ship the scarcity build" becomes a
one-line change and a re-run rather than a branch, which is why teams without a stance
vector never ask the question at all.

## The pathologies worth naming

Balance is not one measurement. Four distinct families of failure show up, and they
need separate detectors because they have separate causes and separate fixes.

**Monetary drift.** Net flow leaves the band in either direction. Inflation makes every
priced decision trivial; deflation makes acquisition feel punitive and drives players
into whatever degenerate grind still pays. Both are detected against the band.

**Distribution and price failure.** An economy can hold its aggregate net flow inside
the band while being broken for most of the people in it. Wealth concentration — a
Gini coefficient above 0.6 as a warning, above 0.8 as critical — says that the median
player's experience has decoupled from the average. Price imbalance says that
individual goods have drifted relative to income even where the aggregate has not. And
a readability rule catches the endgame case: **a consumable that costs under one
percent of hourly income has stopped being a resource-management decision**, whatever
the aggregate says.

**Reward-curve decay.** The characteristic failure of a loot economy is not inflation
of a currency but the reward system flattening: power gains per level plateauing, the
top rarity tier becoming common, the modifier pool collapsing onto a few entries,
upgrades arriving too rarely to feel like progress. Each is measurable, each has a
threshold, each has a distinct player-facing consequence, and each is detected
separately because each is caused separately.

**Shape failure.** A progression curve can have reasonable-looking values at every level
a designer has personally played and still be the wrong *kind* of curve.

## Shape is not coefficients

This distinction gets collapsed more often than any other here, and the collapse is
expensive. A curve tuned to the wrong shape can be made to agree at any two points you
care to check. If the design calls for geometric growth — each level costing a fixed
multiple of the last — and the implementation is polynomial, an audit sampling level
five and level twenty finds both values acceptable while the curves diverge by an order
of magnitude at level sixty, in a way no coefficient adjustment reaches. The fix for
wrong coefficients is tuning. The fix for wrong shape is a rewritten formula and a
re-derivation of everything downstream of it. Test the *family* over the full supported
range first; test coefficients only once the family is settled. And accept the harder
half: a formula that is deliberately the "wrong" family is a legitimate design
decision, handled as a recorded, justified exception — never as a tolerance widened
until the shipped formula passes.

## Which lever actually matters

Once an economy has thirty inputs, intuition about sensitivity is unreliable and
confidently so. Sweep one input at a time across its plausible range, record the swing
in each outcome, rank by swing. The result is routinely counter-intuitive, which is the
point: the knob the team has argued about for three weeks moves the outcome by two
percent while an unexamined frequency estimate moves it by forty. It also locates the
*specification risk* — a high-sensitivity input that is a guess is the measurement to go
and take; a low-sensitivity guess can stay a guess, and that conclusion retires work.
Two cautions keep it honest: one-at-a-time sweeps miss interactions by construction, and
a ranking computed at one progression point does not transfer to another.

## The golden path, in order

1. **Enumerate.** Every currency, every source, every drain, each with base amount,
   scaling term and per-hour frequency. Mark every unestimated frequency as unestimated.
2. **State the band** in prose, with its basis and its progression point, in the place
   the checker will read it from.
3. **Choose a stance** and express it as a multiplier vector over the neutral
   specification.
4. **Simulate the horizon** you actually care about, not the one you can play. If the
   product's promise is two hundred hours, tuning validated at hour six is not evidence.
5. **Run the alert families** — monetary, distribution, reward-curve, shape — as
   separate detectors with separate thresholds, each reporting *unmeasured* where its
   input is missing rather than passing by default.
6. **Sweep for sensitivity**, per horizon, and re-measure the top-ranked uncertain
   inputs before touching anything.
7. **Point every check at the shipped configuration** and treat its failures as
   findings about the product, not about the check.

## What this subject deliberately does not own

The internal structure of an item — rarity as a budget of modifiers, item-level gating
of which modifiers may appear, the tier tables themselves — belongs to the systems
canon of the genre, and this subject consumes those structures rather than defining
them. The machinery for parsing a band out of prose so that the law and its enforcement
cannot drift belongs to the subject on executable design canon. Validating combat
outcomes by simulating many trials, and solving backwards for the value that hits a
target, belongs to encounter balance. And the question of how much of a specification
has actually been covered by measurement at all is a production-coverage concern. Each
is named here because an economy audit will touch all four; none is duplicated here.
