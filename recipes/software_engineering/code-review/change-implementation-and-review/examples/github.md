# GitHub as the `source_control` connector

What was learned mapping this recipe onto GitHub specifically. Nothing here is part of the
recipe: bind a different host and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The token scope decides how far the work can go, and the honest failure is at merge.** A
fine grained token with contents read plus pull requests read and write can open a change,
push to a branch, comment, and reply on review threads. It cannot read Actions runs or check
runs without a further permission, and it cannot merge past a protected branch rule that
requires a review from somebody else. Establish at adoption which of those the operator
intends, because the recipe's promise about a visible end depends on being able to observe
the merge and not only request it.

**Review threads and issue comments are different surfaces and only one of them answers a
reviewer.** A reply posted as a general pull request comment does not appear against the line
the reviewer wrote on, so the thread stays visibly unanswered while the work believes it
replied. Replies belong on the review comment, and resolving a thread without a reply is the
pattern reviewers read as being ignored.

**Resolve is a claim, and it should follow the reply rather than replace it.** A thread
resolved with no reply gives the reviewer no way to tell whether their point was accepted,
worked around, or misunderstood. This is the exact shape of the failure the recipe names as
coding around an objection, and GitHub makes it one click.

**Draft pull requests are the right home for work that is not ready.** Opening a change as a
draft signals in flight without consuming a reviewer's attention, and marking it ready is the
observable transition the recipe wants. Opening a non-draft change that is not finished puts
the cost on the reviewer instead.

**A required check and an optional workflow look identical in the checks list.** Branch
protection decides which ones actually block, and that setting is not visible from the check
run itself. Read the protection rules rather than inferring the gate from what is red, or
advisory failures will hold work that could have merged and a genuinely blocking one will be
argued with.

**CODEOWNERS decides who is asked, which decides how long the change waits.** A change
touching a path with a distant owner has a different realistic turnaround from one that does
not, and splitting a change along ownership lines is often the cheapest way to make it
reviewable.

## What transfers to any hosted repository connector

- Establish which permission the promised end state actually needs, not just the opening move.
- Reply where the reviewer wrote, not where the platform makes it easiest.
- Never mark a conversation settled without saying how it was settled.
- Read the branch policy to learn which checks block; the check list will not tell you.
