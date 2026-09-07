# A multi project portfolio view as the `source_control` connector

What was learned mapping this recipe onto a portfolio level view of several repositories.
Nothing here is part of the recipe: swap the connector and this file stops applying while
the recipe does not change.

## What the mapping has to decide

**A portfolio view answers a different question than the recipe asks.** Aggregate health,
a technology radar, a risk matrix and a dependency graph tell you which project deserves
the pass at all. They do not tell you what to fix inside it. The recipe's ranking step can
use them to choose a target, and then still has to read code to produce a candidate.

**It cannot open a file, and that breaks the candidate.** Every candidate this recipe
produces names the files it touches, and a portfolio binding has no way to fill that
field. A charter bound only at portfolio level therefore emits candidates with the one
piece of evidence a person needs to decide missing, which is exactly the shape that gets
rejected. Bind a project level checkout alongside it, or accept that the pass produces
targets rather than candidates and say so.

**The two readings disagree, and the disagreement is informative.** Portfolio risk is
computed from metadata such as language, age, dependency counts and activity; a project's
own history states the same thing directly and in more detail. When they conflict, the
project level reading is the one that can name files and is the one to report. Treat the
portfolio reading as a hint about where to look, never as a finding in its own right.

**Cross project signals age differently from code.** A dependency advisory or an
end of life date changes without any commit landing anywhere, so a tree that has not moved
can still be worth a pass. This is the one case where the recipe's self paced trigger
should wake on something other than code movement.

## What transfers to any portfolio level binding

- A portfolio signal selects the target; it does not produce the candidate.
- A candidate that cannot name a file is a target, and calling it a candidate is what
  teaches a reviewer to stop reading the list.
- Metadata derived risk and history derived risk are two different claims. Report the one
  that can be checked.
