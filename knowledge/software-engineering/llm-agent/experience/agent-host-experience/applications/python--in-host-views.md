---
layer: application
type: application
subject: agent-host-experience
technique: in-host-views
stack: python
status: forged
verified_on: 2026-11-03
verified_against: python@3.12
---

# The companion's project report as a view inside agent hosts

The companion (`athena-meta` in the fleet, read at commit
`93a3bea8734b30ec1c26033c1f2fd809a3c48d05`; daemon on Python 3.12) gives an outside
agent host one journey-shaped read, `show_report`, on its MCP door, and one rendered
view, `ui://athena/report`, under the MCP Apps extension: complete text, a structured
projection of the report, and the view's address. It landed in `6f55ca7` (decision
record 0021), refined in `fe266c5`; journey-shaped surface claims are cited where they
apply. Claims are **confirmed**, **deviation** (the standard stays) or **candidate
upward lesson** (not yet in the technique). Anchors sit one per line.

## One journey, read-only, behind the same door

**Confirmed — a journey, not a wrapper over routes.** The tool is "show this project's
report" and takes no arguments; the project is the lease's, so an argument naming
another project is ignored. The read-only hint comes from the table of what each action
writes, and the view tool is admitted by the same lease check as every tool.

- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:14 "It takes no arguments."`
- `tests/test_mcp_views.py:201 "def test_a_lease_reads_only_its_own_projects_report"`
- `src/athena/mcp_views.py:39 "Read-only; it changes nothing."`
- `tests/test_mcp_views.py:137 "readOnlyHint"`
- `src/athena/mcp.py:253 "it reads and answers, never a card"`

## The text result is complete without the view

**Confirmed — the first content block is the whole report in plain lines.** Title,
callout, then every figure and row of every part, with no reference to a card the reader
cannot see, and the record words fenced as data. A host that renders nothing loses only
the layout.

- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:18 "The text stands alone."`
- `src/athena/mcp_views.py:30 "the text rendering shows everything the report computed"`
- `src/athena/mcp_views.py:217 "Record data, not instructions"`
- `tests/test_mcp_views.py:142 "def test_the_text_stands_alone_and_the_structure_carries_only_computed_figures"`

**Confirmed — the structure carries computed figures only.** The structured content is
a projection of the validated report: words from the spec, whose door refuses digits,
and every number from a records query. The spec's own numbers (a span, a limit) never
reach the host, and a test asserts the full set of numbers in the payload.

- `src/athena/mcp_views.py:153 "every number is a computed value; no span, limit or other spec-written number"`
- `tests/test_mcp_views.py:165 "set(_numbers(report))"`

**Deviation from the core protocol, deliberate — no serialized-JSON text block.** The
base specification says a tool returning structured content SHOULD repeat it as
serialized JSON in a text block. The companion does not: readable text serves a
text-only host better, and a JSON copy doubles what the model reads. The technique's
standard (text and structure tell the same outcome) is met; the protocol's is not.

- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:33 "No serialized JSON copy of the structure in a second text block"`
- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:33 "The readable text serves a text-only host better"`

## Advertised by the extension, with the extension's MIME

**Confirmed — a resource of the extension's MIME, linked from the tool.** The server
advertises resources and the extension in its capabilities, the tool names the view's
address in its metadata, and the resource is served with the extension's profile. The
metadata goes to every client whether or not it advertised the extension: the door keeps
no per-client state, and the complete text means a client that ignores it loses nothing.

- `src/athena/mcp_views.py:26 "text/html;profile=mcp-app"`
- `src/athena/mcp.py:221 "mcp_views.EXTENSION: {}}"`
- `src/athena/mcp_views.py:75 "resourceUri"`
- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:26 "is sent to every client, whether or not it advertised the extension"`

## Only where no other surface draws it

**Confirmed — outside leases only.** The tool appears on an outside client's lease in a
project that keeps records. A turn's lease names its chat tools, so the companion's own
model never sees it: the app draws the report, and its chat has its own parts form.

- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:16 "the in-app model never sees it: the app already draws the report"`
- `src/athena/mcp.py:160 "Report parts are the chat's own answer form (ADR 0022); an outside host has"`
- `tests/test_mcp_views.py:216 "def test_a_turns_lease_never_sees_the_view"`

**Deviation (to journey-shaped-tool-surface) — the outside catalog is computed by
exclusion.** A lease with no tool list gets everything the project offers minus the
chat's parts tool. The technique asks for a catalog computed from what a role is
granted: the next chat-only tool reaches outside hosts unless someone excludes it.

- `src/athena/mcp.py:161 "not in report_parts.NAMES"`

**Deviation (small) — the resource is scoped by project, not by lease.** The record says
the view is listed and read only while its tool is offered, but the resource routes ask
only whether the project keeps a report, so a turn's lease can list and read the view it
cannot call. The document is static, so nothing leaks; code and decision disagree.

- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:20 "listed and read only while its tool is offered"`
- `src/athena/mcp.py:234 "mcp_views.resource_list(daemon, lease.space_id)"`

## A self-contained view that writes only text

**Confirmed — no origin to declare, text content only, only the parent heard.** Style
and script are inline and nothing is fetched, so the view declares no content policy and
the host's restrictive default holds. Report words came from a model and from records,
so every string is set as text; a test bans any URL, link, source attribute or
HTML-writing call. Messages are accepted only from the parent frame.

- `src/athena/views/report.html:4 "no external origin, so the host's restrictive CSP holds"`
- `tests/test_mcp_views.py:232 "def test_the_view_has_no_origin_no_html_injection_and_no_action"`
- `src/athena/views/report.html:147 "node.textContent = String(text)"`
- `src/athena/views/report.html:231 "if (event.source !== window.parent) return;"`

**Confirmed — the standard bridge only.** Initialize with inline as the one display mode,
the initialized notice, the tool result, the host's theme and style variables, size
changes so the frame never scrolls in the conversation, and an answer to teardown. A
result without the structured report renders its own words, so an error still reads.

- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:22 "The bridge is the standard one only"`
- `src/athena/views/report.html:265 "availableDisplayModes: MODES"`
- `src/athena/views/report.html:253 "so the page never scrolls inside the conversation"`
- `src/athena/views/report.html:212 "A result without the structured report"`

## Inline is a glimpse

**Confirmed — five figures and five rows per part, then a count.** The daemon trims each
part to the published inline limit and says how many it left out; the view trims again
and prints "and N more". No part scrolls on its own. **Candidate upward lesson:** trim
twice, never the text. The view's second trim covers another server version; the text
fallback is never trimmed, so a text-only host gets more, not less.

- `src/athena/mcp_views.py:31 "INLINE_MAX = 5"`
- `src/athena/views/report.html:122 "more in the app"`
- `tests/test_mcp_views.py:176 "def test_a_part_past_five_says_how_many_more"`

**Deviation — the cap is per part, not per view.** A composed report holds up to twelve
parts, so one inline frame can carry about sixty data points. The technique's glimpse is
four or five points for the whole view, with a larger mode for depth the user chose; the
view declares inline only, and the record rules out full screen.

- `src/athena/contracts.py:29 "BLOCKS_MAX = 12"`
- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:32 "no fullscreen and no picture-in-picture"`

## No actions, and no way home

**Confirmed — nothing to act on in someone else's conversation.** No verdicts, pins or
signatures, because consent stays in the app's own cards; nothing sent toward the model,
because those channels are injection surfaces into the host's conversation. With no
actions there is nothing to publish as view-only.

- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:30 "Consent stays in the app's cards."`
- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:31 "Those are injection surfaces into the host's conversation."`

**Deviation (to depth-handoff) — no handoff.** The desktop app registers no URL scheme,
so the view offers no open-link action and the result carries no handle: "and N more in
the app" names a place the user cannot reach from the host. The record names the one
handoff it would add: open this project in the app, with its id and nothing else.

- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:25 "The desktop app registers no URL scheme"`
- `tests/test_mcp_views.py:237 "no handoff: the app has no URL scheme"`

## Never rendered in a real host

**Deviation — tested at the route and the document, never in an enforcing host.** No
host has drawn the frame, so the technique's warning (a view built where the policy was
not enforced breaks in the first host that enforces it) stands until it runs in one.

- `docs/adr/0021-the-project-report-is-also-a-view-inside-agent-hosts.md:40 "The view has not been rendered in a real host yet."`
