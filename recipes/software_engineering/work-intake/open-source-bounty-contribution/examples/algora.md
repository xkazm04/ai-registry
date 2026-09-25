# Algora as the bounty board over GitHub

What was learned mapping this recipe onto Algora specifically. Algora layers a cash bounty
market on top of GitHub issues, so it inherits everything in `examples/github.md` and adds
a race and a payout. Nothing here is part of the recipe: swap the board and this file stops
applying while the recipe does not change.

## What the mapping has to decide

**The bounty is paid to the merged pull request, so the claim is not the win.** On Algora a
contributor can signal an attempt with an `/attempt` comment, but the money follows the PR
the maintainer actually merges. An attempt is a courtesy that reduces duplicated work; it is
not a lock. The recipe's confirmation step is worth most here precisely because the reward
structure invites several people to start at once, and the second review-ready PR earns
nothing.

**Check for an existing attempt and an existing PR, and weigh both.** The board shows who
has attempted a bounty and links the pull requests against it. A bounty with an open,
active PR already close to merge is one to leave; a bounty whose only attempt is a stale
comment with no branch is one where the work is still there to be done. Reading that state
before starting is the difference between a paid change and a wasted afternoon.

**The bounty amount is a decoy for scope.** A larger bounty does not license a larger diff.
The maintainer still merges the smallest change that resolves the issue, and a sprawling PR
attached to a big bounty is bounced for the same reason a small one is. Let the issue, not
the price, set the scope.

**Disclosure and payout identity are separate obligations and both are the human's.** The
account that receives the bounty and the account that must carry any AI-use disclosure are
the submitting human's, not the agent's. Hand the review-ready diff and the disclosure to
that person; the recipe stops before the payout is claimed.

## What transfers to any bounty-board connector

- The reward follows the merged change, not the claim, so confirming nobody is already close
  to merge is worth more than posting an attempt fast.
- A bounty's size never widens the acceptable scope; the issue does.
- The payout identity and the disclosure obligation both belong to the submitting human, so
  the recipe hands off before either is exercised.
