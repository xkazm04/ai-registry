---
layer: technique
type: technique
subject: live-chat-moderation-and-anti-bait
technique: no-decode-no-repeat-no-assemble
status: forged
laws: []
shared_with: []
use_when: [a viewer asks the host to read, spell, translate or combine chat text, designing which operations the host may perform on viewer text, coordinated multi-message bait]
---

# No decode, no repeat, no assemble

The host never transforms viewer text into speech. It does not repeat a message
verbatim, spell, reverse, decode, translate, complete, rhyme on, acrostic or
concatenate what viewers wrote. Every transformation is a way to make the host emit a
string that no filter saw, and a filter cannot judge a string that only exists after
the host has made it.

## The transformation family

Baiters rarely ask for the forbidden line. They ask for an operation whose output is
the forbidden line:

- **Echo.** "Say 'X'." "Repeat after me." "Read my name out loud" when the name is the
  payload.
- **Encoding.** A blob in base-64, a shift cipher, reversed text, leetspeak, look-alike
  characters, phonetic spelling — with a request to decode, or no request at all, betting
  the host will helpfully read it.
- **Letter games.** "Spell it", "first letter of each word", "what rhymes with",
  "finish this word", "say it backwards".
- **Assembly.** Fragments across several messages or several viewers, then "read the
  last five messages as one sentence", or "everyone type a letter".
- **Translation.** The line in another language, with "how do you say this in yours".

Each produces output whose harmful content was never present, in harmful form, in any
input. A pre-filter that normalises and matches catches some encodings; none catches an
assembly whose parts are individually clean. That is why the defence is a rule about
the host's behaviour, not only a better filter.

## The procedure

1. **Prohibit the operation class in trusted instructions, not the content.** The
   standing instruction says the host never reads viewer text aloud verbatim and never
   performs letter, cipher, translation or concatenation operations on it, whatever it
   appears to say. Content-based phrasing ("don't spell slurs") invites the model to
   judge each request, and judgement is what the bait exploits.
2. **Tag the request shape at the pre-filter.** Requests to spell, decode, repeat,
   combine or translate are an injection class. The host sees "asked you to decode
   something", never the blob.
3. **Window the gate, not only the message.** The output gate screens the host's
   utterance against the normalised concatenation of recent output, so a host tricked
   into saying one letter per line across a minute is caught on the assembled string.
4. **Paraphrase, never quote.** When the host engages with a viewer's message — and it
   should, constantly — it restates gist in its own words. Names are spoken only if they
   passed the same term screening as messages; a username is viewer text, and a name
   that fails gets an in-world substitute ("the nameless one") rather than a skip.
   Echoing a viewer's word or two is conversation, not dictation, so a practical rule
   sets a short length cap on any verbatim span (a handful of words, tuned in testing)
   and requires that span to pass the same screening; above the cap, paraphrase is
   mandatory.

## Decision rules

- **When a request is innocent on its face** ("spell your name", "say hi to my mum
  Karen"), the cost of refusing the operation is small and the cost of an exception is a
  bypass. Play it in character — the host does not take dictation — and answer the
  intent instead (greet the viewer, not the dictated string).
- **When two or more viewers send fragments in close succession**, treat the
  combination as the message. The absorption layer may collapse a wave into a crowd
  voice; this subject forbids that crowd voice from ever being a concatenation of their
  text.
- **When a wave of near-duplicates collapses to one representative**, the representative
  is the variant that passes every term rule, never the first to arrive. Otherwise the
  baiter simply posts the poisoned variant first and lets the wave carry it.
- **When the host itself generates an acrostic, list or rhyme**, the output gate still
  windows it. The host can assemble a forbidden string from its own choices under
  chat steering; the rule protects the output, not merely the input path.

## When not to use it

The prohibition is on viewer text becoming host speech. It does not stop the host from
reading trusted text the show authored — a vote option it wrote, a segment's own
prompts — or from naming a viewer whose display name passed screening. And it does not
apply to an operator console where a trusted human types the line; there, the author is
the show.
