---
layer: application
type: application
subject: streaming-platform-api-custody
technique: brokered-calls-token-never-exposed
stack: typescript
status: forged
verified_on: 2026-11-03
verified_against: typescript@7
---

# TypeScript: a console that cannot spell the Twitch token

Overlord (public repo, origin/main at `1d58c90`, read 2026-11-03 from a worktree of that
commit) is a streaming companion for a human Twitch streamer. Its Rust daemon is the broker
and holds the bot account's grant. Its React console (`apps/console`, TypeScript `^7.0.2`)
drives the moderator, and so does an AI agent through the daemon's MCP tools. This
application follows the boundary from the console's side. The two `rust--` applications in
this subject record a different tree's broker from the inside.

## The contract is the boundary, and it has no field for a secret

The console never builds a request to Twitch. It names an operation of the daemon's and
gets a typed outcome back:
`apps/console/src/pages/characters/moderation/Connection.tsx:23 "twitch.connect"`
and `apps/console/src/pages/characters/moderation/Connection.tsx:24 "twitch.disconnect"`.
The file states the design in its header:
`apps/console/src/pages/characters/moderation/Connection.tsx:3 "never reach the console; only the code the operator types does."`

The types make that hold rather than just promise it. Every console type is generated from
the daemon's Rust types. The connect outcome has three fields, and none of them is a
credential:
`crates/shadowrunr-types/src/moderation.rs:219 "pub struct TwitchConnect {"`, generated as
`packages/contract/src/generated/types.ts:5300 "export interface TwitchConnect {"` with
`expires_s`, `user_code` and `verification_uri`. The status the console polls is the same
kind of thing: state, bot login, channel and a detail line
(`packages/contract/src/generated/types.ts:3071 "export interface PlatformStatus {"`).
No console module can call Helix or EventSub, because nothing in its type system carries
anything to call them with. The agent's MCP tool returns the same outcome
(`crates/shadowrunr-daemon/src/integrations/mcp_tools.rs:158 "returns a verification_uri and a user_code"`),
so the console and the agent reach Twitch through one broker. Neither holds the grant.

Disconnecting is an operation too. The console asks for it once and confirms first, in the
streamer's words:
`apps/console/src/pages/characters/moderation/Connection.tsx:85 "The stored login is deleted"`.
The test checks that nothing is sent before the confirmation and that exactly one request
is sent after it.

The device code is the one secret in the flow the console could have been given, and it is
kept on the daemon side. It is a `Secret` there
(`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:18 "pub device_code: Secret,"`), and
the console receives only the user code the streamer types.

## Where the boundary is thinner than it looks

- **The types end at compile time.** Every payload goes through one door
  (`packages/contract/src/door.ts:1 "Every byte the daemon sends enters the app here"`),
  but the compiled validator for this result checks only the required fields and their
  types. The schema compiled into it
  (`packages/contract/src/generated/results/TwitchConnect.js:7 "const schema335 = "`) lists
  the three required properties and has no rule against extra ones.
  A daemon bug that serialised a token next to the code would pass the door and sit in
  the console's memory. The TypeScript types would hide it but never remove it. Closing
  this means adding `additionalProperties: false` to the schemas the validators compile
  from, not just to the types.
- **The console opens the verification address as it is given.** It renders the address
  and hands it to the system browser
  (`apps/console/src/pages/characters/moderation/Connection.tsx:104 "openExternal(code.verification_uri)"`),
  and the opener does not check the host. Until `5b36dd3` nothing checked it. Now the
  daemon refuses a device response whose address is not `https` on Twitch's own host,
  before the console receives it
  (`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:81 "pub(super) fn verification_uri_ok(uri: &str) -> bool {"`).
  That is the right place for the check, because the agent's tool gets the same address.
  It is also the only place, so a second source of addresses would need its own check.
- **Reply text crosses the boundary on the device paths.** The refresh and validate paths
  scrub Twitch's reply before it becomes an error
  (`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:254 "self.scrub(&twitch_message(&body))"`).
  The device-code request and its poll do not. Those requests carry no token, but the
  poll carries the pending device code, and an unreadable reply passes up to 200
  characters of raw body
  (`crates/shadowrunr-daemon/src/platform/twitch/auth.rs:62 "body.chars().take(200)"`)
  into the detail line the console prints
  (`apps/console/src/pages/characters/moderation/Connection.tsx:68 "{tw.detail}"`).

## Where this sits

A console that has no type for the token is the strongest form of this technique for a
user interface: a module cannot leak what it cannot represent. The remaining gaps sit at
the edges of that representation. They are what the runtime validator accepts beyond the
type, the one address the console must open, and the reply text the broker passes
through. An implementer copying this layout should copy the generated contract and close
those three gaps along with it.
