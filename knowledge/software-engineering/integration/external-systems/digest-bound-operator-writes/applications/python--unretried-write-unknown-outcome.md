---
layer: application
type: application
subject: digest-bound-operator-writes
technique: unretried-write-unknown-outcome
stack: python
status: forged
verified_on: 2026-11-03
verified_against: python@3.12
applied: experiment
ab_verdict: better
---

# The connector says unknown; the signature gate reopens the card (athena-muse)

Project `athena-muse`, https://github.com/xkazm04/athena-muse at main, commit 7000a27
(read from `origin/main` through `git show`, Python 3.12). It is a desktop assistant
whose "twins" draft Gmail replies and Notion notes. A person signs a card, and the
daemon then sends as that person through a brokered connector. The connector layer
gets the technique right. The approval gate above it reopens the action anyway. The
same leak appears in this subject's node application, so this is a second stack and
a second tree with one failure in two shapes.

## Where the three outcomes are kept

| Piece | Anchor | What it does |
|---|---|---|
| The rule, documented | `src/athena/connectors/service.py:19` "came (a timeout, a dropped connection after it was sent, a 5xx) is `outcome_unknown`, not a" | The module header names the third error channel and why: a record that said failed would invite a second send |
| Transport class | `src/athena/connectors/vault.py:122` "class NoAnswer(VaultError):" | The vault raises it when the request may have reached the provider and no answer came back |
| Lost answer on a write | `src/athena/connectors/service.py:205` "except NoAnswer as exc:" | On a write this becomes `outcome_unknown`. On a read it stays an `engine_error`, because a read has no effect to account for |
| 5xx on a write | `src/athena/connectors/service.py:216` "if write and answers and answers[-1][0] >= 500:" | A server error answering a write is unknown, the class the corrected technique now names |
| The words | `src/athena/connectors/service.py:228` "the write may have gone through, so check before trying it again" | One sentence, attached to a distinct error value |
| Rate limits never retry | `src/athena/connectors/vault.py:140` "The provider is rate limiting the calls. The grant stays connected and nothing retries." | A refusal the remote announced, and no automatic loop |

## Where the value is lost

The gate claims a card with one conditional update, so a double signature loses the
race (`src/athena/gate.py:83` "WHERE id = ? AND state = 'waiting'"). That is the
journal claim from preview-id-claim-and-recall, done right. The executor that runs a
signed send turns `outcome_unknown` into a raised API error, with honest words
(`src/athena/twins/missions.py:624` "Gmail did not confirm the send; it may have gone. Check your Sent mail before you").
The gate handles every raised error the same way. It puts the card back
(`src/athena/gate.py:94` "UPDATE cards SET state = 'waiting', resolved = NULL WHERE id = ?").
So the card can be signed again. The Notion note path has the same shape
(`src/athena/twins/missions.py:581` "Notion did not confirm it; check the page before you sign again.").

The repo's own test pins this:
`tests/test_twin_missions.py:258` "world.send_status = 503  # it may have gone: the problem says so"
is followed by a second signature that sends. The test's name promises "never sends twice". That holds
only because the fake Gmail never delivers a send it answers with 503.

## Measured (2026-11-03, experiment, not landed)

Instrument: the repo's own mission test world, in a scratch worktree of 7000a27. One
flag was added to the fake Gmail: deliver the send, then answer 503. That is the case
the fake could not express. Scenario: a twin drafts a reply, the person signs, Gmail
takes the message and answers 503, and the person signs the same card again.

| Arm | Code | Messages that reached Gmail | Second signature | Card |
|---|---|---|---|---|
| A | as shipped | **2** | 200, approved | approved |
| B | the executor returns the unknown outcome as the card's result instead of raising | **1** | 400, "already decided" | approved, outcome says check Sent mail |

Arm A is the seeded red: the instrument sees the duplicate. Floor in arm B: the
twin-missions and connector-service suites pass, 33 tests out of 34. The one failure is
`test_a_failing_send_returns_the_card_to_waiting_and_never_sends_twice`, which asserts
arm A's reopen after a 503.

**Not landed, held for the owner.** Arm B changes behaviour the owner pinned in a test.
It also takes away the person's way to re-sign after a 503 that really did not send:
in arm B the next send needs a new draft. That trade is a product decision. The
technique says the closed card is right. Return: when the owner chooses between a
settled card and a reopened one, or when the twins' real-account run starts.

## Gaps against the technique

- **The gate's generic path claims nothing changed.** An executor that raises
  anything other than an API error is answered with
  `src/athena/gate.py:100` "It could not be done, so nothing changed. Try again."
  If the send went out and the bookkeeping after it raised, that sentence is false.
  It is the record-cannot-finish case the node application handles by answering
  nothing.
- **The send carries no key.** The connector's Gmail send sends no idempotency key,
  so there is no keyed retry to fall back on. The only way to settle an unknown is
  for the person to read their Sent folder, which is what the words already ask for.
