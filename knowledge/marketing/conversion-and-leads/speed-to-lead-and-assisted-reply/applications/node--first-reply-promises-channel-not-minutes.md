---
layer: application
type: application
subject: speed-to-lead-and-assisted-reply
technique: first-reply-promises-channel-not-minutes
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The promise held; the greeting greeted whatever the caller passed

The Czech-first marketing workspace at commit `7bbd1cab` (2026-10-22; the version
witness is the Node 24 test runner) keeps its deterministic first reply as a pure
function of the lead and an optional brand. The function holds every rule this
technique is about. It tables the contact-back sentence by arrival channel (form, call,
chat, e-mail), every sentence ends in "as soon as we can" with no figure, the three
questions come back as their own list, and the sign-off falls back to "our team",
never a placeholder. The assisted reply reuses the same function as its keyless floor,
at confidence 0, with a risk that names it. A canned draft therefore cannot clear the
autonomy gate.

The seam was chosen to falsify step 1: "a pure function of the lead (name, channel,
message)". A pure function is only as honest as its inputs, so the check was every
caller that builds a lead for it. A caught outcome would mean the function's rules
held while a caller made the sent text wrong. That moves the rule from the function
to the field the function trusts.

## What was read

There are two callers besides the drill's sample rows. The live inbox maps a CRM
contact onto the lead row, and its `name` falls back from the person to the company,
then the e-mail, then the phone, then an empty string. That chain is right for a row
label: the row should show who it is. It is wrong for the greeting, which took the
first space-separated token of the label. The assisted reply's floor filled a missing
recipient with the word for "customer". A live CRM contact is never sent to the model
(the workspace's PII rule), so for those rows the deterministic draft is the text the
rep sends.

## The change and the measurement

The lead row gains a separate `greetingName`, which the CRM mapping sets to the
person's name alone. The draft greets with a first name only when the token is made
of letters. Otherwise the greeting is the bare "Dobrý den,". The floor no longer
invents a recipient. The arms below ran through the real draft function, the real CRM
mapping and the assisted tool's real normaliser, with the model mocked to return an
empty reply.

| | A (before) | B (after) |
| --- | --- | --- |
| nameless leads greeted by a label, a filler word or a stray comma (target) | 8 of 8 | 0 of 8 |
| leads with a given name greeted by that first name (floor) | 10 of 10 | 10 of 10 |
| replies naming a number of minutes, across 4 channels x named and nameless (floor) | 0 of 8 | 0 of 8 |

The eight nameless fixtures were an empty name, an e-mail and a phone in the name
field, and CRM rows carrying only a company, only an e-mail, only a phone, or nothing.
The last was the assisted floor with no recipient. On A they read "Dobrý den, ,",
"Dobrý den, info@...,", "Dobrý den, +420,", "Dobrý den, Elektro," and "Dobrý den,
zákazník,". The row label is unchanged: a company-only row still shows the company.

The rest of the floor held. tsc, eslint, the LLM gate's contract snapshots and the
context-decay check are green. The unit suite ran 4,388 of 4,392 with one red, an
embeddings test that needs cloud credentials and also fails on the base. Five new
tests fail on A and pass on B. The change is on branch `cur/frpcnm-greeting` and not
yet on the default branch, whose pre-push gate is red on that same base test.

## Not measured

The share of live CRM contacts that arrive without a person's name. Whether reps edit
the greeting before sending is not recorded either. The letters-only test cannot tell
a company's first word from a first name when that word is the only thing in the
name field, so the CRM mapping carries the person's name separately rather than
relying on the test. The assisted floor still signs as "our team" even when a brand is
configured, because the request's `brand` field carries the full derived brand
context rather than a name. Splitting the two was left for the owner.
