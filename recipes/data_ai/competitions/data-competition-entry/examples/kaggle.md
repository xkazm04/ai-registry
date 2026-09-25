# Kaggle as the `research` connector

What was learned mapping this recipe onto Kaggle competitions. Nothing here is part of
the recipe: swap the venue and this file stops applying while the recipe does not change.
Venue rules move; each competition's own rules page is authoritative over anything below.

## What the mapping has to decide

**The rules page is a contract the account holder accepts, not documentation.** Downloading
the data and submitting are both gated on the human accepting that competition's rules,
and that acceptance is the moment eligibility (the host's residence, age and employment
restrictions), team size, the daily submission limit, the entry and team merger deadlines,
the outside data policy and the winner's obligations become binding. Read it before the
data. Host clarifications posted in the competition's discussion count as part of it.

**The visible and final leaderboards score different slices of the test set.** The
leaderboard shown during the competition is computed on a portion of the test data; the
final ranking uses the rest. The movement between them at the close is where entries
tuned against the visible board lose places. Measure local validation against the visible
scores to calibrate it, then choose on local evidence.

**Final selection is an explicit act.** The account holder marks a small number of
submissions (commonly two) to count for the final ranking. Left unmarked, the venue falls
back to the best visible scores, which is exactly the choice this recipe warns against, so
the handoff to the human includes which to mark and why.

**Code competitions change what a submission is.** Many competitions take submissions as
a notebook that is re-run against the hidden test set, under a runtime limit and with
internet access disabled. Every dependency and pretrained weight has to be attached as a
dataset beforehand, so an experiment that only runs online, or only runs within the limit
on a faster machine, is not yet a submission. Log the runtime alongside the score.

**Outside data and sharing.** Rules commonly require outside data and pretrained models to
be publicly and freely available, and some ask for them to be posted in a designated
discussion thread before a cutoff. Sharing code privately outside the team is prohibited;
sharing publicly on the venue is allowed. Record the source and licence of every outside
artifact in the experiment log when it is first used, not at the end.

**Winning obliges.** Prize eligibility typically requires handing over the solution code
and a written description of the method, and licensing it under the terms the rules name,
often an open source licence. Establish before the final week that the operator can meet
that, including for any third party component in the entry.

**One account per person, and it is the person's.** Multiple accounts are grounds for
disqualification. The agent runs experiments and prepares entries; the human holds the
account, accepts the rules, forms any team and submits.

## What transfers to any competition venue

- The host's rules are binding and eligibility is personal, so they are read first and by
  the person they bind.
- A leaderboard visible during a competition is a sample of the final one, and the size of
  that sample is what decides how much to trust it.
- Whatever the venue calls final selection, leaving it to a default is a decision too.
