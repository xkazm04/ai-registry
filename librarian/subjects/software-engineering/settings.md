---
subject: settings
domain: software-engineering
last_touched: 2026-08-31
dry_streak: 0
---

# settings

First touch: 2026-08-31, an `/intake` run over a four-post channel corpus by a
web-standards spec editor (`2026-08-31-verou-2026-blog`). The subject was not
sought — a dark-mode-toggle essay stripped of its proper nouns turned out to be
a settings-storage claim, and the map routed it here.

## State

6 -> 7 techniques, 2 -> 3 applications (`react`, `rust`, and a new `next`).

Landed `inherited-default-override`: the axis this subject did not carry.
Every default the subject models is a **static constant declared in code** —
"the value most installations run with", written where decisions live. A
minority of keys default instead to a **live upstream source the application
does not own**, and that difference redefines all three store operations:
absent means *follow the source continuously*, a write means *detach*, a delete
means *re-attach*. The stored row's **presence** carries meaning independent of
its content, which is the fact a content-only model loses silently.

Two failure modes came with it, both feedback-free at the moment they occur:
writing unconditionally pins a key that was merely following (the instant the
target coincides with the source), and clearing an override when the source
moves makes pinning *unachievable* for anyone whose environment switches on a
schedule.

## Why this was a seam and not a hole

Worth recording, because the near-miss is what made the finding trustworthy.
`setting-kinds` already refuses to store **derived** limits — *store the inputs,
derive at read* — which is the identical freezing failure. The regimes differ in
one way that matters: there the correct move is to store nothing at all, while
here the user must be able to detach, so the row is legitimate and only the
*reason for writing it* is constrained. A run that had stopped at "the corpus
already says don't freeze a live value" would have dropped a real finding.

## Boundary written on both sides

`ui-surfaces/feedback-and-style/adaptive-fidelity-tiers` reaches the same
requirement from the rendering side and had prescribed the opposite remedy — an
explicit third "automatic" control state. Corrected there in the same run; that
subject's note carries the other half. The distinction that keeps them apart:
its source is a **measurement the application performs**, which can be re-run
and can change for reasons unrelated to the user, so it is disqualified twice
over as a trigger for re-evaluating a stored choice. This subject's source is a
setting it merely reads.

## Applied

`inherited-default-override` → an embed widget on a connected project,
experiment, **better** (1/2 → 2/2 viewer environments served the palette their
environment asks for). The widget's config carries a distinct `auto` value and
resolves it **server-side**, where the viewer is invisible, to a constant — in
two files, one of which documents the gap in a comment rather than closing it.

Structural fact worth keeping: the three-state *model* survived intact and the
subscription died at the *resolution point*. Shape and semantics were maintained
by different hands and only shape reached the renderer — evidence that
preserving the model protects nothing on its own.

## Leads

- The subject's `save-experience` technique covers debounced honest saves and
  unsaved guards, but says nothing about a control whose write is a **deletion**
  — the confirmation copy for "this returned to following your environment" is a
  save-experience question the new technique only gestures at. Return condition:
  when a second source describes the feedback problem for a detach/re-attach
  control.
- The audit obligation for an inherited-default key is a **transition** (attach
  or detach), not a value change. Stated in the new technique's third carve-out;
  `settings-audit-and-history` does not yet model transitions as a record kind.
  Return condition: when a project grows an org-inherited policy value.

## 2026-08-31 - intake (youtube:3IyKC5EtNkM, "9 Ways to do Inheritance in Rust")

Amendment to **`typed-accessors`**: the case where the type is the *caller's* parameter
rather than a per-key declaration, and the case of an **open key space** where "one
accessor per key" cannot be written at all.

Found by reading the technique's 4-step contract as the enumeration it is. The contract
rests on an unstated premise - the type is declared at the accessor - and its step 2 uses
**parse failure as the type detector**, which is a heuristic rather than a check: a compact
binary encoding reads one width as another and succeeds, a decoder with optional fields
reads a foreign record as a fully-defaulted one and succeeds. When it succeeds, step 4
returns a value "the type system vouches for", which is the subject's own thesis
(misconfiguration indistinguishable from configuration) arriving through the door meant to
prevent it - and **worse than the corruption case the subject does model**, because no
default is substituted and the value looks chosen.

Grep confirmed the gap rather than assumed it: zero hits for type-mismatch vocabulary
across the whole subject, and `Boundaries` claims typing rather than scoping it out.
`ipc-contract` was rejected as an alternative home on its own stated boundary - "no version
skew in the field, both halves ship together" - which is precisely what a persisted store
does not have.

Remedies ranked in the amendment: bind the type to the key in the registry (closed key
space, no runtime tag needed), tag the record (open key space, catches *named*
disagreements only), or bind the type into the handle at build time.

Applied to a managed tree as code, `better`, committed. The store had already adopted the
technique well - closed key registry, write door enforced at the repository layer, blobs
validated against the consumer's exact type - and the gap was the one the amendment's audit
paragraph predicts: enforcement is **per key with nothing counting it**. 58 of 90 key
constants reachable inside the validator; within the store's own "limits" category, 3 of 4,
the fourth a spend ceiling whose sibling is enforced *and* carries six negative test cases.
Nobody decided that - the key was added after the validator's shape was set.
