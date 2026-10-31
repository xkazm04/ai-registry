---
subject: accessibility
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# accessibility

First touch: 2026-08-28, a `/deepen` loop round on the software-engineering
domain. Selected as round 1 because it topped the librarian worklist on two
independent signals: the highest consumer-deviation count in the fleet (7,
against 4 consults) and single-stack (`react`) with no librarian sweep ever.

## State

6 -> 7 techniques, 2 applications (both `react`, both from the same tree,
`verified_on: 2026-08-18`). Single-stack debt NOT retired — see the leads.

Landed:

- `assistive-tech-divergence` (new technique) — the delivery layer is a grid
  of independently built reader/browser pairs that disagree about the same
  markup, because the standards specify what a role or a live region *means*
  far more precisely than the timing and eventing an assistive technology must
  observe to notice one. Holds four things the subject had nowhere: the written
  pairing list (untested is not working), the design preference for mechanisms
  no implementation has to interpret, the failure ranking that tie-breaks a
  genuine disagreement (silence worst, wrong announcement next, verbosity is
  the price you pay), and the rule that a pairing workaround is load-bearing
  code that must carry its pairing and its date or a cleanup pass deletes it.
- `a11y-verification` amendment — the automated-audit detection ceiling.
- `accessibility.md` — matching correction plus a new golden-path section for
  the technique.
- `live-region-architecture` amendment — its existing "on most platform/reader
  combinations" hedge now says why the qualifier is load-bearing and points at
  the new technique.

## The correction worth remembering

The subject asserted, in two places, that rule engines "detect roughly a third
of the defects a human audit finds" — a bare number with no denominator, stated
inside the very paragraph that invokes `count-carries-predicate`. The
circulating figures disagree by more than a factor of two and all of them are
honest, because they count different populations:

| Figure | Denominator |
| --- | --- |
| ~a third (the classic number) | WCAG success criteria a rule engine can decide at all |
| 57.4% | defect *volume* in real first-pass audits — one vendor's study over 2,000+ audits, 13,000+ pages, ~300,000 issues, which explicitly *shifted* the denominator away from criteria |
| ~80% | the above plus items merely flagged for human review (vendor marketing) |

Volume runs higher than criteria because the mechanically detectable failures
are also by far the most numerous. The vendor's own channels conflate the two —
its engine repository states "57% of WCAG issues", read by at least one filed
issue as a criteria figure. The amendment does not swap one number for another:
it makes the denominator the doctrine, and names which denominator answers which
question (criteria coverage bounds what the gate can structurally never see;
volume estimates how much cheap remediation is on the table).

## Counter-evidence that confirmed (no edit — first-class results)

- **`live-region-architecture` platform semantics #3** — "an unchanged string is
  not a mutation" — holds, and the corpus's keyed-remount defeat is *stronger*
  than the workaround the field publishes. The common fix (clear the region,
  write again after a tick) is documented failing on one major pairing; forcing
  a fresh node makes the mutation structural and unambiguous to all of them.
  The corpus reached the better mechanism and did not know it was the better one.
- **The "decaying claim" doctrine** in the golden path is measured, not
  rhetorical: the February 2026 pass over the top million home pages found 95.9%
  with detectable WCAG 2 failures (up from 94.8%), 56.1 detected errors per page
  (up 10.1% year over year), against a 22.5% one-year rise in elements per page.
  Drift is winning at population scale. Left out of the corpus deliberately — a
  survey-of-the-web statistic is not craft, and the skill's rule is that measured
  numbers live with their n in applications, never laundered upstairs.

## Open leads (banked, with return conditions)

- **Single-stack debt stands.** Both applications are `react` from one tree.
  The natural second stack for this subject is not another web framework but a
  *terminal or native* surface, where the same contracts (name, keyboard path,
  announcement) exist with none of the browser's free machinery — the corpus
  has precedent for that lane paying well. Return condition: an external-
  reconcile wave with a non-web accessible-UI tree pinned.
- **Route-change focus and announcement is genuinely absent** from the subject
  (grep: zero hits for route change, navigation announcement, page title
  management). It is the one app-wide keyboard/announcement contract with no
  home here, and its mechanics may belong to a shell/navigation neighbour rather
  than to this subject. Not minted: the technique budget for the round was spent
  on divergence, which had lane convergence behind it and this does not yet.
  Return condition: any run that opens `shell-and-navigation`, which can settle
  the boundary from both sides.
- **The published standards carry no version anywhere in the subject.** As of
  2026-08-28 the operative recommendation is WCAG 2.2 (October 2023); WCAG 3.0
  is a working draft (a March 2026 draft renamed its outcomes to 174
  "requirements") with a candidate recommendation targeted no earlier than Q4
  2027. The golden path's undated "the published standards are the floor" is
  therefore *correct as written* and needs no clock — deliberately left alone.
  Return condition: WCAG 3.0 reaching candidate recommendation, which would
  make the conformance-model change real rather than prospective.

## Declines

- **Accessibility statements / conformance reports as a required artifact.**
  Real, and in some jurisdictions now legally required. Declined for this
  subject: the golden path opens by rejecting the compliance framing as one of
  two framings that fail reliably, and that is a considered position rather than
  an oversight. A legal-obligations topic is a different subject, not a section
  here. Do not re-propose as a technique of `accessibility`.
- **Naming reader and browser products in the new technique.** The divergence
  evidence is entirely concrete — specific pairings disagreeing on specific
  grades of pre-populated live region — and none of it could go upstairs. The
  `software` purity denylist does not currently list assistive-technology
  product names, but the corpus has zero of them in upper layers today and the
  denylist is documented as a floor rather than the whole rule. Written
  structurally instead; the concrete pairings live in this note.

## 2026-09-01 - external reconcile, single-stack debt CLOSED ([[2026-09-01-1]])

The open lead's return condition arrived: a non-web accessible-UI tree, pinned.
Counterpart `AccessKit/accesskit` @ `00b517c`, crate 0.25.0 (class A, rust), the
cross-platform accessibility infrastructure with a schema, a consumer tree and five
platform adapters. Landed `applications/rust--name-and-description-wiring.md` (130
lines) on the technique that had zero applications. Fate **confirmed** for the contract,
with the hint's specifics split: schema and adapters as predicted; the consumer's name
computation runs the top two precedence tiers *backwards* from the browser algorithm
(direct label wins, relation only when absent; content-as-name is a per-role opt-in for
eight roles); and `described_by` is declared as the describing relation and resolved by
nobody - grep over consumer and all adapters is empty, and one mobile adapter has no
description channel at all. Executed: 206/206 consumer tests; a scratch harness proving
direct-label-beats-relation and description-relation-never-resolved.

Technique-edit candidates, banked at one sighting: the precedence paragraph is the
*browser's* algorithm, not the domain's; the "classic defect" direction is
platform-dependent (name the failure - two sources, one silently wins - without fixing
which); the description chain is a web mechanism, the invariant is what travels.

Proposals placed in the run note: `assistive-tech-divergence` (zero applications) has a
source-measured candidate on this same pin - five adapters diverging on the description
channel and on live-region delivery; `live-region-architecture` gains "a nameless live
region is silent" (every announcing adapter refuses without a computed name; `live()`
inherits from the parent).

Leads: `role_description`/`state_description` (return: a wave binding
`primitive-level-a11y` here); the text-run model has no home in this subject.

## Architecture review - 2026-10-31

First architecture-review record. Phase A judged every document against the
pre-edit bytes (first record). Four technique clarifications were confirmed
against primary sources opened this run and applied minimally; the second record
is against the edited bytes. One prior note inference is narrowed: the claim that
a pre-populated region "announces nothing on most pairings" stands, but the alert
grade is the documented exception rather than an unpatterned case. The react
applications' private trees were not reopened, so they stay `reverify` and no
verification date moved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/accessibility",
  "date": "2026-10-31",
  "baseline": "85a365702",
  "coverage": "All 15 current documents read in full (golden path, 8 techniques, 6 applications). Primary sources checked for the precedence chain, audit-coverage denominators, inert/visibility semantics, live-region pre-population, menu Tab behaviour, WCAG floors and the AccessKit label path; react applications' private trees not reopened.",
  "counterexamples": [
    "A subtree marked not visible closes both accessibility channels yet still holds its layout space; only taking it out of the layout frees the space.",
    "An alert-grade region that arrives already populated is voiced by most pairings, so 'pre-populated is silent' is a tendency with a named exception, not a rule.",
    "A native accessibility schema can rank a direct label above the labelling relation, inverting the browser precedence the name technique outlines.",
    "Tab out of a popup menu, per the published pattern, leaves the menu without returning to the trigger; Escape is what returns.",
    "Removing a live region can be the accessibility fix (an ambient tally) and its diff looks like a regression."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/accname-1.2/",
      "result": "Step 2 order read: 2B LabelledBy, 2C Embedded Control, 2D AriaLabel, 2E Host Language Label, 2F Name From Content, 2I Tooltip ('used only if nothing else ... has provided results'). Supports the technique's outline as the browser algorithm."
    },
    {
      "url": "https://www.deque.com/automated-accessibility-testing-coverage/",
      "result": "'57.38% ... Of total issues during automated tests', over 2,000+ audits, 13,000+ pages/page states, nearly 300,000 issues; 'automated issues for 16 out of the 50 Success Criteria under WCAG 2.1 Level AA'. Confirms both denominators in a11y-verification (volume over half; criteria roughly a third)."
    },
    {
      "url": "https://html.spec.whatwg.org/multipage/interaction.html",
      "result": "Inert: hit-testing as pointer-events none, selection as user-select none, non-editable, 'should ignore the node for the purposes of find-in-page'; 'Inert nodes generally cannot be focused, and user agents do not expose the inert nodes to accessibility APIs'. Confirms the inertness ladder."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/visibility",
      "result": "visibility hidden: 'still affects layout as normal', cannot receive focus, removed from the accessibility tree. Refutes 'nothing occupies space' for the not-visible hide; both-channels claim holds."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions",
      "result": "'Establish the live region before updating its content ... Behavior can vary across browser and assistive technology combinations'; role alert content 'in most cases' announced even when present initially. Supports semantics #1 and its divergence hedge; names the alert exception."
    },
    {
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/menubar/",
      "result": "Tab/Shift+Tab 'move focus out of the menu or menubar, and close all menus'; Escape closes and returns focus to the opener. Refutes the technique's 'Tab hands focus back to the trigger' as the published pattern; the owed-handoff point stands."
    },
    {
      "url": "https://www.w3.org/TR/WCAG22/",
      "result": "1.4.3 4.5:1 text, 1.4.11 3:1 non-text, 1.4.4 resize to 200 percent. Supports preference-respect's AA floors and 200% text scale."
    },
    {
      "url": "https://github.com/AccessKit/accesskit/blob/00b517c24b037a7d20bcbf9b28e75cd622fe7fa3/accesskit_consumer/src/node.rs",
      "result": "Re-read write_label_direct / write_label / description(): direct label first, labelled_by only when absent; description() returns the plain property. Confirms the rust application's central findings; other anchors and the executed harness not re-run."
    },
    {
      "source": "Private consumer trees behind the react applications",
      "result": "Not reopened; dated readings retained, verified_on unchanged."
    }
  ],
  "digest": "sha256-b2:d839f62eac6007da",
  "disposition": "clarify",
  "documents": {
    "accessibility.md": {
      "disposition": "keep",
      "reason": "Load-bearing claims (primitives multiply, keyboard equivalence, two-channel hiding, engineered announcements, computed names, preference coverage, decaying claim, pairing grid) hold against the sources read; hedges match the techniques. Trigger: any app-wide accessibility decision; benefit: fixes land in primitives and gates; failure if ignored: N-call-site retrofit and silent regressions; boundary: neighbour subjects own overlay containment, field wiring, delivery policy, motion and token mechanics."
    },
    "techniques/primitive-level-a11y.md": {
      "disposition": "keep",
      "reason": "Native-first and the primitive contract are consistent with the platform semantics read; no unstable claim."
    },
    "techniques/keyboard-navigation-models.md": {
      "disposition": "clarify",
      "reason": "Transient-composite exit says Tab hands focus back to the trigger; the published menu pattern has Tab move focus out of the menu and Escape return to the opener. Restate the owed handoff as a named target outside the popup."
    },
    "techniques/hidden-but-mounted-inertness.md": {
      "disposition": "clarify",
      "reason": "'Taking out of layout, or marking it not visible ... nothing occupies space' is wrong for the not-visible hide, which keeps its layout space (MDN visibility). Both-channels claim and inert ladder confirmed by the HTML standard."
    },
    "techniques/live-region-architecture.md": {
      "disposition": "clarify",
      "reason": "Semantics #1 holds with its divergence hedge; name the documented alert-grade exception (MDN: alert content announced 'in most cases' even when present initially) so the hedge has its one known pattern."
    },
    "techniques/name-and-description-wiring.md": {
      "disposition": "clarify",
      "reason": "Precedence outline matches AccName 1.2 step 2 but is stated as the domain's law; the subject's own rust application (re-read this run) shows a native schema ranking the top two the other way. Scope the outline to the browser algorithm. Banked candidate 'classic defect direction is platform-dependent' left to a later edit."
    },
    "techniques/preference-respect.md": {
      "disposition": "keep",
      "reason": "AA floors and the 200% text-scale figure match WCAG 2.2 (1.4.3, 1.4.11, 1.4.4); the one-signal contract is internally consistent with its react application."
    },
    "techniques/a11y-verification.md": {
      "disposition": "reverify",
      "reason": "Denominator doctrine confirmed (Deque: 57.38% by volume; 16 of 50 AA criteria). The synthetic-evaluator paragraph cites unnamed systems and an absent human-to-human agreement figure; that source was not identified or reopened."
    },
    "techniques/assistive-tech-divergence.md": {
      "disposition": "keep",
      "reason": "Structural, product-free claims; supported by MDN's 'Behavior can vary across browser and assistive technology combinations' and the alert exception. Failure ranking is a stated judgement, not an empirical claim."
    },
    "applications/react--name-and-description-wiring.md": {
      "disposition": "reverify",
      "reason": "Private tree at a pinned commit not reopened; findings are internally consistent with the technique (absorbed error name, unchanged-string silence). verified_on unchanged."
    },
    "applications/react--hidden-but-mounted-inertness.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; the mechanisms cited agree with the HTML inert semantics read this run. verified_on unchanged."
    },
    "applications/rust--name-and-description-wiring.md": {
      "disposition": "keep",
      "reason": "Central claim re-read at the pinned commit (direct label before labelled_by; description() ignores described_by). Remaining anchors and the executed harness not re-run; verified_on unchanged."
    },
    "applications/react--preference-respect.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; dated reading retained."
    },
    "applications/react--keyboard-navigation-models.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; adoption counts are dated measurements."
    },
    "applications/react--live-region-architecture.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; provider mechanics agree with the technique."
    }
  }
}
```

Applied the four confirmed clarifications; re-recorded against the new digest.
Still owed: the synthetic-evaluator source in a11y-verification, and the private
consumer trees behind the five react applications.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/accessibility",
  "date": "2026-10-31",
  "baseline": "85a365702",
  "coverage": "All 15 current documents read in full (golden path, 8 techniques, 6 applications). Primary sources checked for the precedence chain, audit-coverage denominators, inert/visibility semantics, live-region pre-population, menu Tab behaviour, WCAG floors and the AccessKit label path; react applications' private trees not reopened.",
  "counterexamples": [
    "A subtree marked not visible closes both accessibility channels yet still holds its layout space; only taking it out of the layout frees the space.",
    "An alert-grade region that arrives already populated is voiced by most pairings, so 'pre-populated is silent' is a tendency with a named exception, not a rule.",
    "A native accessibility schema can rank a direct label above the labelling relation, inverting the browser precedence the name technique outlines.",
    "Tab out of a popup menu, per the published pattern, leaves the menu without returning to the trigger; Escape is what returns.",
    "Removing a live region can be the accessibility fix (an ambient tally) and its diff looks like a regression."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/accname-1.2/",
      "result": "Step 2 order read: 2B LabelledBy, 2C Embedded Control, 2D AriaLabel, 2E Host Language Label, 2F Name From Content, 2I Tooltip ('used only if nothing else ... has provided results'). Supports the technique's outline as the browser algorithm."
    },
    {
      "url": "https://www.deque.com/automated-accessibility-testing-coverage/",
      "result": "'57.38% ... Of total issues during automated tests', over 2,000+ audits, 13,000+ pages/page states, nearly 300,000 issues; 'automated issues for 16 out of the 50 Success Criteria under WCAG 2.1 Level AA'. Confirms both denominators in a11y-verification (volume over half; criteria roughly a third)."
    },
    {
      "url": "https://html.spec.whatwg.org/multipage/interaction.html",
      "result": "Inert: hit-testing as pointer-events none, selection as user-select none, non-editable, 'should ignore the node for the purposes of find-in-page'; 'Inert nodes generally cannot be focused, and user agents do not expose the inert nodes to accessibility APIs'. Confirms the inertness ladder."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/visibility",
      "result": "visibility hidden: 'still affects layout as normal', cannot receive focus, removed from the accessibility tree. Refutes 'nothing occupies space' for the not-visible hide; both-channels claim holds."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions",
      "result": "'Establish the live region before updating its content ... Behavior can vary across browser and assistive technology combinations'; role alert content 'in most cases' announced even when present initially. Supports semantics #1 and its divergence hedge; names the alert exception."
    },
    {
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/menubar/",
      "result": "Tab/Shift+Tab 'move focus out of the menu or menubar, and close all menus'; Escape closes and returns focus to the opener. Refutes the technique's 'Tab hands focus back to the trigger' as the published pattern; the owed-handoff point stands."
    },
    {
      "url": "https://www.w3.org/TR/WCAG22/",
      "result": "1.4.3 4.5:1 text, 1.4.11 3:1 non-text, 1.4.4 resize to 200 percent. Supports preference-respect's AA floors and 200% text scale."
    },
    {
      "url": "https://github.com/AccessKit/accesskit/blob/00b517c24b037a7d20bcbf9b28e75cd622fe7fa3/accesskit_consumer/src/node.rs",
      "result": "Re-read write_label_direct / write_label / description(): direct label first, labelled_by only when absent; description() returns the plain property. Confirms the rust application's central findings; other anchors and the executed harness not re-run."
    },
    {
      "source": "Private consumer trees behind the react applications",
      "result": "Not reopened; dated readings retained, verified_on unchanged."
    }
  ],
  "digest": "sha256-b2:96c7307f86674f00",
  "disposition": "reverify",
  "documents": {
    "accessibility.md": {
      "disposition": "keep",
      "reason": "Load-bearing claims (primitives multiply, keyboard equivalence, two-channel hiding, engineered announcements, computed names, preference coverage, decaying claim, pairing grid) hold against the sources read; hedges match the techniques. Trigger: any app-wide accessibility decision; benefit: fixes land in primitives and gates; failure if ignored: N-call-site retrofit and silent regressions; boundary: neighbour subjects own overlay containment, field wiring, delivery policy, motion and token mechanics."
    },
    "techniques/primitive-level-a11y.md": {
      "disposition": "keep",
      "reason": "Native-first and the primitive contract are consistent with the platform semantics read; no unstable claim."
    },
    "techniques/keyboard-navigation-models.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: transient-composite exit now names a defined target outside the popup — Escape to the trigger, Tab out per the published menu pattern, the surface naming where it lands."
    },
    "techniques/hidden-but-mounted-inertness.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the not-visible hide is stated as holding its layout space; both-channels claim unchanged."
    },
    "techniques/live-region-architecture.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: semantics #1 names the alert grade as the commonly documented exception, still not universal."
    },
    "techniques/name-and-description-wiring.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: precedence outline scoped as the browser's name-computation algorithm, with the native-schema inversion noted. Banked platform-dependent defect-direction candidate still owed."
    },
    "techniques/preference-respect.md": {
      "disposition": "keep",
      "reason": "AA floors and the 200% text-scale figure match WCAG 2.2 (1.4.3, 1.4.11, 1.4.4); the one-signal contract is internally consistent with its react application."
    },
    "techniques/a11y-verification.md": {
      "disposition": "reverify",
      "reason": "Denominator doctrine confirmed (Deque: 57.38% by volume; 16 of 50 AA criteria). The synthetic-evaluator paragraph cites unnamed systems and an absent human-to-human agreement figure; that source was not identified or reopened."
    },
    "techniques/assistive-tech-divergence.md": {
      "disposition": "keep",
      "reason": "Structural, product-free claims; supported by MDN's 'Behavior can vary across browser and assistive technology combinations' and the alert exception. Failure ranking is a stated judgement, not an empirical claim."
    },
    "applications/react--name-and-description-wiring.md": {
      "disposition": "reverify",
      "reason": "Private tree at a pinned commit not reopened; findings are internally consistent with the technique (absorbed error name, unchanged-string silence). verified_on unchanged."
    },
    "applications/react--hidden-but-mounted-inertness.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; the mechanisms cited agree with the HTML inert semantics read this run. verified_on unchanged."
    },
    "applications/rust--name-and-description-wiring.md": {
      "disposition": "keep",
      "reason": "Central claim re-read at the pinned commit (direct label before labelled_by; description() ignores described_by). Remaining anchors and the executed harness not re-run; verified_on unchanged."
    },
    "applications/react--preference-respect.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; dated reading retained."
    },
    "applications/react--keyboard-navigation-models.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; adoption counts are dated measurements."
    },
    "applications/react--live-region-architecture.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; provider mechanics agree with the technique."
    }
  }
}
```

## Architecture review - 2026-10-31 (after private-tree re-verification)

This record follows the re-verification of the two react applications that the record above marked `reverify`. Both were checked at personas@61029d7ae0, and where a commit was pinned, at that commit too.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/accessibility",
  "date": "2026-10-31",
  "baseline": "500de2cea",
  "digest": "sha256-b2:a981516c48153a86",
  "disposition": "reverify",
  "coverage": "Since the previous record, two applications changed. react--keyboard-navigation-models: anchors re-pointed, a dated note added, verified_on 2026-10-31. react--preference-respect: anchors of unchanged constructs re-pointed, a dated re-check section added, verified_on 2026-10-31. Every tree citation in both was checked at personas@61029d7ae0, and the preference-respect citations also at the pinned c2a3c5fa1. Every other document is byte-unchanged and carries its prior disposition. The three remaining react applications keep reverify, which stays the overall disposition.",
  "counterexamples": [
    "A subtree marked not visible closes both accessibility channels yet still holds its layout space; only taking it out of the layout frees the space.",
    "An alert-grade region that arrives already populated is voiced by most pairings, so 'pre-populated is silent' is a tendency with a named exception, not a rule.",
    "A native accessibility schema can rank a direct label above the labelling relation, inverting the browser precedence the name technique outlines.",
    "Tab out of a popup menu, per the published pattern, leaves the menu without returning to the trigger; Escape is what returns.",
    "Removing a live region can be the accessibility fix (an ambient tally) and its diff looks like a regression."
  ],
  "sources": [
    {
      "source": "personas at 61029d7ae0 (read, not executed)",
      "result": "Keyboard: useRovingTabIndex.ts has no importer outside itself; App.tsx:397-402 skip link; Sidebar.tsx:210 primary nav; SidebarGroupNav.tsx:212,256; isTypingTarget at KeyboardNavMode.tsx:30-35 and ShortcutCheatSheet.tsx:15-20; useToastTimer pause is onMouseEnter/onMouseLeave only; DragHandle is role=button with no key handler. Preference: useMotion.ts and the reduced-motion lint rule are byte-identical to c2a3c5fa1; themeStore.ts:212-219,383-387,432; globals.css:5520-5535; App.tsx:392 MotionConfig. AnimatedCounter now imports the sanctioned hook. There are nine non-sanctioned media-query reader files, two of them composite. useMotion has 137 importers. Two media-query-only inline style blocks remain."
    },
    {
      "source": "personas at c2a3c5fa1 (git show)",
      "result": "Pinned anchors and counts reproduced: 50 useMotion importers, 16/17 globals occurrences, four literal matchMedia readers (useMotion, rafAnimationEngine, AnimatedCounter, flashSpotlight), and six inline media-query blocks (4 lifecycle icons, glyph, AdoptCelebration)."
    }
  ],
  "documents": {
    "accessibility.md": {
      "disposition": "keep",
      "reason": "Load-bearing claims (primitives multiply, keyboard equivalence, two-channel hiding, engineered announcements, computed names, preference coverage, decaying claim, pairing grid) hold against the sources read; hedges match the techniques. Trigger: any app-wide accessibility decision; benefit: fixes land in primitives and gates; failure if ignored: N-call-site retrofit and silent regressions; boundary: neighbour subjects own overlay containment, field wiring, delivery policy, motion and token mechanics."
    },
    "techniques/primitive-level-a11y.md": {
      "disposition": "keep",
      "reason": "Native-first and the primitive contract are consistent with the platform semantics read; no unstable claim."
    },
    "techniques/keyboard-navigation-models.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: transient-composite exit now names a defined target outside the popup — Escape to the trigger, Tab out per the published menu pattern, the surface naming where it lands."
    },
    "techniques/hidden-but-mounted-inertness.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the not-visible hide is stated as holding its layout space; both-channels claim unchanged."
    },
    "techniques/live-region-architecture.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: semantics #1 names the alert grade as the commonly documented exception, still not universal."
    },
    "techniques/name-and-description-wiring.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: precedence outline scoped as the browser's name-computation algorithm, with the native-schema inversion noted. Banked platform-dependent defect-direction candidate still owed."
    },
    "techniques/preference-respect.md": {
      "disposition": "keep",
      "reason": "AA floors and the 200% text-scale figure match WCAG 2.2 (1.4.3, 1.4.11, 1.4.4); the one-signal contract is internally consistent with its react application."
    },
    "techniques/a11y-verification.md": {
      "disposition": "reverify",
      "reason": "Denominator doctrine confirmed (Deque: 57.38% by volume; 16 of 50 AA criteria). The synthetic-evaluator paragraph cites unnamed systems and an absent human-to-human agreement figure; that source was not identified or reopened."
    },
    "techniques/assistive-tech-divergence.md": {
      "disposition": "keep",
      "reason": "Structural, product-free claims; supported by MDN's 'Behavior can vary across browser and assistive technology combinations' and the alert exception. Failure ranking is a stated judgement, not an empirical claim."
    },
    "applications/react--name-and-description-wiring.md": {
      "disposition": "reverify",
      "reason": "Private tree at a pinned commit not reopened; findings are internally consistent with the technique (absorbed error name, unchanged-string silence). verified_on unchanged."
    },
    "applications/react--hidden-but-mounted-inertness.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; the mechanisms cited agree with the HTML inert semantics read this run. verified_on unchanged."
    },
    "applications/rust--name-and-description-wiring.md": {
      "disposition": "keep",
      "reason": "Central claim re-read at the pinned commit (direct label before labelled_by; description() ignores described_by). Remaining anchors and the executed harness not re-run; verified_on unchanged."
    },
    "applications/react--preference-respect.md": {
      "disposition": "keep",
      "reason": "Re-verified at c2a3c5fa1 and 61029d7ae0. The mechanism is unchanged and the unchanged anchors are re-pointed. The dated note records three moves: the AnimatedCounter gap is resolved, the ad-hoc readers grew from three to nine files (seven of them media-query only), and media-query-only inline blocks fell from six to two. The pinned measurements are retained. verified_on 2026-10-31."
    },
    "applications/react--keyboard-navigation-models.md": {
      "disposition": "keep",
      "reason": "Re-verified at personas@61029d7ae0. Five anchors re-pointed, and every gap holds: the roving hook still has zero importers, the toast pause is hover-only, and DragHandle has no key operation. A new questionnaire comment naming SelectPills' hand-rolled roving arrows supports the zero-adopter finding. verified_on 2026-10-31, verified_against react@19 from package.json."
    },
    "applications/react--live-region-architecture.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; provider mechanics agree with the technique."
    }
  }
}
```
