---
layer: technique
type: technique
subject: giveaway-legal-guardrails
technique: no-prize-chance-and-consideration
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [deciding whether a giveaway configuration may run, adding a paid or gated entry route to a draw, classifying a draw before it is sealed]
---

# Never prize, chance and consideration together

A draw configuration is classified by three elements before it can be sealed, and the one
combination that is an unlawful private lottery in most jurisdictions a streamer tool serves
— a **prize**, awarded by **chance**, to entrants who gave **consideration** — is refused.
The technique is a classifier over the whole configuration, not a check on any one field.
Product design practice, not legal advice: the classifier encodes the common test, and the
streamer's own adviser decides the edge cases.

## Read each element from the configuration

**Prize.** Anything of value the winner receives: goods, keys, gift cards, money, a paid
subscription gifted to the winner, an experience with a market price. A draw that only
selects a viewer — to join a match, to name the next segment, to be shouted out — has no
prize, and the classifier stops there: it adds no friction to a draw with nothing at stake.
The prize is a declared field with a declared value, because a prize the tool was never told
about is a prize the tool cannot reason about; an unset prize on a draw labelled a giveaway
is asked about, not assumed absent.

**Chance.** In a draw tool chance is present by construction. The classifier does not try
to argue a draw into a skill contest; a promotion whose winner is chosen by judged merit is
a different feature with different rules.

**Consideration.** Any entry route, gate or multiplier that costs the viewer something they
cannot get free:

- a paid subscription, tier or membership required to enter or to see the entry command;
- a purchase, donation, tip or paid-currency spend that enters or adds entries;
- points or tokens that can be bought, or converted from paid currency;
- a required subscription to a third-party service with a price.

The contested cases — follow-to-enter, points earned only by watching, sharing a post — are
named in the configuration screen as contested, and the classifier's default treats a gate
the viewer cannot pass for free as consideration. A tool that serves a single jurisdiction
with settled guidance may relax that default; a tool that serves an international audience
should not.

## Apply the rule

1. **No prize:** pass, no friction.
2. **Prize, and every route to every entry is free:** pass to the next checks (value,
   jurisdiction, age), which may warn.
3. **Prize, and some route costs something, and an equal free route exists:** pass to the
   next checks, and verify the free route's parity — that it reaches the same draw, that its
   entries weigh no less than paid entries, and that it is shown wherever the paid route is.
4. **Prize, and some route costs something, and there is no equal free route:** refuse.

The refusal names the element that tipped it and the three ways out: remove the prize,
remove the paid gate, or add a free route with equal odds and equal prominence. It is a
visible state on the draw, kept on its record — not a disabled button the streamer has to
reverse-engineer.

## Parity is the hard part

A free route that exists but whose entries count less, that is announced only in the rules
document, that closes earlier than the paid route, or that costs more effort than a
reasonable viewer would spend is the failure regulators single out. The British statute
spells out the shape — a free route as prominent as the paid one, whose entries are no less
likely to win — and practitioner guidance in other places says the same in different words
(both read 2026-11-02). Weighting rules that could make a paid entry heavier than a free
one belong to the eligibility layer; this technique only checks the result: compute the
best weight a free entrant can reach and the best a paying entrant can reach, and refuse if
the second exceeds the first.

## Decision rules

- **When a new entry route or multiplier is added to the product**, it declares whether it
  is free, paid or contested before it can ship; an undeclared route is treated as paid.
- **When the configuration changes after classification**, classify again; a draw sealed on
  an old classification is a draw nobody checked.
- **When the prize is a platform-native paid item** (a gifted subscription, paid currency),
  it is a prize; gifting it does not make the draw free.
- **When the streamer runs the giveaway for a sponsor**, the sponsor is the promoter and the
  classification is unchanged; the sponsorship is a disclosure question, handled elsewhere.

## When not to use it

Skip the classifier for draws with no prize, and say so: a pick-a-viewer feature that
quietly ran legal checks would teach streamers that the checks are noise. Do not use it as
a substitute for the streamer's own advice on a large or cross-border promotion; it catches
the configuration error, not the jurisdictional nuance.
