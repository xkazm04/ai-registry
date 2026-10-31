---
subject: reversible-transform-pipelines
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# reversible-transform-pipelines

First touch: [[2026-09-02-monai-v2]] via the forge wave over `librarian/handoffs/2026-09-02-monai.md`
(run forge-monai-0903, forge 1.4.0). Class: NEW, `backend-platform/data-pipeline-semantics`.

## 2026-09-03 - forged from the handoff

journal on the payload, pop by identity with graceful fallback, refuse with recorded reasons, lossy inverse, decollate before invert; 6 techniques. Upward lesson: the pop is "my most recent record", not the top. Deviations: silent class-name fallback under spawn; test-time augmentation warns where the standard refuses. Anchor corrections recorded (the developer contract sits at inverse.py:436-445; the batch inverse lives under transforms/). Two source-tree applications (python@3.10, commit 02201b8). Worker's gate: clean for
this subject; director's gate over the wave: bundle integrity OK. No fleet apply row yet -
the subject is in the `/intake apply` backlog.

## 2026-10-31 - first fleet apply that changed code: decollate-before-invert (node)

Run intake-apply-decollate-1031, dispatched for "single stack (python)". The 2026-10-22
personas row found no seam (identity-only embedding returns). This run found one in pof:
a group delivery from an image-to-3D generator, normalised as a whole and then split
into one GLB per prop, is collation and decollation by another name. The split kept no
journal. Each part was re-centred and named by face-count rank. Code A/B, n=4, one
known size given: sized correctly 1/4 -> 4/4, unit-box warning kept 0/4 -> 4/4, parts
matched to their prop 2/4 -> 4/4. Floor held. pof e8fb13de. Application
`node--decollate-before-invert.md` is the subject's first non-python stack.
Upward lesson: a batch is not always a tensor rectangle. Here a per-job price did the
stacking, and the technique's rules held unchanged. Open: rotation is outside the frame,
and the viewer still opens bare files.
