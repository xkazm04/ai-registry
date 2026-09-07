# Gmail as the `email` connector

What was learned mapping this recipe onto Gmail specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Search sent and received before nudging, and search wider than the signer's address.** The
answer to a contract very often arrives from a colleague, from a shared legal alias, or on a
forwarded thread the tracker never saw. Searching only the exact recipient address finds
nothing and the nudge goes out to somebody who answered last Tuesday. Search the counterparty
domain over the period since the contract went out, not the address.

**An out of office reply is information, not a response.** It says the signer will not act for
a known number of days, which is exactly the input the pacing decision wants and exactly the
thing a naive reply check reads as engagement. Detect it, push the next nudge past the return
date, and do not count it as an answer.

**A hard bounce ends the chase; a soft one does not.** A permanently invalid address means the
contract has been waiting on somebody who was never going to receive it, which is a fact worth
writing back to the tracker and raising with the owner immediately rather than retrying. A
temporary failure is worth one retry and nothing more.

**Reply into the original thread, and keep the document out of the message.** The signing link
belongs to the platform; a fresh attachment invites the recipient to sign a copy nobody is
tracking, and that copy will be the one they believe is executed. Threading also keeps the
counterparty's own history in one place, which is what makes the second nudge able to say
something the first did not.

## What transfers to any email connector

- Look for the reply across the counterparty, not just the addressee. Answers arrive sideways.
- An automatic absence reply is scheduling information, never a response.
- A permanent bounce is a finding about the contract, not a delivery retry.
- Never attach a signable copy of a document the platform is tracking.
