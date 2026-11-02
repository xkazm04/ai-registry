---
layer: technique
type: technique
subject: giveaway-legal-guardrails
technique: warn-versus-block-tiers
status: forged
laws: [refusal-is-a-state, unmeasured-is-not-pass]
shared_with: []
use_when: [deciding whether a giveaway risk should refuse the draw or only warn, designing the risk screen a streamer sees before sealing a draw, reviewing why streamers bypass a tool's giveaway checks]
---

# Warn versus block, by what the tool can know

Every guardrail finding lands in exactly one of three tiers, and the tier is decided by a
single question: **does the configuration alone prove the problem?** If yes, block. If the
problem depends on facts outside the configuration, hold and ask. If neither, pass silently.
Product design practice, not legal advice.

## The tiers

**Block.** The configuration itself is the defect: prize plus chance plus a paid route with
no equal free route; a free route whose best weight is lower than the paid route's; a draw
marked open to minors with an age-restricted prize; a prize draw with no rules text attached
or with the disclaimer switched off. The tool knows everything it needs, so it decides. A
block cannot be acknowledged away — the only way past is to change the configuration — and
it says which change would clear it. One exit is always offered beside the specific fix:
**make it a no-prize draw**, keeping every other setting, because a draw with nothing to give
away has nothing to clear and the streamer may only have wanted the pick.

A finding the streamer can clear by stating a fact — a filing made, places excluded — sits
between the two: it holds like a block, but its exit is a recorded confirmation of that fact
rather than a configuration change. Keep it a distinct kind, so that a general "accept the
risk" action can never clear it.

**Warn (hold until acknowledged).** The configuration is lawful in some places and not in
others, or at some values and not others, and the deciding fact is one the tool cannot
observe: where entrants live, the prize's real retail value, whether the streamer has made a
filing, whether a sponsor is involved, whether a contested gate counts as consideration
where the streamer is. The tool stops the draw and asks the streamer for the specific fact or
acknowledgement. A warning is not advice to proceed; it is the tool declining to decide a
question it cannot see.

**Pass.** No prize, or a prize with only free routes below every threshold. No screen, no
click, no banner. The absence of friction here is what lets the other two tiers be read.

## Why the line sits there

A tool that blocks on uncertainty is wrong half the time in both directions: it refuses
lawful giveaways for streamers whose jurisdiction allows them, and those streamers move the
giveaway out of the tool, to a manual pick with no record, no free-route check and no
disclaimer. A tool that warns on certainty — "this looks like a lottery, continue?" — has
handed the decision to the person least placed to make it in the moment, live, with chat
waiting. The tier follows the evidence: certain findings decide, uncertain ones ask.

An unknown is not a pass. When a value the check needs is missing — no prize value entered,
no eligible-places setting — the check reports *unknown* and holds as a warning; it does not
treat the missing value as zero or as "everywhere is fine". That is the subject's use of
[unmeasured-is-not-pass](../../../../_laws.md#unmeasured-is-not-pass).

## Present the screen

1. Run every check over the whole configuration in one pass, so the streamer sees all
   findings at once rather than fixing one and discovering the next.
2. Order blocks first, then warnings; each line names the rule, the configured value that
   triggered it, and the change or acknowledgement that clears it.
3. Persist the tier and the findings on the draw, so the record shows the draw ran with
   acknowledged warnings, not that it was clean. The refusal and the warnings are states of
   the draw, never a transient toast — [refusal-is-a-state](../../../../_laws.md#refusal-is-a-state).
4. Let the streamer choose a stricter posture (treat warnings as blocks) for a channel or a
   sponsor; never offer a looser one that turns blocks into warnings.

## Decision rules

- **When adding a check**, state which tier it belongs to and why the configuration does or
  does not prove the problem; a check without a tier rationale defaults to warn.
- **When streamers routinely acknowledge a warning without reading it**, the warning is too
  broad or fires too often; narrow it, do not escalate it to a block on that evidence.
- **When a block is overridden in practice by streamers leaving the tool**, check that the
  block is truly certain; if it is, keep it and improve the explanation and the fix path.
- **When the posture is changed**, record who changed it and when.

## When not to use it

Do not tier findings that are not about lawfulness or platform policy — a prize image
missing, a typo in the title. Those are ordinary validation and belong in the form, not in
the risk screen, where they would dilute it.
