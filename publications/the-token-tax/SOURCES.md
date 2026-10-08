# Sources and research log: The Token Tax

Numbers match `sources[].n` in `publication.json`, the `[n]` citations in `post.md` and `post.html`, and the numbered Sources list at the end of both. Pages were opened on 2026-10-05; sources first read in an earlier round were reopened or re-checked where their figures are used.

**Dates.** `publication.json` carries one `date` per source: the page date when the page states one, otherwise the date it was read or downloaded (2026-10-05). The table below says which.

**Provenance.** This publication is the winning entry of a two-round technical-writing contest run in this registry on 2026-10-05 (round 2 entry by `claude-opus-5-5` at medium effort), imported into the lane after the owner declared it the winner. Round-specific notes are kept below as the research log; **R2** marks a source first added in round 2.

## Sources

| # | Title, publisher | Page date | What the page contributes | Type |
|---|---|---|---|---|
| 1 | Measurements for this article (Experiments E1–E8 below) — https://github.com/xkazm04/ai-registry/blob/main/publications/the-token-tax/SOURCES.md#experiments | run 2026-10-05 | Every token count, premium, census figure, vocabulary position, window capacity and estimator ratio in the page | Own measurement |
| 2 | RFC 3629, UTF-8 (Yergeau), IETF — https://www.rfc-editor.org/rfc/rfc3629 | Nov 2003 | U+0800–U+FFFF take 3 bytes | Primary (standard) |
| 3 | tiktoken README and `model.py`, OpenAI — https://github.com/openai/tiktoken | read 2026-10-05, v0.14.0 | “works on arbitrary text”; “about 4 bytes”; `gpt-5` prefix maps to `o200k_base` (E5) | Primary (tool docs) |
| 4 | Gemma 3 Technical Report, Google DeepMind — https://arxiv.org/abs/2503.19786 (html v1) | Mar 25, 2025 | “We use the same tokenizer as Gemini 2.0: a SentencePiece tokenizer with split digits, preserved whitespace, and byte-level encodings. The resulting vocabulary has 262k entries.” | Primary, **R2** |
| 5 | Qwen Technical Report (Bai et al.) — https://arxiv.org/abs/2309.16609 (PDF §2.2) | Sep 28, 2023 | “select the vocabulary cl100k base as our starting point … augment the vocabulary with commonly used Chinese characters and words” | Primary, **R2** |
| 6 | IndicSuperTokenizer — https://arxiv.org/abs/2511.03237 | Nov 2025 | Hindi fertility 1.72 vs English 1.33 on the GPT-OSS tokenizer | Primary |
| 7 | FLORES-200, Meta AI — https://dl.fbaipublicfiles.com/nllb/flores200_dataset.tar.gz | release tarball, downloaded 2026-10-05 | 1,012 parallel devtest sentences | Primary (dataset) |
| 8 | Somide, The African Language Tax — https://arxiv.org/abs/2606.24460 | Jun 23, 2026 | Median 1.88× on o200k_base, N’Ko 8.92×, Amharic 7.36×, “no tokenizer eliminates the penalty”, r = 0.039, p = 0.891 (GPT-4o) | Primary; **counter-evidence** |
| 9 | Petrov et al., Tokenizers Introduce Unfairness — https://arxiv.org/abs/2305.15425 | May 2023, rev. Oct 2023 | Gaps “up to 15 times” (history) | Primary |
| 10 | Ahia et al., Do All Languages Cost the Same? — https://arxiv.org/abs/2305.13707 | May 23, 2023 | “overcharged while obtaining poorer results”; “tend to also come from regions where the APIs are less affordable to begin with” (re-opened R2) | Primary |
| 11 | Anthropic, Pricing — https://platform.claude.com/docs/en/about-claude/pricing | read 2026-10-05 | Opus 4.7 and later: newer tokenizer “produces approximately 30% more tokens for the same text”; Opus 4.6 and 4.7 both $5/$25; FAQ “approximately 4 characters or 0.75 words in English”; cache reads refresh; token-counting endpoint | Primary (pricing), **R2**; **counter-evidence** (tokenizers can also get more expensive for English) |
| 12 | Anthropic, Introducing Claude Opus 4.7 — https://www.anthropic.com/news/claude-opus-4-7 | Apr 16, 2026 | Updated tokenizer, “roughly 1.0–1.35×”, price unchanged | Primary (vendor) |
| 13 | OpenAI, API pricing — https://developers.openai.com/api/docs/pricing | undated page, read 2026-10-05 | gpt-5.4 $2.50 in / $0.25 cached / $15 out; gpt-5.4-nano $1.25 out; (page also lists gpt-5.5, gpt-5.6 and gpt-6 tiers) | Primary (pricing), re-read R2 |
| 14 | Google, Gemini API “Understand and count tokens” — https://ai.google.dev/gemini-api/docs/tokens | updated Sep 23, 2026 | “about 4 characters”; counting via `count_tokens`/`countTokens` API, no downloadable tokenizer described | Primary (docs) |
| 15 | Anthropic, Prompt caching — https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching | read 2026-10-05 | 0.1× cache read; 5-minute default; “100% identical prompt segments” | Primary (docs) |
| 16 | UAX #15 Unicode Normalization Forms, rev. 58 — https://www.unicode.org/reports/tr15/ | Aug 12, 2026 (Unicode 18.0.0) | Devanagari nukta letters are script-specific composition exclusions; “no composition exclusion character can occur in any normalized form” | Primary (standard), **R2** |
| 17 | Lundin et al., The Token Tax — https://arxiv.org/abs/2509.05486 | Sep 5, 2025 | 10 models, AfriMMLU, 16 languages; “higher fertility consistently predicts lower accuracy” | Primary |
| 18 | Xuan et al., MMLU-ProX — https://arxiv.org/abs/2503.10497 | Mar 13, 2025, rev. May 26, 2025 | 29 languages, 11,829 questions, 36 models, gaps up to 24.3% | Primary |
| 19 | Etxaniz et al., Think Better in English? — https://arxiv.org/abs/2308.01223 | Aug 2, 2023 | Self-translate beats direct inference | Primary |
| 20 | Schmidt et al., Tokenization Is More Than Compression — https://arxiv.org/abs/2402.18376 | Feb 2024, rev. Oct 2024 | Fewer tokens did not by themselves give better models | Primary; **counter-evidence** |
| 21 | Yong et al., Crosslingual Reasoning through Test-Time Scaling — https://arxiv.org/abs/2505.05408 | May 8, 2025 | Reasoning CoTs “naturally predominantly English”, “quote-and-think” pattern; weaker in low-resource languages | Primary, **R2**; **limit on the thesis** |
| 22 | UNC Taj Hindi, Personal Pronouns — https://tajhindi.unc.edu/2-1-personal-pronouns/ | undated | आप is always grammatically plural | Secondary |
| 23 | Limisiewicz et al., MYTE — https://arxiv.org/abs/2403.10691 | Mar 15, 2024 | Shorter, more even byte encodings across 99 languages | Primary |

Also opened in round 2 but not cited in the page: Google Gemini API pricing (https://ai.google.dev/gemini-api/docs/pricing, updated Oct 1, 2026; Gemini 3.1 Pro Preview $2/$12) — dropped because the tokenizer behind Gemini 3.x is not published, so no Gemini price could be multiplied by a measured count. Hugging Face model card for Qwen3.5-9B (https://huggingface.co/Qwen/Qwen3.5-9B, Feb 2026: 248,320 padded embedding, “201 languages and dialects”) — the page uses the measured vocabulary size from the tokenizer file instead. DeepSeek pricing page returned HTTP 400.

New in round 2: 4, 5, 11, 16, 21 (five), plus own measurements on five tokenizers that did not exist in round 1. New counter-evidence: 11 (tokenizer change raises English counts by ~30% at fixed price) and 21 (hidden reasoning in English limits where the premium is billed); the post also states that model choice moves the bill 12× against the language's 1.76× (from 13 and E2).

## Claims → source

- Opening: 17 / 30 / 85 (42 shards) / 39 / 23 tokens. E2, E3 → [1].
- Figure 1 (स्वीकृत on Qwen3 8 with 4 shards, Qwen3.5 4, o200k 3, Gemma 4 1; bytes). E4 → [1]; bytes [2].
- Qwen took cl100k as starting point [5]; first two-character Devanagari entry at 85,033 (Qwen3), 86,133 (cl100k), 148,465 (Qwen3.5), 820 (Gemma 4), 2,026 (o200k), 2,545 (Llama 4), 11,072 (DeepSeek-V3.1); Latin at 258–261. E6 → [1].
- Table 1 census counts (e.g. Gemma 4 Devanagari 13,754; o200k 3,963; Qwen3 67; Ethiopic 0 in cl100k and o200k; Qwen3 116 → Qwen3.5 25). E6 → [1].
- Fertility 1.72 vs 1.33 [6].
- Figure 3 running example: en 17 everywhere; de 24/26/24; ja 24/18/17; ar 23/26/21; hi 30/23/39; th 27/20/16 (o200k / Gemma 4 / Qwen3.5). E2 → [1].
- Table 2 premiums (all twelve languages, six vocabularies), Hindi 4.76 → 1.57, Thai 2.55 → 1.21 (Qwen3 → Qwen3.5), Amharic 4.05 → 4.38, Amharic range 1.94–5.97, Hindi range 1.31–2.80, Yoruba 2.17–2.83. E1 → [1] on [7].
- 7.36×, 1.88×, 8.92×, quote, r = 0.039, p = 0.891 [8]. “up to 15 times” [9]. Overcharging and affordability quotes [10].
- ~30% more tokens, price parity Opus 4.6/4.7 [11], [12].
- Gemma 4 identical to Gemma 3 on all twelve FLORES languages: E1 → [1]; “same tokenizer as Gemini 2.0” [4].
- Figure 5: window capacity (e.g. Amharic 834 vs English 4,820 on o200k; 2,465 vs 4,777 on Gemma 4) E1; receipt = tokens × $15 per 1M (gpt-5.4 output) and × $1.25 (gpt-5.4-nano) [13]; gpt-5 prefix → o200k_base [3], E5.
- Estimator rules [14], [11], [3]; ratios E1.
- Cache: 0.1×, five minutes, 100% identical [15]; reads refresh [11]; gpt-5.4 cached $0.25 vs $2.50 [13]. Figure 7 Thai arrival times are an explicitly labelled illustration.
- NFC decomposes U+095E [16], confirmed by E7; रिफ़ंड precomposed vs NFC: Gemma 4 3 vs 4, Llama 4 5 vs 4. E7 → [1]. प्रतिदाय 3 vs रिफ़ंड 4 on o200k (round 1 E4, re-run in E7).
- Table 4 rows: [17], [18], [19], [8], [20], [21]. The reasoning-token billing remark is labelled in the page as an inference.
- आप plural [22]. MYTE [23].

## Craft research

Round 1 (re-applied): Wikipedia “Signs of AI writing” (https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing); Paul Graham, “Write Simply”, Mar 2021 (https://www.paulgraham.com/simply.html); Julia Evans, “Patterns in confusing explanations”, Aug 2021 (https://jvns.ca/blog/confusing-explanations/); Nielsen Norman Group, F-shaped reading, reviewed Aug 2026 (https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/); Gary Provost on sentence length via Aerogramme, Aug 2014 (https://www.aerogrammestudio.com/2014/08/05/this-sentence-has-five-words/).

Round 2, new:

- Rougier, Droettboom, Bourne, “Ten Simple Rules for Better Figures”, PLOS Computational Biology, Sep 11, 2014 (https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003833). “The caption explains how to read the figure and provides additional precision for what cannot be graphically represented”; “Message trumps beauty”; ban decoration that tells nothing new. *Applied:* every figure has one message stated in the caption’s first sentence; text inside figures was cut to labels; the round 1 request-path boxes (sentences in boxes) were redrawn as five nodes with two-to-six-word labels; four multi-paragraph passages became tables.
- Gopen and Swan, “The Science of Scientific Writing”, American Scientist vol. 78 (1990), read at https://www.cs.tufts.edu/comp/105-2015s/readings/sci.html (search result confirmed the stress/topic-position passage; americanscientist.org returned 503). “Readers naturally emphasize the material that arrives at the end of a sentence.” *Applied:* sentences were reordered so the new number lands last (“…and 42 of them cannot be printed on their own”; “Gemma 4 does it in 23”); old information (the running sentence, Hindi) opens paragraphs as the topic.
- Owner review applied as an editing checklist: third-person sweep (`grep -i -E "\b(I|my|me|we|our|us)\b"` over the page text returned no prose hits), no em dashes in the page, a content preview with an honest read time, and a closing chapter that restates numbers and returns to the refund message.

Read time: 3,312 words of article text (prose, captions, tables, code, preview; excluding the token chips) ÷ 265 wpm = 12.5 min, plus image time for 12 figures/tables (12 s first, decreasing to 3 s) ≈ 1.3 min → **14 min**, as labelled.

## Experiments

All on 2026-10-05, Windows 11, Python 3.14.0, `tiktoken 0.14.0`, `tokenizers 0.23.1`. Scratch directory outside the entry.

Downloads:

```
curl -sL -o flores.tgz https://dl.fbaipublicfiles.com/nllb/flores200_dataset.tar.gz && tar xzf flores.tgz
curl -sL -o Qwen_Qwen3-8B.json            https://huggingface.co/Qwen/Qwen3-8B/resolve/main/tokenizer.json
curl -sL -o Qwen_Qwen3.5-9B.json          https://huggingface.co/Qwen/Qwen3.5-9B/resolve/main/tokenizer.json
curl -sL -o google_gemma-4-E4B-it.json    https://huggingface.co/google/gemma-4-E4B-it/resolve/main/tokenizer.json
curl -sL -o unsloth_gemma-3-4b-it.json    https://huggingface.co/unsloth/gemma-3-4b-it/resolve/main/tokenizer.json   # ungated mirror; google/ repo returned 401
curl -sL -o deepseek-ai_DeepSeek-V3.1.json https://huggingface.co/deepseek-ai/DeepSeek-V3.1/resolve/main/tokenizer.json
curl -sL -o unsloth_Llama-4-Scout-17B-16E-Instruct.json https://huggingface.co/unsloth/Llama-4-Scout-17B-16E-Instruct/resolve/main/tokenizer.json   # ungated mirror
```

Counting: tiktoken `len(enc.encode_ordinary(s))`; Hugging Face `len(Tokenizer.from_file(f).encode(s, add_special_tokens=False).ids)`.

- **E1 FLORES premiums (`m1.py`).** For eng_Latn, spa_Latn, deu_Latn, zho_Hans, jpn_Jpan, arb_Arab, hin_Deva, tha_Thai, tam_Taml, amh_Ethi, swh_Latn, yor_Latn, summed counts over `devtest/<lang>.devtest` (1,012 lines) on all eight tokenizers. Raw totals (cl100k, o200k, qwen3, qwen3.5, gemma3, gemma4, deepseek-v3.1, llama4):
  - eng 27182, 26873, 27621, 27530, 27114, 27114, 27041, 27048 (chars 131966, bytes 132096)
  - spa 41974, 35415, 42051, 36423, 35167, 35167, 40434, 35113
  - deu 43103, 35224, 43058, 36164, 36020, 36020, 40957, 35060
  - zho 50811, 33555, 27704, 25081, 29243, 29243, 25396, 28761 (chars 43251, bytes 120806)
  - jpn 61583, 44559, 38743, 32014, 32897, 32897, 38441, 35318 (chars 56943, bytes 167109)
  - arb 82288, 37117, 44991, 36040, 39885, 39885, 43713, 42973 (chars 116320, bytes 211276)
  - hin 129364, 42292, 121973, 55374, 35537, 35537, 75589, 44660 (chars 131079, bytes 337094)
  - tha 118297, 52781, 70455, 33319, 43646, 43646, 48115, 42318 (chars 126362, bytes 365110)
  - tam 207772, 53199, 168828, 71218, 39830, 39830, 83021, 101402 (chars 154133, bytes 421641)
  - amh 206404, 155290, 111737, 120491, 52552, 52552, 161525, 64726 (chars 87132, bytes 225450)
  - swh 53119, 39924, 53483, 50137, 44435, 44435, 52472, 45245
  - yor 80247, 58238, 74226, 71475, 65233, 65233, 76526, 67548
  - Window capacity = 128000 ÷ (tokens ÷ 1012). Estimator ratios = (chars ÷ 4) ÷ o200k and (bytes ÷ 4) ÷ o200k.
- **E2 running sentence (`m2.py`).** Six translations (round 1 texts, reconstructed from the o200k pieces) counted on o200k, Qwen3.5, Gemma 4, DeepSeek-V3.1, Llama 4, Qwen3: en 17 on all; de 24/24/26/30/26/30; ja 24/17/18/22/19/23; ar 23/21/26/28/28/30; hi 30/39/23/56/35/85; th 27/16/20/24/22/41.
- **E3 shards.** A token counts as a shard when `enc.decode_single_token_bytes(t)` fails UTF-8 decoding (tiktoken) or `tok.decode([id])` contains U+FFFD (Hugging Face). Hindi on Qwen3: 42 of 85. Pieces exported to the page’s viewer (`m4.py`) for o200k, Gemma 4 (`id_to_token`, ▁ → space), Qwen3.5, Qwen3.
- **E4 स्वीकृत** with a leading space on each tokenizer: Qwen3 8 (4 shards), Qwen3.5 4, o200k 3, Gemma 4 1, DeepSeek-V3.1 4, Llama 4 3.
- **E5** `tiktoken.encoding_name_for_model('gpt-5.4')` → `o200k_base`; `MODEL_PREFIX_TO_ENCODING['gpt-5'] == 'o200k_base'`; `gpt-6-sol` raises KeyError (no published mapping), so gpt-6 prices are not used in the page.
- **E6 vocabulary census (`m3.py`).** For each vocabulary entry (tiktoken `_mergeable_ranks` bytes decoded as UTF-8; Hugging Face `decode([id])` without U+FFFD), the first script matched by any character (Latin, Cyrillic, Arabic U+0600–06FF, Devanagari U+0900–097F, Tamil U+0B80–0BFF, Thai U+0E00–0E7F, Ethiopic U+1200–137F, Hangul syllables, CJK = kana U+3040–30FF + Han U+4E00–9FFF). “First two-character entry” = lowest index whose stripped text has ≥ 2 characters and matches the script. Index equals merge rank for tiktoken; for the Hugging Face files it is the published vocabulary index.
- **E7 normalization.** `unicodedata.normalize("NFC", "रिफ़ंड")` yields U+092B U+093C (decomposed); counts precomposed vs NFC: o200k 4/4, Qwen3.5 5/5, Gemma 4 3/4, DeepSeek-V3.1 6/6, Llama 4 5/4, Qwen3 7/7.
- **E8 rendering check.** Headless Chrome screenshots at 1440 px (light and dark) and inside a 390 px iframe; a probe confirmed only code blocks scroll horizontally.

## Registry leads

- Cost metering: price tables need a tokenizer-version axis, and the axis can move either way at a fixed per-token price (Anthropic: ~30% more tokens from Opus 4.7). (https://platform.claude.com/docs/en/about-claude/pricing)
- i18n / prefix caching: NFC is not “compose everything”. Devanagari nukta letters (U+0958–U+095F) are composition exclusions, so NFC decomposes them; cache-key builders and translation-memory exports must normalize with the same form. (https://www.unicode.org/reports/tr15/, E7)
- Model routing: per-locale cheapest vocabulary differs (Hindi: Gemma 4 1.31×; Thai: Qwen3.5 1.21×; Amharic: Gemma 4 1.94× vs DeepSeek-V3.1 5.97×), so routing tables should be keyed by (locale, tokenizer), measured on FLORES-like parallel text. (E1)
- Localization: a vocabulary upgrade can regress a low-resource language (Qwen3 → Qwen3.5 Amharic 4.05× → 4.38×) while improving others; re-measure per locale on every model upgrade. (E1)
- Product policy: token-denominated user quotas pass the token tax to end users; message- or character-denominated quotas avoid it. (argument in the page, built on [10])
