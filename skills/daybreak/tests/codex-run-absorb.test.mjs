// Pins the event fold: token usage is the ledger's only Codex figure, and an unknown
// model does not fail the process, so both must be read off the stream.
import test from 'node:test';
import assert from 'node:assert/strict';
import { absorb } from '../scripts/codex-run.mjs';

const fresh = () => ({ sessionId: null, lastMsg: '', sawTurnCompleted: false, modelUnknown: false, usage: {} });

test('usage is summed across turns and non-numbers are ignored', () => {
  const s = fresh();
  absorb(s, { type: 'turn.completed', usage: { input_tokens: 10, output_tokens: 2, note: 'x' } });
  absorb(s, { type: 'turn.completed', usage: { input_tokens: 5 } });
  assert.deepEqual(s.usage, { input_tokens: 15, output_tokens: 2 });
  assert.equal(s.sawTurnCompleted, true);
});

test('the model-metadata error item flags an unknown model; another error does not', () => {
  const s = fresh();
  absorb(s, { type: 'item.completed', item: { type: 'error', message: 'rate limit warning' } });
  assert.equal(s.modelUnknown, false);
  absorb(s, { type: 'item.completed', item: { type: 'error', message: 'Model metadata for x not found. Defaulting to fallback metadata' } });
  assert.equal(s.modelUnknown, true);
});

test('session id and the last agent message are kept', () => {
  const s = fresh();
  absorb(s, { type: 'thread.started', thread_id: 'abc' });
  absorb(s, { type: 'item.completed', item: { type: 'agent_message', text: 'one' } });
  absorb(s, { type: 'item.completed', item: { type: 'agent_message', text: 'two' } });
  assert.equal(s.sessionId, 'abc');
  assert.equal(s.lastMsg, 'two');
});
