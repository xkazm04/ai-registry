---
source: thirty-million-writer-ai-slop
kind: first-party practitioner account (interview video)
url: https://www.youtube.com/watch?v=YuOSyRj3sXg
title: "$30M Writer: Never write AI slop again"
author: Greg Isenberg (host), with Nicolas Cole (guest)
words: 11490
extracted: 12
accepted: 1
declined: 0
already_covered: 4
untriaged: 3
leads: 3
dispatched: 0
applied: 1
shipped: 1
run_id: intake-yuosyrj3sxg
siblings: 0
---

# The voice is in the smallest edit

A ghostwriter who has written for a few hundred founders explains his method
for writing with a model: sort what you write into commodity, personality and
original content; build a library of your own "approved language" and let the
model repeat and recombine it rather than write fresh; decide which side of
every contested commodity claim you are on, because that is the choice a model
otherwise makes for you. The host is a content creator. Both run products the
episode promotes (a writing SaaS, a cohort course). Their promotion is noise
for this run; the ghostwriter's own practice is first-party.

**Class and expected yield, said before the table:** first-party practitioner
account in interview form. Reliable for what he did (n=1, a decade of
ghostwriting), not for what works in general. Expected: mostly catches against
the marketing bundle's content-production category, one or two decision-rule
findings at most, fetch budget unspent. That held: 0 of 3 fetches, 4 catches,
1 landing.

**Board:** 0 siblings live at claim. The shared checkout carried uncommitted
work from sessions not on the board (skills/contest, skills/leonardo,
catalog.json, this skill's SCORECARD.md), so the generated artifacts were
built in a detached worktree of HEAD and main was fast-forwarded under the
commit lock.

## The landing: a size threshold filtered out the voice

`[00:55:30]` "I didn't rewrite the piece. All I did was go back in and add in
like two or three sentences that just said, according to the New York
Times... I changed 1% of it... he was like elated." And `[00:56:22]` "All you
would have to do is just go, I want to trade that one adjective for a
different adjective. And all of a sudden the sentence sounds like me."

The corpus said the opposite, in
`marketing/content-production/brand-voice-capture/rejections-and-edits-become-constraints`:
a human's pre-send edit banks as a style fact above a quarter of the words,
"below it the edit is a typo fix". The source's anecdote is precisely an edit
the rule discards. Corroboration: a code read in a tree (systedo-case carried
the rule verbatim; the new application cites it), and a corpus-internal
convergence: the narration-voice
subject in the media bundle already learns a profile from every
accepted-versus-generated delta ("if the creator consistently cut hedges the
tool inserted"), with no size floor.

Paired A/B in systedo-case, both arms imported from the tree, 22 fixtures on a
46-word Czech and a 51-word English reply: voice corrections banked **0/11 ->
10/11**, typo/cosmetic/price edits **0/9 -> 0/9**, rewrites **2/2 -> 2/2**,
test:unit 4147/4144/0 fail, tsc clean. Shipped as systedo-case `e1ec5d46`,
not pushed. The technique now judges an edit by kind (cosmetic / typo / fact /
voice), keeps the size threshold only as the rewrite path, banks small edits as
their changed spans, and names its blind spot: a register change spelled like a
typo (Czech colloquial elision) classifies as a typo. Registry commits
`9ff87912` (content) and `5af4e4df` (generated).

## Triage

Upper-layer rows scored under Phase 5; leads admitted under the corroboration
table.

| # | Candidate | Anchor | Prior art | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | A small edit carries the voice; magnitude cannot tell it from a typo | [00:55:30], [00:56:22] | brand-voice-capture/rejections-and-edits-become-constraints | real gap | 4/2/2 | **accepted** (corrects-claim; inverts +2, convergence +1, refutes +1; rewrite +2) |
| 2 | Keep a stance ledger: which contested commodity claims the author holds or rejects | [00:22:16]-[00:24:21] | brand-voice-capture/voice-profile-dimensions (no stance field) | partial | 2/1/2 | untriaged |
| 3 | A validated phrasing is reused verbatim, not paraphrased | [00:26:04]-[00:26:57] | brand-voice-capture/voice-profile-dimensions ("examples are new sentences"); the media bundle's signature bookends | partial | 1/1/2 | untriaged |
| 4 | Evidence habit (cites sources vs opines) is a voice dimension | [00:55:30] | brand-voice-capture/voice-profile-dimensions | partial | 1/2/1 | untriaged |
| 5 | Voice = word choice + sentence length and structure | [00:53:48]-[00:54:39] | brand-voice-capture/voice-profile-dimensions | likely catch | - | already covered |
| 6 | Brand accounts repeat the founder's commodity ideas, not personality facts | [00:40:35]-[00:41:26] | brand-voice-capture/editorial-voice-vs-personal-voice-split | likely catch | - | already covered |
| 7 | Timely vs timeless: a dated word ("in 2026") caps reuse | [00:49:58]-[00:52:07] | on-page-and-metadata-craft/ctr-lifts-as-tie-breakers-not-a-stack ("the lift decays into a penalty") | likely catch | - | already covered |
| 8 | Repurpose one deep library into many variants | [01:03:38] | channel-native-social-and-repurposing/retell-not-copy-with-source-digest | likely catch | - | already covered |
| 9 | Personality content outperforms more credible commodity content | [00:31:11]-[00:31:37] | - | thin | - | lead |
| 10 | One paid deep writer feeds a company's whole content supply chain | [01:02:46]-[01:04:30] | - | thin | - | lead |
| 11 | A product's moat is the methodology it encodes | [00:03:28]-[00:05:12] | positioning-and-proof | thin | - | lead |
| 12 | Five posts a day is the baseline | [01:01:29] | channel-native-social-and-repurposing/cadence-caps-at-one-chokepoint | thin | - | nothing (host's opinion, no measurement) |

Admission `auto=1/3/0`, `fp=0`. The promoting question for row 2 was run (one
read of `voice-profile-dimensions` and `distil-only-what-samples-show-else-ask`):
neither field set nor the gap questions ever ask which side of a contested
claim the business takes. That confirms the gap, but it does not remove the
contested home (profile vs positioning), so the row stays below threshold.

## Untriaged (nobody verified these; not declined)

- **Stance ledger.** `[00:23:31]` "the reason AI wrote that is because AI
  doesn't know which perspective you agree with." The corpus's own argument
  against the tone word - a model given no specification produces the median -
  extends to stances, and no profile field or gap question carries one. Home
  contested between `brand-voice-capture` and
  `positioning-and-pricing-transparency`. Promotes on: a paired generation on a
  contested topic with and without a stance line, counting which side the model
  takes; the systedo-case distiller could host it.
- **Signature lines.** `[00:26:32]` "I used that grouping of words hundreds of
  times." The marketing profile's rule "examples are new sentences" is right
  for customer-reply samples (they leak names). It inverts for an owner's
  validated signature line, which the media bundle already stores as literal
  strings, but only for fixed-position bookends. The discriminator to write:
  *whose words, and were they chosen as a signature?* Promotes on a second
  source, or a fleet surface that repeats an owner line.
- **Evidence habit as a dimension.** The 1% anecdote's content: this client's
  voice was "a lot of studies and a lot of facts". Needs a second source that
  it is a dimension and not one client's quirk.

## Leads

- **Personality over credibility** (row 9). Return when a measured comparison
  exists: a first-person-detail variant against a credentialled-only variant,
  same channel, same window.
- **One deep writer as the supply chain's input** (row 10). Return when a fleet
  project runs a long-form library through a repurposing pipeline and can count
  what each source piece fed.
- **Methodology as moat** (row 11). Return on a second independent source.

## Lessons for the method

- A first-party anecdote whose payoff is a *tiny* change with a large effect is
  a probe for every size threshold the corpus states. The corpus's
  magnitude-filters on human input declare that small means noise.
