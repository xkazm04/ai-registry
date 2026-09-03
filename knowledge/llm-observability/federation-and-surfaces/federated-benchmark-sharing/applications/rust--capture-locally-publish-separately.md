---
layer: application
type: application
subject: federated-benchmark-sharing
technique: capture-locally-publish-separately
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.85
---

# Declining to share is a no-op on the local store

`AlexsJones/llmfit` at `d19380bac5d82c5cd3080ff1afef6d1dc20615bf` runs
throughput benchmarks locally and offers to contribute the results upstream. The
split the technique requires is stated as a property in
`llmfit-core/data/community/README.md`:

> Bench runs made **without** `--share` are kept in a local store on the user's
> machine; a later `llmfit bench --share` (with nothing else to bench) uploads
> that stored backlog in one PR, so **declining to share never discards data**.

Capture is unconditional and lands in a store under the user's own config
directory (`llmfit-core/src/share.rs`; the store is described in
`docs/benchmarking.md` step 3 as *"Every run is saved locally first... so nothing
is lost if you skip sharing"*). Publication is a separate verb over that store,
invocable at run time as a convenience or later on its own.

Every consequence the standard derives is present:

- **Declining discards nothing** — stated as the design's headline property.
- **The backlog is first-class** — `llmfit bench --share` with nothing new to
  measure exists specifically to drain it, in one proposal rather than one per
  run.
- **Publication is retriable without re-measuring** — which composes with the
  content-addressed paths, so a retry skips what already landed.
- **A dry run is constructible** — `--share --dry-run` previews the exact
  payloads without contacting the forge, and the interactive path *"shows you the
  exact JSON payloads, asks for confirmation"* before sending. The standard's
  claim that this split is what makes payload disclosure possible at all is
  visible here: the payloads exist as stored data before anyone is asked.

## Where this realization diverges from the subject's posture

The subject's contributor-side treatments — bucketing, vocabulary closure, the
case floor — have **no counterpart in this tree**, and the reason is that this
federation is not anonymous. Contributions arrive as attributed proposals under
the contributor's own forge identity, authenticated through a device flow, and
the payload names the hardware precisely because identifying the hardware is the
entire point of the pooled data.

That makes this a partial realization of the standard by construction, and the
honest reading is that it realizes the **timing** rule cleanly while having no
occasion to realize the **treatment** rule at all. The ordering claim the
technique makes — that the store holds full fidelity and the treatments run on
the way out — is therefore untested here: there are no treatments, so nothing
distinguishes a design that stored the treated payload from one that stored the
raw one.

A federation that adopted this split *and* had privacy obligations would be the
test this tree cannot provide. What it does establish is that the split survives
contact with a real contribution loop and that the properties it buys — reversible
consent, drainable backlog, previewable payload — are the ones the author chose to
advertise, which is some evidence they are the ones that mattered.
