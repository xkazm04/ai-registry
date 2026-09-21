---
layer: application
type: application
subject: embedded-preview
technique: origin-validation
stack: next
status: forged
verified_on: 2026-09-15
verified_against: next@16.1
applied: simulation
ab_verdict: not-better
---

# Frames with no origin: two tutorial hosts, and a print frame that must keep its origin

*Verified against `Shubhamsaboo/awesome-llm-apps` at `4593569` (both hosts pin
`next 16.1.1` in `package.json`) and `xkazm04/personas` at `cf54b904b`, read on
2026-09-15. The primary for the separate-origin rule is the MCP Apps extension
specification (`modelcontextprotocol/ext-apps`, `specification/2026-01-26/apps.mdx`),
fetched the same day: "The Host and the Sandbox MUST have different origins", and a host
must reject `tools/call` from an app for tools whose visibility does not include `app`.*

The technique's addressed-mail rule assumes a guest with an origin. These three surfaces
render a string, and the verdict on each depends on who wrote the string.

## Case 1: the app builder's preview

`generative_ui_agents/ai-mcp-app-builder/apps/web/app/components/McpAppPreview.tsx`
renders a tool's model-generated HTML through `srcdoc` with
`sandbox="allow-scripts allow-same-origin"` (`:199`). Scripts plus same-origin on an inline
document give the guest the host's origin, so the sandbox is decoration. Inbound, the
listener does the one check that still works, `event.source !== iframeRef.current?.contentWindow`
(`:34`); outbound, every reply goes to `"*"` (`:43-139`), unavoidably for an opaque frame
and harmlessly only because the guest is not actually opaque. Behind it, the agent route's
UI proxy allows four methods but takes its list of registered servers from a client
request header, and the `call-tool` route accepts any endpoint URL.

**Policy B** (no same-origin for guest-authored markup) is the fix here.

## Case 2: the showcase's sandbox proxy

`mcp-apps-generative-ui-showcase/public/sandbox.html` is served from the host's own
`public/` directory, so it shares the host's origin, the exact arrangement the
specification forbids. It creates the inner frame with `allow-scripts allow-same-origin
allow-forms`, then applies **whatever `sandbox` string the parent's message carries**
before writing the guest into `srcdoc` (`:58-76`), and relays both ways with `"*"`
(`:77-87`). A document able to post to the proxy chooses the guest's permissions. The
four app pages it hosts (`mcp-server/apps/*-app.html`, e.g. `kanban-app.html:1113-1115`)
accept any message whose data is an object, with no source or origin check.

**Policy B** is the fix here: a separate-origin relay, and flags chosen by the host alone.

## Case 3: personas' report print frame, the falsifying seam

`src/features/overview/sub_reports/libs/reportPrint.ts:15-60` writes a report into an
off-screen `srcdoc` frame **with no sandbox attribute**, then calls
`iframe.contentWindow.print()`. Applied mechanically, the opaque-origin rule flags this
frame. It should not. The document is the host's own template, and every interpolated
value (title, persona name, body) passes through an escape of `& < > " '` before
insertion. No script exists in it. And the print call *requires* same-origin access, so
sandboxing the frame without that permission would break the feature and protect nothing.

**Policy B is not better here.** The discriminator the amendment states, authorship rather
than the `srcdoc` mechanism, came from this case. It would flip the day a report's body is
inserted as rendered markup instead of escaped text.

## What this cannot show

Three cases walked by reading, not a run: no guest was loaded and no hostile message was
posted. The vendor middleware that loads the showcase proxy is not in the tree, so how its
URL is chosen at run time was not verified.
