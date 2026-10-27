---
layer: technique
type: technique
subject: prompt-safety
technique: trusted-author-verdict-channel
status: forged
laws: [claimant-does-not-adjudicate, unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [a reviewer agent posts its verdict into a thread other people and agents also write, a gate reads a model's verdict back out of a shared text surface, the reviewed change can edit text near the verdict]
---

# Trusted-author verdict channel

A reviewer agent reads hostile text for a living. It reviews a change written by
another agent, it quotes the suspicious parts, and it posts its verdict where the
platform lets agents write: a comment thread, a ticket, a review note. A gate
then reads that verdict back and acts on it. The surface the verdict lives on
is shared. The author of the change, the people discussing it, other agents
and the reviewer all write there. The naive consumer searches it for something
shaped like a verdict, and finds the one the attacker wrote.

This technique owns both ends of that channel: how the reviewer writes a verdict
so a consumer can find exactly one, and how the consumer authenticates it.
The rule underneath is
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate):
the party being judged writes nothing the verdict is read from.

## Reading: the author is the authentication

**Read verdicts only from text the platform says a known account wrote.** The
author field the platform records is the credential. A signature, a header or a
magic string inside the text is not, because anyone can type it. The allowlist
names the reviewer's own identities and nothing else.

**Give each agent its own identity.** If the reviewer and the agent whose work
it reviews post as one shared bot account, the reviewed agent can forge the
reviewer's verdict. That agent reads untrusted text all day, so an injection
only has to make it post a passing block. One account per agent makes every
channel attributable and keeps the allowlist a single name long.

**Never read a verdict from an editable field.** A description, a title or a
summary that contributors can rewrite carries no verdict, whoever wrote its
first version. The change's own description is the claimant's channel. It is
shown to people and read by nothing that decides.

**Bind the verdict to the revision it judged.** The verdict names the exact
revision it reviewed. The consumer skips a verdict made for any other revision
as stale and keeps looking, newest first. A pass for yesterday's head must not
let today's push through.

**One note, one verdict.** A trusted note that carries two verdict blocks is
ambiguous, and the consumer takes neither. The reviewer quotes hostile text,
and a quoted block inside the reviewer's own note sits in the trusted author's
voice. Picking the first or the last block lets the attacker choose which one
that is. The reviewer is also told never to put another fenced block in the
note, so a second block is a defect on either side.

**Spell every non-answer differently**
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). "No
trusted verdict", "a trusted verdict that is ambiguous or fails its schema" and
"a verdict for another revision" are separate outcomes from "a verdict was
found". None of them reads as a pass. A verdict that fails its schema is
inconclusive, and for a blocking reviewer, inconclusive blocks.

**Read the whole thread, and fail loudly at the cap.** A consumer that reads the
newest page and stops will one day miss a verdict that slid off the page and
report "none". Page until found. A thread past the reader's cap is an error, not
an empty result.

**Parse hostile text conservatively.** Find blocks with linear scans rather
than backtracking patterns over attacker-sized input. A block that does not
parse is ignored, never repaired into a verdict.

## Writing: the reviewer's side of the contract

The prompt fences every tool result and the trigger payload as data, under the
subject's usual fencing. Four clauses are specific to a verdict channel.

**The final answer is one token from a closed set.** The verdict body goes into
the channel, and the run's own control flow reads only a word such as "posted"
or "error", matched by the router. Free text in the control position is a
second, unauthenticated verdict channel.

**Name the fields taken from the trigger.** The trigger payload is untrusted,
so the prompt says which one or two facts the reviewer may take from it (an
identifier, a number) and ignores the rest. Cover every shape the trigger can
take. A prompt written for one event shape answers "nothing to do" when a person
mentions the agent in a comment. A prompt that falls back to a default target
when the fact is missing reviews the wrong object. Take the fact from the
person's text, and refuse when it is absent.

**Instruction-shaped text is a finding, not an instruction.** Text that
addresses the reviewer or asks it to approve, skip or change format is reported
under its own rule. This is
[payoff-removal](./payoff-removal.md)'s report channel, and it is the best
detection signal the run produces.

**Every finding quotes the change verbatim, and a model-free check verifies the
quote.** A reviewer that may cite only text that exists cannot invent a
finding, or a clean bill, about code that is not there. How quotes are matched
and graded is
[structured-output's graded-span-grounding](../../structured-output/techniques/graded-span-grounding.md).
For this channel, two things matter. A finding whose quote is not found is
discarded and counted against the reviewer. And the check must verify **the
predicate the prompt states**, not just that the quote exists. If the prompt
says "quote added or removed lines" and the check accepts an unchanged context
line, the rule rests on the model's obedience. Either the checker reports
where the quote sits and enforces it, or the gap is recorded as unenforced.

## The consequence belongs to the consumer

A reviewer that can block should not be able to approve, merge or label. Its
toolset simply lacks those tools. The model-free consumer reads the
authenticated verdict and applies the consequence. An injection that fully
captures the reviewer then wins a wrong note, and nothing acts on that note
until the gate has authenticated it, bound it to a revision and validated it
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Coverage: the reviewer must run on what it exists for

A verdict channel nobody writes to is a quiet hole. Platforms that start agents
on events often refuse events caused by non-human accounts. Then a reviewer
triggered when a change is opened never runs on a change another agent opened,
which is the class it exists to review. Dispatch the reviewer explicitly, once
per revision, and treat "no verdict for the current head" as the not-yet state.
It is never a pass. Where the platform keeps agent session logs private, the
authenticated note is also the evidence an outside reviewer can see, which is
one more reason the verdict lives there.

## When not to use it

When the reviewer returns its verdict over a private, typed channel the
consumer controls (a direct structured response, a queue only the reviewer can
write), there is no shared surface to authenticate, and this technique reduces
to schema validation. Use it whenever the verdict crosses a surface that anyone
else can write to.
