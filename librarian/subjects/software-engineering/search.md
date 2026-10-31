---
subject: search
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# search

First note for the subject. Created by intake run `intake-chatterino2` (2.3.2) on 2026-09-03; the subject predates it.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

New technique `typed-filter-language`: a user-authored filter expression language typed at
parse time, so an ill-typed expression is refused before it is evaluated and the hot path
never branches on type. The landing worker checked the boundary the front half flagged (a
chat filter is not a search query) against `query-parsing` and the alerting subject's
rule-authoring validation, and kept it here because the forces are the end-user author
and the hot path, which this subject's golden path states. `cpp--typed-filter-language`
application. Unapplied in the fleet: no project has a user-authored filter language.

## 2026-09-24 - intake `intake-tin-0923` (2.14.1)

Source: a vendor's announcement of an in-database text index (`2026-09-24-introducing-tin`).
`full-text-indexing` gained a section: index-or-scan is decided per result contract
(ranked page, exhaustive set, exact count) and per query shape, because a ranked page
visits every match, a phrase visits its words' conjunction and a common-word OR visits
nearly the corpus. Authorized by a paired measurement in politicas, not by the source:
speedup 150-234x at zero matches, 13-25x counting / 4-11x ranking at 1-3%, about 1x
past a quarter; floor (identical results) held 24/24. `node--full-text-indexing`
application, `applied: experiment`, `better`. Boundary kept: the exhaustive and count
contracts are the golden path's Filter intent, so the golden path's opening stands and
only the engine consequence landed. Open: nothing in the corpus owns engine internals
(host-locator postings, page bitmaps, index-only counts) - lead L1 in the source note.

### 2026-10-15 - intake coding_agent_session_search (run dle-004-1015, series DLE-004)

Catch, recorded as `rust--full-text-indexing--cass.md`: count-certified publication where an unobservable count fails (a hollow index once served 3 documents against about 1M), the source count run through the index's own noise filter, and a swap-then-verify path that may leave a window (unconfirmed).

## Architecture review - 2026-10-31

First architecture review of the subject, against `fe690782a`. The pipeline, the three
intents and the seven techniques hold. Primary sources confirm the vendor figures behind
`full-text-indexing` and the FTS5 external-content mechanics behind "measure the index
through its own storage". Four clarify items: the golden path omits `typed-filter-language`
from its closing list and overstates the one-second limit; `full-text-indexing` says ranking
halved the speedup "at every match fraction", which its own source table contradicts at 0%;
a typo in `faceting-and-filters`; and the cpp application cites two technique rules that the
technique does not contain. The five other applications rest on private or unreopened trees
and stay `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/search",
  "date": "2026-10-31",
  "baseline": "fe690782a",
  "digest": "sha256-b2:395e660a5e607abe",
  "disposition": "clarify",
  "coverage": "All 14 documents read in full (golden path, 7 techniques, 6 applications); first architecture review of this subject. Five primary sources opened; three of them confirm load-bearing figures or mechanisms, one refutes a wording. Not evaluated: any private application tree, the cass tree, any runtime. No verification date was refreshed.",
  "counterexamples": [
    "A search box whose input is a program (a saved routing or display rule) must refuse an ill-typed expression rather than search it as literal text; query-parsing's literal fallback is wrong there, which is why typed-filter-language owns the inverse rule.",
    "Over 200,000 documents an index beat a scan 150-234x at zero matches and about 1x once a quarter of the corpus matched; a benchmark of rare single terms says nothing about ranked, phrase or common-word queries.",
    "A drift check on an external-content FTS5 index that counts through the virtual table compares the source against itself, because a query without MATCH is passed through to the content table; only the index's own storage can disagree.",
    "A personal-scale corpus scanned in memory needs no index, and a mandatory tenant predicate can make a million-row store a two-thousand-row scan."
  ],
  "sources": [
    {
      "url": "https://www.nngroup.com/articles/response-times-3-important-limits/",
      "result": "Read 2026-10-31. 0.1 s 'is about the limit for having the user feel that the system is reacting instantaneously'; 1.0 s 'is about the limit for the user's flow of thought to stay uninterrupted, even though the user will notice the delay'. Supports the 100 ms figure; refutes 'feels broken above roughly a second' as worded (1 s is where flow breaks, not where the system reads as broken)."
    },
    {
      "url": "https://planetscale.com/blog/introducing-tin",
      "result": "Read 2026-10-31. On the 150M-document Stack Exchange corpus, Postgres GIN (ranked with ts_rank_cd) ran '0.4' queries per second with p99 '288,066ms' on top-10 conjunction and phrase queries, and 'GIN can't complete this benchmark, because it runs out of memory performing the disjunction searches'. Supports full-text-indexing's 'under one ranked query a second, with a p99 near five minutes and disjunctions exhausting memory'. The post itself does not discuss score pruning; 'without score pruning' is the technique's characterization of GIN plus ts_rank_cd, not a quote."
    },
    {
      "url": "https://www.sqlite.org/fts5.html",
      "result": "Read 2026-10-31. External content: 'If the query does not use the full-text index - does not contain a MATCH operator ... - then the query is effectively passed through to the external content table'; the column-size table is '<name>_docsize'; 'rebuild' 'deletes the entire full-text index, then rebuilds it based on the contents of the table or content table'; snippet's last argument 'must be greater than zero and equal to or less than 64'. Supports the mechanism behind 'measure the index through its own storage' and the rust application's docsize fix, rebuild command and snippet call."
    },
    {
      "url": "https://vector.dev/docs/reference/vrl/",
      "result": "Read 2026-10-31. 'VRL implements progressive type safety, erroring at compilation-time if a type mismatch is detected.' Corroborates typed-filter-language's claim that log-pipeline expression languages type at save/compile time; note VRL's typing is 'progressive' (only where the type is known), i.e. the partial-typing boundary the technique names."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2 at fda51f0d3a4a5cd15f099b951b796e299d566e9e",
      "result": "Read 2026-10-31: src/controllers/filters/FilterSet.cpp ('if (!f->valid() || !f->filter(ctx)) { return false; }', so an invalid record fails closed) and lang/expressions/IdentifierExpression.cpp ('// FIXME: Return an error here immediately instead of failing when type-checking.'; flags.elevated_message and flags.hype_chat typed Bool returning false under '// Feature deprecated by Twitch in 2023'). Supports the cpp application's fail-closed, two-table and deprecated-constant readings. Line numbers and the 37-name count were not re-checked."
    },
    {
      "source": "Internal cross-check: full-text-indexing.md against applications/node--full-text-indexing.md",
      "result": "The application's table shows count 150-234x versus top-10 190-208x at 0% matched, so ranking did not halve the advantage there; its own prose says ranking halves the speedup 'once matches number in the thousands'. The technique's 'at every match fraction' overstates its source. The quoted 21x / 9x at 2% sit inside the 0.7-3% row (13-25x, 4-11x)."
    }
  ],
  "documents": {
    "search.md": {
      "disposition": "clarify",
      "reason": "Golden path: the closing technique list omits typed-filter-language although the frontmatter lists seven techniques; add its bullet. The latency budget says search 'feels broken above roughly a second', but the cited limit is where the user's flow of thought is interrupted, not where the system reads as broken; reword to the source."
    },
    "techniques/query-parsing.md": {
      "disposition": "keep",
      "reason": "One door owning both escaping and matching policy, the injection-versus-policy split, tokenize-then-quote with bounds, the labelled degradation ladder and failure-not-previous-results are coherent and are what the next and rust applications measure against."
    },
    "techniques/full-text-indexing.md": {
      "disposition": "clarify",
      "reason": "The 150M-document vendor figures are confirmed (0.4 qps, p99 288 s, GIN out of memory on disjunctions). 'ranking roughly halved the index's advantage over a scan at every match fraction' contradicts its own source table at 0% matched (count 150-234x, top-10 190-208x); narrow to 'once matches numbered in the thousands', the application's own wording."
    },
    "techniques/ranking-and-excerpts.md": {
      "disposition": "keep",
      "reason": "BM25 framing, written-down signal combination, total order ending in identity (with the label-as-tiebreak near-miss), engine-derived highlighting and escape-then-mark are correct and stable."
    },
    "techniques/faceting-and-filters.md": {
      "disposition": "clarify",
      "reason": "Content sound. One verified typo: 'become unfilterable-to precisely because they are new' should read 'become unfilterable precisely because they are new'."
    },
    "techniques/saved-views.md": {
      "disposition": "keep",
      "reason": "Predicate-not-results, parsed-form persistence, identity independent of name, dirty state and visible degradation on schema drift are sound; no unstable external claim."
    },
    "techniques/command-surface.md": {
      "disposition": "keep",
      "reason": "Blind-enter contract, one registry, boundary/consecutive scoring with a floor, the banded simplification with its tiebreak obligation, and prior-within-matched-set are coherent; the react application is read against exactly this text."
    },
    "techniques/typed-filter-language.md": {
      "disposition": "keep",
      "reason": "Typing pass at storage, boolean root, located verdicts, and the deliberate inversion of query-parsing's fallback hold. The convergence claim is corroborated for log pipelines by Vector's VRL ('erroring at compilation-time if a type mismatch is detected'), with VRL's 'progressive' typing matching the partial-typing boundary. _laws.md anchors resolve."
    },
    "applications/cpp--typed-filter-language.md": {
      "disposition": "clarify",
      "reason": "Fail-closed FilterSet, the FIXME and the deprecated constants confirmed at the pinned commit. Two sentences cite rules the technique does not contain: 'The technique's \"evaluator asserts on a type it was not promised\" test would fail here' (the technique now says 'The evaluator may keep defensive branches' provided an accepted program never takes them) and 'the technique's retire-as-constant rule, met' (no such rule). Reword both to match the current technique."
    },
    "applications/next--query-parsing.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique (ten-site table, the 250 ms debounce against the 300 ms figure, the failure-as-previous-answer finding). All citations are in a private tree at 62c252dd that was not reopened."
    },
    "applications/node--full-text-indexing.md": {
      "disposition": "reverify",
      "reason": "Its table is the source of the technique's figures and is internally consistent. The private tree at 74eb3c0 and its benchmark runs were not reopened."
    },
    "applications/react--command-surface.md": {
      "disposition": "reverify",
      "reason": "Consistent with the technique's banded-scheme and tiebreak text; no verified_against and a 2026-08-18 date; private tree not reopened."
    },
    "applications/rust--full-text-indexing--cass.md": {
      "disposition": "reverify",
      "reason": "Its additions (unobservable count fails, source count through the derivation's filter, maintenance cost in the index-or-scan decision) are coherent and its staged-path window is honestly marked unconfirmed. The cass tree at 7fc01958d367 was not reopened, so the window remains unconfirmed."
    },
    "applications/rust--full-text-indexing.md": {
      "disposition": "reverify",
      "reason": "The FTS5 mechanics it relies on are confirmed by the SQLite docs (non-MATCH queries pass through to the content table, the _docsize table, 'rebuild', snippet tokens <= 64, so 18 is valid). The application's own file and line citations are in a private tree not reopened this run."
    }
  }
}
```

Applied the same day: the four clarify items above landed (golden path list and latency
wording, the full-text-indexing match-fraction scope, the facet typo, the cpp
application's two technique references). The re-record below is against the edited bytes;
the overall disposition moves to `reverify` because five applications still rest on trees
this run did not reopen.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/search",
  "date": "2026-10-31",
  "baseline": "fe690782a",
  "digest": "sha256-b2:7850f3d9bed392bc",
  "disposition": "reverify",
  "coverage": "All 14 documents decided. The four clarify items of the earlier 2026-10-31 record were applied and the edited passages re-read; other documents are byte-unchanged and keep their dispositions. The five private or unreopened application trees remain reverify. No verification date was refreshed.",
  "counterexamples": [
    "A search box whose input is a program (a saved routing or display rule) must refuse an ill-typed expression rather than search it as literal text; query-parsing's literal fallback is wrong there, which is why typed-filter-language owns the inverse rule.",
    "Over 200,000 documents an index beat a scan 150-234x at zero matches and about 1x once a quarter of the corpus matched; a benchmark of rare single terms says nothing about ranked, phrase or common-word queries.",
    "A drift check on an external-content FTS5 index that counts through the virtual table compares the source against itself, because a query without MATCH is passed through to the content table; only the index's own storage can disagree.",
    "A personal-scale corpus scanned in memory needs no index, and a mandatory tenant predicate can make a million-row store a two-thousand-row scan."
  ],
  "sources": [
    {
      "url": "https://www.nngroup.com/articles/response-times-3-important-limits/",
      "result": "Read 2026-10-31. 0.1 s 'is about the limit for having the user feel that the system is reacting instantaneously'; 1.0 s 'is about the limit for the user's flow of thought to stay uninterrupted, even though the user will notice the delay'. Supports the 100 ms figure; refutes 'feels broken above roughly a second' as worded (1 s is where flow breaks, not where the system reads as broken)."
    },
    {
      "url": "https://planetscale.com/blog/introducing-tin",
      "result": "Read 2026-10-31. On the 150M-document Stack Exchange corpus, Postgres GIN (ranked with ts_rank_cd) ran '0.4' queries per second with p99 '288,066ms' on top-10 conjunction and phrase queries, and 'GIN can't complete this benchmark, because it runs out of memory performing the disjunction searches'. Supports full-text-indexing's 'under one ranked query a second, with a p99 near five minutes and disjunctions exhausting memory'. The post itself does not discuss score pruning; 'without score pruning' is the technique's characterization of GIN plus ts_rank_cd, not a quote."
    },
    {
      "url": "https://www.sqlite.org/fts5.html",
      "result": "Read 2026-10-31. External content: 'If the query does not use the full-text index - does not contain a MATCH operator ... - then the query is effectively passed through to the external content table'; the column-size table is '<name>_docsize'; 'rebuild' 'deletes the entire full-text index, then rebuilds it based on the contents of the table or content table'; snippet's last argument 'must be greater than zero and equal to or less than 64'. Supports the mechanism behind 'measure the index through its own storage' and the rust application's docsize fix, rebuild command and snippet call."
    },
    {
      "url": "https://vector.dev/docs/reference/vrl/",
      "result": "Read 2026-10-31. 'VRL implements progressive type safety, erroring at compilation-time if a type mismatch is detected.' Corroborates typed-filter-language's claim that log-pipeline expression languages type at save/compile time; note VRL's typing is 'progressive' (only where the type is known), i.e. the partial-typing boundary the technique names."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2 at fda51f0d3a4a5cd15f099b951b796e299d566e9e",
      "result": "Read 2026-10-31: src/controllers/filters/FilterSet.cpp ('if (!f->valid() || !f->filter(ctx)) { return false; }', so an invalid record fails closed) and lang/expressions/IdentifierExpression.cpp ('// FIXME: Return an error here immediately instead of failing when type-checking.'; flags.elevated_message and flags.hype_chat typed Bool returning false under '// Feature deprecated by Twitch in 2023'). Supports the cpp application's fail-closed, two-table and deprecated-constant readings. Line numbers and the 37-name count were not re-checked."
    },
    {
      "source": "Internal cross-check: full-text-indexing.md against applications/node--full-text-indexing.md",
      "result": "The application's table shows count 150-234x versus top-10 190-208x at 0% matched, so ranking did not halve the advantage there; its own prose says ranking halves the speedup 'once matches number in the thousands'. The technique's 'at every match fraction' overstates its source. The quoted 21x / 9x at 2% sit inside the 0.7-3% row (13-25x, 4-11x)."
    }
  ],
  "documents": {
    "search.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the typed-filter-language bullet to the closing technique list; 'feels broken above roughly a second' now reads 'interrupts the user's flow of thought above roughly a second', per the Nielsen limit."
    },
    "techniques/query-parsing.md": {
      "disposition": "keep",
      "reason": "One door owning both escaping and matching policy, the injection-versus-policy split, tokenize-then-quote with bounds, the labelled degradation ladder and failure-not-previous-results are coherent and are what the next and rust applications measure against."
    },
    "techniques/full-text-indexing.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'ranking roughly halved the index's advantage over a scan at every match fraction' now reads '... once matches numbered in the thousands', matching the source table (no halving at 0% matched). Vendor figures confirmed unchanged."
    },
    "techniques/ranking-and-excerpts.md": {
      "disposition": "keep",
      "reason": "BM25 framing, written-down signal combination, total order ending in identity (with the label-as-tiebreak near-miss), engine-derived highlighting and escape-then-mark are correct and stable."
    },
    "techniques/faceting-and-filters.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'unfilterable-to precisely' corrected to 'unfilterable precisely'."
    },
    "techniques/saved-views.md": {
      "disposition": "keep",
      "reason": "Predicate-not-results, parsed-form persistence, identity independent of name, dirty state and visible degradation on schema drift are sound; no unstable external claim."
    },
    "techniques/command-surface.md": {
      "disposition": "keep",
      "reason": "Blind-enter contract, one registry, boundary/consecutive scoring with a floor, the banded simplification with its tiebreak obligation, and prior-within-matched-set are coherent; the react application is read against exactly this text."
    },
    "techniques/typed-filter-language.md": {
      "disposition": "keep",
      "reason": "Typing pass at storage, boolean root, located verdicts, and the deliberate inversion of query-parsing's fallback hold. The convergence claim is corroborated for log pipelines by Vector's VRL ('erroring at compilation-time if a type mismatch is detected'), with VRL's 'progressive' typing matching the partial-typing boundary. _laws.md anchors resolve."
    },
    "applications/cpp--typed-filter-language.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the coercing evaluator is now read against the technique's 'may keep defensive branches' boundary (permitted; the residual cost is a silent default rather than an assert under a checker hole), and the deprecated-field paragraph no longer cites a nonexistent 'retire-as-constant rule'. Three citations re-read at the pinned commit; line numbers and the 37-name count not re-checked, so verified_on stays 2026-09-03."
    },
    "applications/next--query-parsing.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique (ten-site table, the 250 ms debounce against the 300 ms figure, the failure-as-previous-answer finding). All citations are in a private tree at 62c252dd that was not reopened."
    },
    "applications/node--full-text-indexing.md": {
      "disposition": "reverify",
      "reason": "Its table is the source of the technique's figures and is internally consistent. The private tree at 74eb3c0 and its benchmark runs were not reopened."
    },
    "applications/react--command-surface.md": {
      "disposition": "reverify",
      "reason": "Consistent with the technique's banded-scheme and tiebreak text; no verified_against and a 2026-08-18 date; private tree not reopened."
    },
    "applications/rust--full-text-indexing--cass.md": {
      "disposition": "reverify",
      "reason": "Its additions (unobservable count fails, source count through the derivation's filter, maintenance cost in the index-or-scan decision) are coherent and its staged-path window is honestly marked unconfirmed. The cass tree at 7fc01958d367 was not reopened, so the window remains unconfirmed."
    },
    "applications/rust--full-text-indexing.md": {
      "disposition": "reverify",
      "reason": "The FTS5 mechanics it relies on are confirmed by the SQLite docs (non-MATCH queries pass through to the content table, the _docsize table, 'rebuild', snippet tokens <= 64, so 18 is valid). The application's own file and line citations are in a private tree not reopened this run."
    }
  }
}
```

Record following re-verification of applications (react and rust FTS applications re-checked against personas@22260d77 by a separate worker); overall stays `reverify` for the three applications on unreopened trees.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/search",
  "date": "2026-10-31",
  "baseline": "96dec842b",
  "digest": "sha256-b2:7d7797dcec503703",
  "disposition": "reverify",
  "coverage": "All 14 documents decided. Since the previous record only the react and rust (execution FTS) applications changed, in the re-verification commit against personas@22260d77: line numbers re-anchored, verified_on moved to 2026-10-31, no finding changed. Their cited lines were spot-read at that commit and hold (the docsize drift count with != and skip-on-unreadable, build_fts5_query, the bm25-then-created_at order, fuzzyScore bands, the score-only sorts). The other 12 documents are byte-unchanged and carry their dispositions. Three applications on unreopened trees remain reverify.",
  "counterexamples": [
    "A search box whose input is a program (a saved routing or display rule) must refuse an ill-typed expression rather than search it as literal text; query-parsing's literal fallback is wrong there, which is why typed-filter-language owns the inverse rule.",
    "Over 200,000 documents an index beat a scan 150-234x at zero matches and about 1x once a quarter of the corpus matched; a benchmark of rare single terms says nothing about ranked, phrase or common-word queries.",
    "A drift check on an external-content FTS5 index that counts through the virtual table compares the source against itself, because a query without MATCH is passed through to the content table; only the index's own storage can disagree.",
    "A personal-scale corpus scanned in memory needs no index, and a mandatory tenant predicate can make a million-row store a two-thousand-row scan."
  ],
  "sources": [
    {
      "url": "https://www.nngroup.com/articles/response-times-3-important-limits/",
      "result": "Read 2026-10-31. 0.1 s 'is about the limit for having the user feel that the system is reacting instantaneously'; 1.0 s 'is about the limit for the user's flow of thought to stay uninterrupted, even though the user will notice the delay'. Supports the 100 ms figure; refutes 'feels broken above roughly a second' as worded (1 s is where flow breaks, not where the system reads as broken)."
    },
    {
      "url": "https://planetscale.com/blog/introducing-tin",
      "result": "Read 2026-10-31. On the 150M-document Stack Exchange corpus, Postgres GIN (ranked with ts_rank_cd) ran '0.4' queries per second with p99 '288,066ms' on top-10 conjunction and phrase queries, and 'GIN can't complete this benchmark, because it runs out of memory performing the disjunction searches'. Supports full-text-indexing's 'under one ranked query a second, with a p99 near five minutes and disjunctions exhausting memory'. The post itself does not discuss score pruning; 'without score pruning' is the technique's characterization of GIN plus ts_rank_cd, not a quote."
    },
    {
      "url": "https://www.sqlite.org/fts5.html",
      "result": "Read 2026-10-31. External content: 'If the query does not use the full-text index - does not contain a MATCH operator ... - then the query is effectively passed through to the external content table'; the column-size table is '<name>_docsize'; 'rebuild' 'deletes the entire full-text index, then rebuilds it based on the contents of the table or content table'; snippet's last argument 'must be greater than zero and equal to or less than 64'. Supports the mechanism behind 'measure the index through its own storage' and the rust application's docsize fix, rebuild command and snippet call."
    },
    {
      "url": "https://vector.dev/docs/reference/vrl/",
      "result": "Read 2026-10-31. 'VRL implements progressive type safety, erroring at compilation-time if a type mismatch is detected.' Corroborates typed-filter-language's claim that log-pipeline expression languages type at save/compile time; note VRL's typing is 'progressive' (only where the type is known), i.e. the partial-typing boundary the technique names."
    },
    {
      "url": "https://github.com/Chatterino/chatterino2 at fda51f0d3a4a5cd15f099b951b796e299d566e9e",
      "result": "Read 2026-10-31: src/controllers/filters/FilterSet.cpp ('if (!f->valid() || !f->filter(ctx)) { return false; }', so an invalid record fails closed) and lang/expressions/IdentifierExpression.cpp ('// FIXME: Return an error here immediately instead of failing when type-checking.'; flags.elevated_message and flags.hype_chat typed Bool returning false under '// Feature deprecated by Twitch in 2023'). Supports the cpp application's fail-closed, two-table and deprecated-constant readings. Line numbers and the 37-name count were not re-checked."
    },
    {
      "source": "Internal cross-check: full-text-indexing.md against applications/node--full-text-indexing.md",
      "result": "The application's table shows count 150-234x versus top-10 190-208x at 0% matched, so ranking did not halve the advantage there; its own prose says ranking halves the speedup 'once matches number in the thousands'. The technique's 'at every match fraction' overstates its source. The quoted 21x / 9x at 2% sit inside the 0.7-3% row (13-25x, 4-11x)."
    }
  ],
  "documents": {
    "search.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the typed-filter-language bullet to the closing technique list; 'feels broken above roughly a second' now reads 'interrupts the user's flow of thought above roughly a second', per the Nielsen limit."
    },
    "techniques/query-parsing.md": {
      "disposition": "keep",
      "reason": "One door owning both escaping and matching policy, the injection-versus-policy split, tokenize-then-quote with bounds, the labelled degradation ladder and failure-not-previous-results are coherent and are what the next and rust applications measure against."
    },
    "techniques/full-text-indexing.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'ranking roughly halved the index's advantage over a scan at every match fraction' now reads '... once matches numbered in the thousands', matching the source table (no halving at 0% matched). Vendor figures confirmed unchanged."
    },
    "techniques/ranking-and-excerpts.md": {
      "disposition": "keep",
      "reason": "BM25 framing, written-down signal combination, total order ending in identity (with the label-as-tiebreak near-miss), engine-derived highlighting and escape-then-mark are correct and stable."
    },
    "techniques/faceting-and-filters.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'unfilterable-to precisely' corrected to 'unfilterable precisely'."
    },
    "techniques/saved-views.md": {
      "disposition": "keep",
      "reason": "Predicate-not-results, parsed-form persistence, identity independent of name, dirty state and visible degradation on schema drift are sound; no unstable external claim."
    },
    "techniques/command-surface.md": {
      "disposition": "keep",
      "reason": "Blind-enter contract, one registry, boundary/consecutive scoring with a floor, the banded simplification with its tiebreak obligation, and prior-within-matched-set are coherent; the react application is read against exactly this text."
    },
    "techniques/typed-filter-language.md": {
      "disposition": "keep",
      "reason": "Typing pass at storage, boolean root, located verdicts, and the deliberate inversion of query-parsing's fallback hold. The convergence claim is corroborated for log pipelines by Vector's VRL ('erroring at compilation-time if a type mismatch is detected'), with VRL's 'progressive' typing matching the partial-typing boundary. _laws.md anchors resolve."
    },
    "applications/cpp--typed-filter-language.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the coercing evaluator is now read against the technique's 'may keep defensive branches' boundary (permitted; the residual cost is a silent default rather than an assert under a checker hole), and the deprecated-field paragraph no longer cites a nonexistent 'retire-as-constant rule'. Three citations re-read at the pinned commit; line numbers and the 37-name count not re-checked, so verified_on stays 2026-09-03."
    },
    "applications/next--query-parsing.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique (ten-site table, the 250 ms debounce against the 300 ms figure, the failure-as-previous-answer finding). All citations are in a private tree at 62c252dd that was not reopened."
    },
    "applications/node--full-text-indexing.md": {
      "disposition": "reverify",
      "reason": "Its table is the source of the technique's figures and is internally consistent. The private tree at 74eb3c0 and its benchmark runs were not reopened."
    },
    "applications/react--command-surface.md": {
      "disposition": "keep",
      "reason": "re-verified 2026-10-31 against personas@22260d77: citations re-anchored (commandPaletteUtils.ts :22-23, :25-27, :126-139; CommandPalette.tsx :241-242 ... :330-331) and the banded fuzzyScore and score-only sort without a tiebreak still read as described."
    },
    "applications/rust--full-text-indexing--cass.md": {
      "disposition": "reverify",
      "reason": "Its additions (unobservable count fails, source count through the derivation's filter, maintenance cost in the index-or-scan decision) are coherent and its staged-path window is honestly marked unconfirmed. The cass tree at 7fc01958d367 was not reopened, so the window remains unconfirmed."
    },
    "applications/rust--full-text-indexing.md": {
      "disposition": "keep",
      "reason": "re-verified 2026-10-31 against personas@22260d77: citations re-anchored (lib.rs :548-625, executions.rs :374-382, :673-735); the docsize-counted drift check with != and skip-on-unreadable, the tokenize-quote-OR door with its 2-char and 12-term bounds, and the bm25-then-created_at order hold, so the stops-short findings stand. FTS5 mechanics confirmed by the SQLite docs."
    }
  }
}
```
