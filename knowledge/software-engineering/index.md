---
okf_version: "0.1"
okf_bundle_name: software-engineering
okf_bundle_title: Software engineering
profile: rkb/0.1
purity: software
# Extra application stacks beyond the default set (react|rust|sql|node|process).
# Declared for the external-reconcile lane: the world-class trees worth learning
# from are not all written in the default stacks — sqlite is C, golang-migrate
# and litestream are Go — and the lane would otherwise bend its target list to
# the tooling instead of the material.
stacks: [go, c, claude-code, codex-cli, cursor-cli, elixir, gemini-cli, next, spec, python]
---

# Software engineering

106 subjects, each a Golden Path with its Techniques and per-stack
Applications. Read a subject's `<subject>.md` first: it states what the subject is and
what a principal engineer holds true about it, then names the techniques that carry the
procedures.

The upper two layers are transplant-clean — no repo paths, no file extensions, no product
or framework names — so they are usable in any codebase, not only the one they were forged
against. Applications are the opposite by design: they cite real code and name their stack
in the filename.

Cross-cutting invariants live in [`_laws.md`](./_laws.md); techniques cite them by anchor.
Subjects are grouped — and located — by [`taxonomy.json`](./taxonomy.json).

Format: [RKB profile v0.1](../../docs/rkb-profile.md), an OKF profile.
Evidence: consumer-local by design — see the profile, §5.
