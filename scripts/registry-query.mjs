#!/usr/bin/env node
/**
 * registry-query - the command-line front door to the registry's one query core.
 *
 * Why this exists. Locating a technique used to mean reading knowledge/<domain>/index.json
 * (about 400K tokens for software-engineering) or slicing it with a throwaway `node -e`,
 * and the router that did exist (research-map.mjs) matched slugs, missed concepts that
 * live only in prose, and returned neither a technique's path nor its rule. This CLI asks
 * scripts/lib/registry-query.mjs instead: one budgeted query that returns, per hit, the
 * address, a one-line gist and the use_when triggers, ranked by BM25 over the bodies as
 * well as the frontmatter. Then `--read` opens one document - or one `## ` section of it -
 * under a token cap, and `--subject` prints a subject's whole card. Every answer states
 * its size; an empty answer says why it is empty.
 *
 * research-map.mjs stays: /research and /intake call it for placement (HOME IF NEW),
 * which this does not answer. This answers "where is the material on X, and what does
 * each candidate say", at a fraction of the reading.
 *
 * Usage:
 *   node scripts/registry-query.mjs "deciding whether a green audit means accessible"
 *   node scripts/registry-query.mjs --terms "rate limiting, retry budget" --domain software-engineering --top 5
 *   node scripts/registry-query.mjs "<terms>" [--domain d[,d]] [--top n] [--budget n] [--kinds technique,subject,law] [--json] [--rebuild]
 *   node scripts/registry-query.mjs --read <path> [--section "<heading>"] [--max-tokens n] [--json]
 *   node scripts/registry-query.mjs --subject <slug> [--domain d] [--json]
 *
 * The projection is cached in .cache/registry-route/ (gitignored) and rebuilt per bundle
 * whenever a file's size or mtime moves; `--rebuild` forces it.
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 answered - including an honest empty, which
 * prints `no match: <reason>`; 2 could not run (usage error, refused or missing path,
 * unknown section).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';
import {
  DEFAULT_TOP, DEFAULT_BUDGET_TOKENS, DEFAULT_READ_TOKENS,
  loadProjection, query, readDoc, subjectCard, formatHit, formatCard,
} from './lib/registry-query.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

const USAGE = [
  'usage: node scripts/registry-query.mjs "<terms...>" [--terms "a, b"] [--domain d[,d]] [--top n] [--budget n] [--kinds k[,k]] [--json] [--rebuild]',
  '       node scripts/registry-query.mjs --read <path> [--section "<heading>"] [--max-tokens n] [--json]',
  '       node scripts/registry-query.mjs --subject <slug> [--domain d] [--json]',
].join('\n');

const VALUED = new Set(['--terms', '--domain', '--top', '--budget', '--kinds', '--read', '--section', '--max-tokens', '--subject', '--root']);
const BOOL = new Set(['--json', '--rebuild', '--help', '-h']);

function usage(msg) {
  if (msg) console.error(`registry-query: ${msg}`);
  console.error(USAGE);
  process.exit(EXIT.FATAL);
}

const argv = process.argv.slice(2);
const opt = {};
const positional = [];
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (VALUED.has(a)) {
    if (i + 1 >= argv.length) usage(`${a} needs a value`);
    opt[a] = argv[++i];
  } else if (BOOL.has(a)) opt[a] = true;
  else if (a.startsWith('--')) usage(`unknown flag ${a}`);
  else positional.push(a);
}
if (opt['--help'] || opt['-h']) { console.log(USAGE); process.exit(EXIT.OK); }

const int = (name, d) => {
  if (opt[name] == null) return d;
  const n = Number(opt[name]);
  if (!Number.isInteger(n) || n <= 0) usage(`${name} must be a positive integer, got ${JSON.stringify(opt[name])}`);
  return n;
};

const root = opt['--root'] ? path.resolve(opt['--root']) : ROOT;
const asJson = Boolean(opt['--json']);
const modes = ['--read', '--subject'].filter((m) => opt[m] != null);
if (modes.length > 1) usage('--read and --subject are separate modes');

if (opt['--read'] != null) {
  if (positional.length) usage('--read takes a path, not terms');
  let doc;
  try {
    doc = readDoc(root, opt['--read'], { section: opt['--section'] ?? null, maxTokens: int('--max-tokens', DEFAULT_READ_TOKENS) });
  } catch (e) {
    console.error(e.message);
    process.exit(EXIT.FATAL);
  }
  if (asJson) console.log(JSON.stringify(doc, null, 1));
  else {
    console.log(doc.text);
    console.log(`\n[${doc.path}: ${doc.tokens} tokens${doc.truncated ? ', truncated' : ''}; sections: ${doc.sections.join(' | ') || '(none)'}]`);
  }
  process.exit(EXIT.OK);
}

const domain = opt['--domain'] ?? null;

if (opt['--subject'] != null) {
  if (positional.length) usage('--subject takes a slug, not terms');
  const projection = loadProjection(root, { domains: domain, rebuild: Boolean(opt['--rebuild']) });
  const card = subjectCard(projection, opt['--subject'], { domain });
  if (asJson) console.log(JSON.stringify(card, null, 1));
  else if (!card.subject) console.log(`no match: no subject "${opt['--subject']}"${domain ? ` in ${domain}` : ''}`);
  else {
    console.log(formatCard(card));
    console.log(`\n[${card.techniques.length} techniques; ${card.tokens} tokens]`);
  }
  process.exit(EXIT.OK);
}

if (opt['--section'] != null || opt['--max-tokens'] != null) usage('--section and --max-tokens belong to --read');
const terms = [...positional, ...String(opt['--terms'] ?? '').split(',')].map((t) => t.trim()).filter(Boolean);
if (!terms.length) usage('no terms given');

const projection = loadProjection(root, { domains: domain, rebuild: Boolean(opt['--rebuild']) });
const result = query(projection, terms, {
  domains: domain,
  top: int('--top', DEFAULT_TOP),
  budgetTokens: int('--budget', DEFAULT_BUDGET_TOKENS),
  kinds: opt['--kinds'] ?? null,
});

if (asJson) {
  console.log(JSON.stringify(result, null, 1));
} else if (!result.hits.length) {
  console.log(`no match: ${result.empty_reason}`);
} else {
  console.log(result.hits.map(formatHit).join('\n'));
  console.log(`\n[${result.hits.length} hit(s), ${result.tokens} tokens${result.truncated ? ', truncated - raise --top/--budget for more' : ''}; read one: --read <path> [--section "<heading>"]]`);
}
process.exit(EXIT.OK);
