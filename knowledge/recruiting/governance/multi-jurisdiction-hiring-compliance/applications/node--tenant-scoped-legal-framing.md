---
layer: application
type: application
subject: multi-jurisdiction-hiring-compliance
technique: tenant-scoped-legal-framing
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
---

# Node: scoping the compliance lookup to the caller's workspace

On 2026-08-20 this application recorded two open deviations and named the fix.
The fix landed on 2026-09-08 (KandiDate commit `7a6e09e2c`, "resolve the
candidate's jurisdiction server-side, from their own tenant"), so this note now
reads as the before, the after, and what the after still leaves open.

## The incident, and the first failure mode

`app/api/compliance/route.ts:27-30`: bare, `getActiveRegimeId()` "always answered
for the default workspace: a team that had set its jurisdiction to `us` still saw
'EU equal-treatment directives / processed under GDPR' on its Decisions
compliance card, and shipped that same wrong law to its candidates." The route's
fix is the technique's rule: resolve the workspace from the session first, then
read its regime — `getActiveRegimeId(await currentWorkspace())` (`route.ts:55`).

## The refusal to widen trust, now stated as a decision about the route's job

`route.ts:19-25` (the block headed "SO THIS ROUTE STAYS GATED"): the route is
deliberately absent from the public allow-list, and allow-listing it "would fix
nothing: an anonymous request carries no workspace, so the answer would still be
the default team's, and the only way to make it tenant-aware for a public caller
would be a caller-supplied workspace id — which would let anyone enumerate any
team's legal posture. A wrong answer that is also enumerable is worse than the
gated one."

That is the technique's second failure mode, refused by design. The 2026-08-20
version of this note called the route "safe to expose unauthenticated"; the
project reached the opposite conclusion, correctly, once it saw that an
unauthenticated answer is a wrong answer and a wrong answer that renders is the
dangerous kind. The route now serves only session-bearing callers: the recruiter
Decisions card and the interview simulator inside the authenticated shell.

## The candidate half, closed by resolving before the HTML is sent

`app/_lib/compliance-disclosure.ts` exports `disclosureComplianceFor(workspaceId)`
(`:32`), a server-side resolver that returns the candidate's regime and the
enforced retention window from the workspace behind the token the surface has
already established. `AiDisclosure.tsx:1-45` lists the resolution point for each
public surface: "the invite behind a /schedule token, the session behind an
/interview token, the posting behind a /devcase/apply token, the offer behind an
/offer token, the status link behind a /status token, the job behind /apply/[id]".
When the props are supplied the component "opens no network connection at all".

That is the technique's step 3 realized, and the source comment is candid about
why the earlier design could not be patched: the client fetch "was wrong twice
and both times toward UNDER-disclosure" — a fail-closed proxy 401'd the
non-allow-listed route, so the pre-fetch EU default became the final state; and
even when reachable it answered for the caller's workspace, which for an
anonymous candidate is the default one. "A client fetch cannot prove which tenant
it is asking about, so no amount of allow-listing fixes the second half."

## Pinning the channel, not the value

The regression that matters after the fix is structural, and the project pinned
it structurally. `app/_components/ai-disclosure-props.test.ts` reads the source
text of every public render site (`PUBLIC_SURFACES`, `:35`) and fails if one does
not hand the component its server-resolved values, and it fails on a *new* site
that is in neither list (`:91`), and on a surface that mounts the component twice
and feeds only one of the two. The one exception is a named allowlist
(`FETCH_FALLBACK_SITES`, `:54`) whose single entry carries its own reason:
"recruiter-facing simulator inside the authenticated shell — session-bearing, so
/api/compliance is reachable and tenant-correct." The test's header states the
scenario it exists for: "someone adds a ninth candidate surface, renders a bare
`<AiDisclosure />`, and it quietly reverts to asserting EU law. Nothing about that
reads as a bug on the screen. This test is what notices."

It reads source text because `node:test` has no DOM and "this call site was GIVEN
the values" is visible in the JSX itself. That trade is worth naming: it pins the
wiring rather than the rendering, which is the right layer for a defect that
renders fine.

## Status-blind parsing, and the fetch path that survives

The gated-versus-successful distinction from the earlier note is still in the
tree (`AiDisclosure.tsx:70`, `if (!r.ok) throw new Error(...)`). It now protects
only the session-bearing simulator, and a 2026-09-22 change
(`9789b8cc1`, "disclose simulator fallback on fetch failure") closed the
remaining silent case there: when that fetch fails, the component now shows an
alert with a retry control instead of keeping the EU defaults quietly. That is
the technique's step 5 (never leave a stale assertion on screen) applied to the
one surface that can still fail this way.

## What the fix leaves open

One deviation stands, narrower than before. If the server resolver's own read
fails (a locked or unreachable decision-config store), it degrades to
`DEFAULT_REGIME_ID`, which is `"eu"`, not to the neutral `global` row
(`compliance-disclosure.ts:45`). It does the part the technique now asks for —
`console.warn` names the workspace and the fallback and says "which may be the
wrong law for this workspace" (`:40-44`) — but the destination is still a
jurisdiction rather than the neutral row. The gated route has the same shape:
`normalizeRegimeId` sends a stale or hand-edited row to the EU default
(`route.ts:52-54`). Both are the catalog application's coercion-target
deviation seen from the lookup side, and both are fixed by the same one-line
change.

The standard is unchanged: framing resolved server-side from the token and passed
in as data, with the neutral row as the failure state. What this application adds
to the technique is the two pieces that made the fix stick — a test that fails
on the next bare render site, and a fallback that announces itself.
