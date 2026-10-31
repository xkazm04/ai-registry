---
subject: self-describing-model-packages
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# self-describing-model-packages

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/model-workflow-contracts`.

## 2026-09-03 - forged from the handoff

normative layout, symbolic shape constraints with a solver, self-locating schema, declared vs derived outputs, advisory version floors, config-frozen artifact; 6 techniques. Boundary vs repo-manifest-standard: stays-where-written vs copied-to-a-stranger. Upward lessons: closed variable alphabet and bounded evaluator for shape expressions; rename-on-load for metadata keys. Deviations: version floors compare strings; required_packages_version never checked; schema key not mandatory so a fresh package fails its own verifier. Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.

## 2026-10-31 - first fleet apply that changed code: advisory-version-floors (next)

Run apply-avf-1031, dispatched for "single stack (python)". The 2026-10-22 kp row was
`not-better`: a consumer-owned pin file is a lock, not a build floor. This run found a real
floor in pof. An engine project file records the engine version it was created on, and the
setup wizard listed a project only when that string started with the selected major.minor.
That hid older projects under the engine they open in, hid newer ones without a warning, and
hid GUID or empty associations under every pill. The engine scan also sorted versions as
text. Code A/B: built-on-newer pairs warned 0/6 -> 6/6 on the machine's two real projects;
scripted openable pairs listed 2/6 -> 6/6; unknown labelled 0/8 -> 8/8. Floor held: A's list
is B's head on 8/8, and no warning on match or older pairs. pof ab906677 + 7a5b6cac pushed.
Application `next--advisory-version-floors.md` is the subject's first non-python stack.
Discriminator across the two trees: a version the package recorded about its build is a
floor; a version the consumer pinned for itself is a lock. Banked boundary (gain 1, risk 0,
not written): silence above the floor assumes going forward is free, and an in-place
one-way upgrade is not.
