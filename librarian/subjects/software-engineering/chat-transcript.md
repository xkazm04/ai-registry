---
subject: chat-transcript
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# chat-transcript

First note for the subject. Created by intake run `intake-chatterino2` (2.3.2) on 2026-09-03; the subject predates it.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

Technique pair from a desktop chat client that paints its own rows:
`immutable-model-cached-layout` (freeze the message at the transcript's door; every view
keeps its own layout cache keyed by width and flags; invalidation is a stamp, never a
mutation - the source's stamp is app-wide, recorded as a shortfall) and
`virtual-filtered-channel` (a filtered or merged view is itself a channel subscribing to
its sources with its own bounded buffer, so the surface renders only channels). Two
`cpp--` applications. Unapplied in the fleet: no fleet transcript paints its own rows;
return condition recorded. The golden path gained one linking sentence and the two slugs.

## Architecture review - 2026-10-31

First architecture review of the subject. All 17 documents read in full. The pinned
Chatterino tree was re-read for the load-bearing claims of both `cpp--` applications
(frozen bit and its comment, the mutable-flags confession, the proxy channel, the
one-sided replacement, the filter swap without rebuild) and they hold as written. The
grok-build repository is reachable but the applications pin no commit; two cited
mechanisms (the pin reserve, the single terminal finalizer) were confirmed at the
default branch, line ranges were not. The two React applications cite a private tree
and were not re-executed or re-read. The clarify items below are internal
inconsistencies or claims checked against WAI-ARIA 1.2 and CommonMark 0.31.2 this run.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/chat-transcript",
  "date": "2026-10-31",
  "baseline": "f0fb680d2",
  "digest": "sha256-b2:5b4e7d399a4d924e",
  "disposition": "clarify",
  "trigger": "Pending: no architecture-review record existed for the subject.",
  "intended_benefit": "A transcript that behaves as a live stream for the writer and a stable, auditable document for the reader in the same scroll container.",
  "failure_if_ignored": "Swapped live/settled elements, yanked viewports, vanished failed turns and approvals, unsanitized model markup, and per-token cost that grows with conversation length.",
  "boundary": "Owns the transcript as a rendered document and its composer; token flow, structure extraction, sanitization policy and the approval contract stay with streaming-output, structured-output, prompt-safety and hitl-approval.",
  "coverage": "All 17 documents (golden path, 9 techniques, 7 applications) read in full. Chatterino claims re-read at the pinned commit; grok-build mechanisms spot-checked at the unpinned default branch; React applications not re-checked (private tree).",
  "counterexamples": [
    "A transcript with one view, one width and a short list gains nothing from a per-view layout cache; the technique states its own collapse to memoised rows.",
    "Older history prepended at the top is not new information in the ARIA log sense; announcing it as arrivals floods a screen reader.",
    "A blank line between loose list items does not close the list, so a checkpoint at any blank line outside a fence freezes a list that is still open.",
    "A link reference definition may follow the link that uses it, so a frozen block can hold a reference the settled render resolves differently.",
    "A fixed two-frame wait passes when late-sizing rows settle after it; it is a timing proxy, not the layout observation gate-sees-target asks for."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/wai-aria-1.2/#log",
      "result": "Supports the log posture: 'Elements with the role log have an implicit aria-live value of polite' and 'new information is added only to the end of the log, not at arbitrary points' - which makes top-prepended history a non-arrival."
    },
    {
      "url": "https://www.w3.org/TR/wai-aria-1.2/#aria-busy",
      "result": "Supports turn-level announcement: when aria-busy is true 'assistive technologies MAY ignore changes ... and then process all changes made during the busy period as a single, atomic update when aria-busy becomes false'."
    },
    {
      "url": "https://spec.commonmark.org/0.31.2/",
      "result": "Refutes an unqualified blank-line checkpoint and identity freeze: 'Link reference definitions can come either before or after the links that use them' (4.7); 'A list item may contain blocks that are separated by more than one blank line' (5.2)."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/tree/fda51f0d3a4a5cd15f099b951b796e299d566e9e",
      "result": "Confirms VERSION 2.5.5, CMAKE_CXX_STANDARD 23, Qt5 warned unsupported; Message.hpp frozen-bit comment ('This is only used for plugins right now. This value is only ever set to true.') and mutable-flags confession; ChannelView proxy channel, messageReplaced forwarded only when the replacement passes, setFilters swapping the set without rebuilding."
    },
    {
      "url": "https://github.com/xai-org/grok-build",
      "result": "Repository reachable; pin_reserve.rs ('makes the page-flip pose ... a real scroll bottom') and turn_completion.rs (both rails 'converge on finalize_turn_from_terminal') confirmed at the default branch. No commit pin in the applications; line ranges unchecked."
    }
  ],
  "documents": {
    "chat-transcript.md": {
      "disposition": "clarify",
      "reason": "Closing technique list names 7 of the 9 frontmatter techniques (missing immutable-model-cached-layout, virtual-filtered-channel). Accessibility posture should state that history prepended at the top is not announced (ARIA log adds only at the end) and that a streaming turn can be held busy until it settles."
    },
    "techniques/turn-model.md": {
      "disposition": "clarify",
      "reason": "'the live/settled split in the parent standard' points at a section the golden path does not have; the split is streaming-output's 'live state and settled record' anatomy. Repoint the reference."
    },
    "techniques/inline-structured-rows.md": {
      "disposition": "keep",
      "reason": "Closed taxonomy with one dispatcher, loud unknown-row fallback, authority-derived resolution state and the pending-approval collapse exemption are coherent and correctly defer the approval contract to hitl-approval."
    },
    "techniques/progress-narration.md": {
      "disposition": "keep",
      "reason": "Honesty rules (derived from events, silence degrades, recomputable summary, predicate-carrying counts, failure keeps detail) are consistent with the laws it cites and with streaming-output's phase-derivation."
    },
    "techniques/transcript-scroll.md": {
      "disposition": "clarify",
      "reason": "'Two subtleties:' introduces four bullets (done-stamp, deadline, instant jump, loading posture). Arithmetic error; say four."
    },
    "techniques/turn-metadata.md": {
      "disposition": "keep",
      "reason": "Strip at settlement, inspectable recall, predicate-carrying figures, recomputation from the usage record and absence-not-zero are sound and internally consistent."
    },
    "techniques/markdown-and-code-rendering.md": {
      "disposition": "clarify",
      "reason": "The checkpoint 'a blank line outside any fence' is not a top-level boundary inside an open list or other container (CommonMark 5.2), and freezing link-reference identity at the checkpoint ignores definitions that follow their links (CommonMark 4.7). Qualify both; the rest of the door holds."
    },
    "techniques/composer-turn-queue.md": {
      "disposition": "keep",
      "reason": "Three intents, versioned identified queue rows, restart-as-draft with three named exits, closed combine eligibility and the single finalizer are consistent, and the restart rule is backed by the React application's four-arm A/B."
    },
    "techniques/immutable-model-cached-layout.md": {
      "disposition": "keep",
      "reason": "Freeze at the accept door, per-view keyed layout, two-level version invalidation and the layout-managed-toolkit inversion are coherent; the pinned Chatterino tree confirms the structure and its stated shortfalls."
    },
    "techniques/virtual-filtered-channel.md": {
      "disposition": "keep",
      "reason": "Derived channel filtered at ingest with its own horizon, rebuild-on-predicate-change and predicate-carrying counts are sound; the pinned source confirms the proxy-channel retention rationale verbatim."
    },
    "applications/cpp--immutable-model-cached-layout.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit: version, C++ standard, Qt requirement, MessagePtr handles, frozen-bit comment and mutable-flags confession match the citations quoted. Remaining line ranges not individually re-checked, so verified_on is unchanged."
    },
    "applications/cpp--virtual-filtered-channel.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit: the proxy-channel comment, filtering on messageAppended/messagesAddedAtStart, the one-sided messageReplaced forward and setFilters without rebuild all hold as the shortfall section states."
    },
    "applications/react--turn-model.md": {
      "disposition": "keep",
      "reason": "Honest side-by-side of an on-standard and a deviating transcript with the residual costs named; private tree not re-read this run."
    },
    "applications/react--transcript-scroll.md": {
      "disposition": "clarify",
      "reason": "Says the missing unseen count is 'a deviation noted in the parent standard's report', but the golden path carries no such report; the deviation is in this document's own deviation list. Also presents a two-requestAnimationFrame wait as gate-sees-target while the technique calls fixed timing a proxy; name it as a deviation."
    },
    "applications/react--composer-turn-queue.md": {
      "disposition": "keep",
      "reason": "Four-arm A/B with a positive control and a stated floor blind spot; the shipped B2 arm matches the technique's restart rule. Private tree not re-executed."
    },
    "applications/rust--composer-turn-queue.md": {
      "disposition": "keep",
      "reason": "The single terminal finalizer confirmed at the default branch; other mechanisms are plausible and consistent with the technique. No commit pin, so line ranges may drift; a pin is owed at the next touch, verified_on unchanged."
    },
    "applications/rust--transcript-scroll.md": {
      "disposition": "keep",
      "reason": "The pin reserve's stated purpose confirmed at the default branch, matching the technique's page-flip rule. Same unpinned caveat as the sibling application."
    }
  }
}
```

Phase B applied the six clarify items above in the subject's own voice; this record is against the new bytes. No verified_on date moved, and no verified_against was written.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/chat-transcript",
  "date": "2026-10-31",
  "baseline": "f0fb680d2",
  "digest": "sha256-b2:2a7c94fb3566b30c",
  "disposition": "keep",
  "trigger": "Pending: no architecture-review record existed for the subject.",
  "intended_benefit": "A transcript that behaves as a live stream for the writer and a stable, auditable document for the reader in the same scroll container.",
  "failure_if_ignored": "Swapped live/settled elements, yanked viewports, vanished failed turns and approvals, unsanitized model markup, and per-token cost that grows with conversation length.",
  "boundary": "Owns the transcript as a rendered document and its composer; token flow, structure extraction, sanitization policy and the approval contract stay with streaming-output, structured-output, prompt-safety and hitl-approval.",
  "coverage": "All 17 documents (golden path, 9 techniques, 7 applications) read in full. Chatterino claims re-read at the pinned commit; grok-build mechanisms spot-checked at the unpinned default branch; React applications not re-checked (private tree). Second record: all six clarify items applied in Phase B; no document left owing a change.",
  "counterexamples": [
    "A transcript with one view, one width and a short list gains nothing from a per-view layout cache; the technique states its own collapse to memoised rows.",
    "Older history prepended at the top is not new information in the ARIA log sense; announcing it as arrivals floods a screen reader.",
    "A blank line between loose list items does not close the list, so a checkpoint at any blank line outside a fence freezes a list that is still open.",
    "A link reference definition may follow the link that uses it, so a frozen block can hold a reference the settled render resolves differently.",
    "A fixed two-frame wait passes when late-sizing rows settle after it; it is a timing proxy, not the layout observation gate-sees-target asks for."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/wai-aria-1.2/#log",
      "result": "Supports the log posture: 'Elements with the role log have an implicit aria-live value of polite' and 'new information is added only to the end of the log, not at arbitrary points' - which makes top-prepended history a non-arrival."
    },
    {
      "url": "https://www.w3.org/TR/wai-aria-1.2/#aria-busy",
      "result": "Supports turn-level announcement: when aria-busy is true 'assistive technologies MAY ignore changes ... and then process all changes made during the busy period as a single, atomic update when aria-busy becomes false'."
    },
    {
      "url": "https://spec.commonmark.org/0.31.2/",
      "result": "Refutes an unqualified blank-line checkpoint and identity freeze: 'Link reference definitions can come either before or after the links that use them' (4.7); 'A list item may contain blocks that are separated by more than one blank line' (5.2)."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2/tree/fda51f0d3a4a5cd15f099b951b796e299d566e9e",
      "result": "Confirms VERSION 2.5.5, CMAKE_CXX_STANDARD 23, Qt5 warned unsupported; Message.hpp frozen-bit comment ('This is only used for plugins right now. This value is only ever set to true.') and mutable-flags confession; ChannelView proxy channel, messageReplaced forwarded only when the replacement passes, setFilters swapping the set without rebuilding."
    },
    {
      "url": "https://github.com/xai-org/grok-build",
      "result": "Repository reachable; pin_reserve.rs ('makes the page-flip pose ... a real scroll bottom') and turn_completion.rs (both rails 'converge on finalize_turn_from_terminal') confirmed at the default branch. No commit pin in the applications; line ranges unchecked."
    }
  ],
  "documents": {
    "chat-transcript.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: closing technique list gained immutable-model-cached-layout and virtual-filtered-channel; accessibility posture now holds a streaming turn busy until it settles and does not announce history loaded at the top (WAI-ARIA 1.2 log, aria-busy)."
    },
    "techniques/turn-model.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the 'live/settled split in the parent standard' reference now points at streaming-output's live state and settled record."
    },
    "techniques/inline-structured-rows.md": {
      "disposition": "keep",
      "reason": "Closed taxonomy with one dispatcher, loud unknown-row fallback, authority-derived resolution state and the pending-approval collapse exemption are coherent and correctly defer the approval contract to hitl-approval."
    },
    "techniques/progress-narration.md": {
      "disposition": "keep",
      "reason": "Honesty rules (derived from events, silence degrades, recomputable summary, predicate-carrying counts, failure keeps detail) are consistent with the laws it cites and with streaming-output's phase-derivation."
    },
    "techniques/transcript-scroll.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Two subtleties' -> 'Four subtleties', matching the four bullets."
    },
    "techniques/turn-metadata.md": {
      "disposition": "keep",
      "reason": "Strip at settlement, inspectable recall, predicate-carrying figures, recomputation from the usage record and absence-not-zero are sound and internally consistent."
    },
    "techniques/markdown-and-code-rendering.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: checkpoint boundary excludes blank lines inside an open list or container (CommonMark 5.2); a reference definition arriving after its link is corrected by the final settled parse (CommonMark 4.7)."
    },
    "techniques/composer-turn-queue.md": {
      "disposition": "keep",
      "reason": "Three intents, versioned identified queue rows, restart-as-draft with three named exits, closed combine eligibility and the single finalizer are consistent, and the restart rule is backed by the React application's four-arm A/B."
    },
    "techniques/immutable-model-cached-layout.md": {
      "disposition": "keep",
      "reason": "Freeze at the accept door, per-view keyed layout, two-level version invalidation and the layout-managed-toolkit inversion are coherent; the pinned Chatterino tree confirms the structure and its stated shortfalls."
    },
    "techniques/virtual-filtered-channel.md": {
      "disposition": "keep",
      "reason": "Derived channel filtered at ingest with its own horizon, rebuild-on-predicate-change and predicate-carrying counts are sound; the pinned source confirms the proxy-channel retention rationale verbatim."
    },
    "applications/cpp--immutable-model-cached-layout.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit: version, C++ standard, Qt requirement, MessagePtr handles, frozen-bit comment and mutable-flags confession match the citations quoted. Remaining line ranges not individually re-checked, so verified_on is unchanged."
    },
    "applications/cpp--virtual-filtered-channel.md": {
      "disposition": "keep",
      "reason": "Re-read at the pinned commit: the proxy-channel comment, filtering on messageAppended/messagesAddedAtStart, the one-sided messageReplaced forward and setFilters without rebuild all hold as the shortfall section states."
    },
    "applications/react--turn-model.md": {
      "disposition": "keep",
      "reason": "Honest side-by-side of an on-standard and a deviating transcript with the residual costs named; private tree not re-read this run."
    },
    "applications/react--transcript-scroll.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the phantom 'parent standard's report' reference now points at the document's own deviations, which gained the two-frame wait as a fixed timing proxy. Private tree not re-read; verified_on unchanged."
    },
    "applications/react--composer-turn-queue.md": {
      "disposition": "keep",
      "reason": "Four-arm A/B with a positive control and a stated floor blind spot; the shipped B2 arm matches the technique's restart rule. Private tree not re-executed."
    },
    "applications/rust--composer-turn-queue.md": {
      "disposition": "keep",
      "reason": "The single terminal finalizer confirmed at the default branch; other mechanisms are plausible and consistent with the technique. No commit pin, so line ranges may drift; a pin is owed at the next touch, verified_on unchanged."
    },
    "applications/rust--transcript-scroll.md": {
      "disposition": "keep",
      "reason": "The pin reserve's stated purpose confirmed at the default branch, matching the technique's page-flip rule. Same unpinned caveat as the sibling application."
    }
  }
}
```
