---
domain: software-engineering
subject: embedded-preview
last_touched: 2026-09-15
touched_by: intake
dry_streak: 0
---

# embedded-preview

First note. The subject was forged 2026-08-18 and had not been touched by a registry run since.

## 2026-09-15 - `/intake` awesome-llm-apps re-run (run `intake-awesome-llm-apps-0915`, intake 2.10.0)

Amendment to `origin-validation`: **when the guest has no origin.** The technique assumed a guest served from a dev server. Tool-linked interface resources arrive as strings rendered in inline or sandboxed frames with an opaque origin, where equality proves nothing and the wildcard is the only outbound target. The controls move instead of lapsing: identity-checked inbound at the one door, no same-origin permission for markup the host did not author, a relay on a separate origin whose frame flags only the host chooses, wildcard sends that carry only what the guest already had, and a host-enforced verb allowlist. Primary: the MCP Apps extension specification ("The Host and the Sandbox MUST have different origins").

The discriminator came from the falsifying seam: personas' report print frame is a `srcdoc` with no sandbox, and correctly so, because it is the host's own escaped template and needs same-origin access to print. Authorship, not the mechanism, decides. Application `next--origin-validation` (simulation, not-better on personas; the source's two hosts are the positive cases).

Boundary to record: the untrusted content a legitimately authenticated guest sends is still prompt-safety's problem, as the technique already says.
