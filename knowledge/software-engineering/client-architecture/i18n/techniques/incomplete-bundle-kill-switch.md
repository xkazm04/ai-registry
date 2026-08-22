---
layer: technique
type: technique
subject: i18n
technique: incomplete-bundle-kill-switch
status: forged
laws: [one-authority-per-vocabulary, one-validation-door]
shared_with: []
use_when: [a locale is structurally complete but not yet trustworthy, withdrawing a shipped locale without cutting a release, a reader stranded on a locale that no longer appears in the switcher]
---

# Incomplete bundle kill switch

Completeness is a structural claim: every key present, no value left in the
source language, every placeholder intact. Trustworthiness is a different
claim, and no gate in this subject makes it. A locale can be at perfect
parity and still be machine-translated and unreviewed, terminologically
inconsistent with the glossary, legally unchecked in its consent and
billing copy, or freshly repaired from an encoding incident that nobody who
reads the language has confirmed. The catalog is whole; the language is not
yet the product's language.

So the shipping decision needs its own control: **one flag per locale that
says whether a reader may reach it at all**. Not a percentage, not a
partial rollout, not a "beta" badge on a language menu. The golden path's
observation is the whole argument for the shape — a screen that is
partially in the reader's language reads as *broken*, not as *in progress*
— and the same is true of a locale that is grammatically whole but wrong in
the words that matter. Whole-locale withdrawal is honest; partial exposure
is not.

The flag is a **decision, expressed as data next to the locale registry**,
not a scattering of conditionals. The set of locales a reader may reach is
a closed vocabulary and gets exactly one authoritative definition
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary));
every site that could hand a reader a locale derives its answer from that
one predicate. Because it is data, withdrawing a locale on the morning a
quality problem is found is an edit and a deploy, not a code change and a
release cycle — which is the only reason the control gets used when it is
needed rather than argued about.

There is a stronger form worth knowing: resolve the predicate at **build
time**, per environment, so the production artifact contains no reachable
path to a withheld locale at all rather than a runtime branch that declines
to take one. That buys a guarantee no amount of care at call sites can —
the code is not merely unreached, it is not there — and it costs the
ability to change the answer without a deploy. Take it when the withheld
set is stable and the risk of leakage is what worries you; keep the data
form when locales are being repaired and released one at a time. What is
*not* acceptable in either form is a single global switch standing in for
per-locale flags: one switch means the first locale ready to ship waits for
the last one, which is how a repaired locale sits withheld for a quarter.

## One flag, three obligations — and teams do only the first

The technique's whole content is that **the flag must do three things**,
and the failure mode is reliably that it does one.

1. **Gate the switcher.** The withheld locale does not appear in the
   language menu, in onboarding's language step, or in any settings list. A
   reader cannot choose what they cannot see. This is the obvious one, it
   is satisfied in an afternoon, and on its own it is close to useless.

2. **No-op the setter.** The menu is not the only door into a locale. A
   deep link carrying a locale parameter, a preference synced from another
   device or another surface, an administrative override, a marketing
   campaign URL, an automated test, a browser language header honored on
   first visit — every one of these sets the locale without going near the
   switcher. The setter itself refuses a withheld locale and leaves the
   reader on the default; refusing at the store rather than at each caller
   is what makes the writers enumerable
   ([one validation door](../../../_laws.md#one-validation-door)) instead
   of hoping the next entry point remembers.

3. **Scrub the persisted value on rehydration.** This is the one that gets
   forgotten, and forgetting it is what makes the withdrawal a fiction.
   A reader who selected the locale while it was live has it saved in local
   preference storage. Hiding it from the menu does nothing for them. The
   setter never runs for them either — nobody is setting anything; the
   value is simply *read back* at startup. So they stay on the withdrawn
   locale **forever**, and worse, they have no way out: the switcher no
   longer lists the locale they are on, so the interface offers no
   affordance for leaving it. The rehydration path must normalize the
   stored value against the same predicate and force the default when it
   fails.

Treat an *unknown* stored value identically to a withheld one. A locale
retired between releases, a value written by a newer build, a hand-edited
storage entry, a corrupted profile — they all arrive at the same place, and
one normalization function covering every case is the difference between a
control that works and one that works for the cases somebody enumerated.

## What the flag is not

It is not a substitute for the completeness gate, and the two answer
questions in a fixed order. Completeness asks *is this bundle structurally
whole*; the kill switch asks *is this whole bundle fit for a reader*. A
locale can pass the first and fail the second every day of the week, and a
team that reads a green parity board as a shipping decision has confused a
precondition for a verdict.

It is also not a place to leave things. A withheld locale is an open
commitment: whatever is written down when the flag goes off must name the
condition that turns it back on — a review completed, a backlog cleared, a
native reader's sign-off — and who is holding it. Otherwise the flag drifts
into a permanent state and the locale's translations rot in the catalog,
still gated, still costing bundle bytes, still passing every parity check
that gave nobody any information about them.

Two consequences fall out of it being real:

- **Withheld means not delivered.** Once a locale cannot be reached, its
  sections should not be built into or fetched by the client either. Paying
  for bytes nobody can select is the mild cost; the sharp one is that a
  reachable-but-unlisted bundle invites exactly the deep-link and override
  paths obligation two exists to close.
- **The public claim follows the flag.** The count of languages the product
  advertises is derived from the shippable set, not from the number of
  files in the catalog. A marketing page that names a language a reader
  cannot select is a defect with a very short path to a support ticket.

## The complementary control the flag cannot replace

A reader who is *allowed* onto a locale still needs the transition to be
sane, and that is a separate design decision with a real trade: switching
locales mid-session either flashes source-language text while the new
sections load, or briefly holds the previous locale's text and swaps once.
Both are defensible, both should be *chosen* rather than inherited from a
loader's default, and the reasoning belongs with the switch itself in
[locale-runtime](./locale-runtime.md). The kill switch decides *whether*
the locale is reachable; the runtime decides what reaching it feels like.
