# Forge handoff — a reimplemented browser engine (obscura), 2026-09-04

Source: `https://github.com/h4ckf0r0day/obscura`, swept at commit `14ce5178`.
Run: `obscura-0904`. Class: vendor repository, design-deep.
Routing count (Phase 2d): **22 load-bearing design decisions, 20 with no subject in the
corpus modelling their forces.** That is a forge job by the method's own threshold
several times over.

**What intake already absorbed, and what is left.** System A below was landed in this
run as a golden-path correction plus five techniques and three applications inside
`software-engineering/backend-platform/language-runtime/guest-execution-bounding` — it
had an existing home whose denial went too broad, so it was a correction, not a forge.
Systems B through E have **no home in this bundle** and are the handoff. They are not
ranked by how interesting they are; they are ranked by how much of each one a single
tree can honestly authorize.

Every decision below carries file anchors into the clone. **The clone is deleted with
this run's scratch directory** (method rule), so a forge wave re-clones at the pinned
commit; the anchors are stable against it.

---

## System B — measuring a reimplementation against a live reference implementation

**Why it ranks first.** It is the only one of the four whose forces the tree states as a
methodology rather than as a set of behaviours, so a single tree authorizes more of it.
The nearest corpus neighbour is `game-production/content-pipeline/reference-parity-gating`,
which is **cross-bundle** — link it and the gate fails; the software-engineering bundle
has nothing, and `workflow-property-contracts/dual-implementation-parity` is about two
implementations the same team owns, which is a different force entirely.

The distinguishing force: the reference implementation is **not yours, not changeable,
and its behaviour IS the specification**. You cannot fix it, cannot instrument it, and
cannot appeal a disagreement to a spec, because where the spec and the reference differ
the reference is what the world targets.

Decisions, all in `render-repros/`:

1. **Pass/fail is asserted on solid-colour component geometry, never on the image.**
   `check.py:1-11` and `checks.json` — every fixture declares named coloured rectangles
   with expected x/y/width/height. Anti-aliasing and font rasterisation therefore cannot
   decide a verdict. *Buys:* a behavioural gate that two engines with different text
   rasterisers can both pass.
2. **The reference comparison is a diagnostic and is forbidden from producing a verdict.**
   `check.py:5-8` states the refusal explicitly: "no registration, cropping, blank-page
   exclusion, or opaque aggregate parity verdict." `AGENTS.md` repeats it: "Pixel-distance
   metrics are useful regression tripwires, not standalone correctness verdicts."
   *Rejects:* the single parity percentage every such harness converges on.
3. **A lossy projection scores two different layouts identically, so the metric must
   preserve both coordinates.** `check.py:70-95` — row and column projections discard the
   other coordinate, so two layouts with identical projections can occupy different
   quadrants; a bidirectional distance transform is used instead, with each engine
   contributing equally so the denser edge map cannot dominate.
4. **Both arms must be proven non-blank before anything is compared.** `AGENTS.md`
   rendering-verification section. A blank-versus-blank pair scores perfect on every
   pixel metric.
5. **Never add hostname-specific layout, style or resource behaviour.** Stated twice
   (`AGENTS.md`, `docs/Testing-and-debugging.md`). An engine that special-cases a site
   has stopped measuring fidelity and started memorising it.
6. Adjacent, and worth a technique: **a latency-only run with zero settle is explicitly
   not valid fidelity evidence** — the harness supports the mode and the documentation
   forbids reading fidelity off it.

**Proposed home if new:** `software-engineering/engineering-assessment/` or a new subject
under `backend-platform/language-runtime/` beside `engine-host-contract`. The scout
decides; `taxonomy.json` is the authority on whether the target category is flat or
nested, and this handoff does **not** assert it.

**Boundaries it must NOT absorb:** the counted/uncounted ceiling material (System A,
already landed), and generic visual-regression snapshot testing, which is a different
problem — snapshot testing compares a tree against its own past, and this compares a tree
against a foreign authority.

---

## System C — protocol drop-in compatibility

**The force, stated as the tree's own discovery:** when you reimplement a wire protocol
to be a drop-in replacement, **the specification is not the contract — the strict clients'
undocumented assumptions are.** Conformance to the published protocol is necessary and
nowhere near sufficient.

Decisions, mostly recorded as `AGENTS.md` gotchas and `docs/Testing-and-debugging.md`
failure modes, which is itself the finding — this knowledge lives in a troubleshooting
list because it was learned by breaking:

1. A field absent from a payload the spec marks optional makes one strict client panic
   outright (`canAccessOpener` in every target-info payload).
2. A client keeps a local counter that must not diverge from the server's; a fresh
   execution-context id must be allocated on *every* navigation or the client fails with
   an error naming neither cause.
3. A high-level client call returns a null result unless a specific event arrives with two
   ids equal to each other — a correlation the protocol documents nowhere.
4. Session-identity shape is dual by necessity: managed sessions use a derived
   `"{targetId}-session"` form, while explicit flattened attachments must receive
   distinct ids, because two client libraries make opposite assumptions.
5. Related, from `docs/Watch-agent-sessions-live.md`: a passive observer cannot use the
   streaming surface at all, because frames route to the session that drives the page;
   an explicit capture is the only surface that works for a third party. And connecting
   twice to one page socket fails, so an observer must attach through the browser
   endpoint instead.

**Weakest of the four on a single tree** — it is one implementer's list of scars, and the
scars are per-client. A forge wave should treat the *general* rule (compatibility is
measured against clients, not against the document) as the subject, and the specific
quirks as evidence, never as techniques.

---

## System D — the egress boundary of an engine that executes attacker-supplied code

The corpus has no SSRF or egress subject; `security/data-and-transport/browser-credential-boundary`
is about a client's own credentials and does not model these forces.

1. **Deny private address space by default, opt in explicitly.** Loopback, RFC1918 and
   link-local are blocked unless a flag is set (`AGENTS.md` §Gotchas).
2. **Automatic redirect-following bypasses the validation door, so the client must follow
   redirects manually and re-validate every hop.** `ops.rs:2601-2604` names the CVE:
   an allowed origin returning a 302 to loopback is a full bypass. This is
   `one-validation-door` on a *chain*, and it is the most transplantable decision here.
3. **A request-interception API that lets a caller rewrite a URL must re-enter the same
   gate.** `ops.rs:2460-2463` — the rewrite is the same attacker-influenced hop as a
   redirect, arriving through a feature rather than through the network.
4. **Sub-resource scheme policy is decided per scheme with a stated reason each.**
   `page.rs:124-140` — inline data is allowed *because the bytes are in the URI and no
   fetch occurs*; local files only when the page itself came from one; a scheme step from
   non-local into local is treated as a same-origin-policy violation because the existing
   realm survives the navigation and could read the new document.

**The reusable core is 2, 3 and 4 together:** a validation door is only a door if every
path that can change the target re-enters it, and the paths that can change the target
include ones that are features rather than attacks.

---

## System E — identity consistency across layers

Three decisions, and the reason this is a subject rather than a technique is that its
central claim inverts the naive one.

1. **A randomised fingerprint is itself a fingerprint.** The tree presents "a consistent
   browser fingerprint, not a randomized one" (`Architecture-overview.md` §Stealth). The
   naive privacy move — randomise every surface — makes the client *unique*, which is the
   opposite of the goal.
2. **Consistency must hold across layers that are normally owned by different code.**
   The transport handshake, its protocol negotiation and cipher ordering must match the
   headers, which must match the scripting-surface properties. A mismatch between any two
   is more identifying than any one value.
3. **Every request path must use the same transport, or the subresources betray the
   navigation.** Scripted requests are routed through the same client as the main
   navigation for exactly this reason.

**Boundary to state, not to resolve:** the recruiting bundle holds fairness material
about blind screening and the media bundle holds character-identity continuity; both
match on the word "identity" and neither shares these forces. Say so in the subject note
rather than linking.

---

## What a forge wave should NOT take from this tree

- The README and the sponsor/proxy-provider section: marketing, and one section is a paid
  referral placement.
- Anything about the vendored layout and text-shaping libraries — they are third-party
  code carried in-tree, not this project's design.
- The stealth material as *evasion*. The transplantable content is the consistency
  argument in System E. The tree itself states the feature contains no automation-abuse
  payload, and the corpus should carry the identity-consistency rule, not a bypass recipe.
