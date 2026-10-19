// ado-map - the pure half of ado.mjs: Azure DevOps work items <-> lens-scan proposals, with no I/O.
//
// WHY a separate module: the mapping is the contract (takeover-app references/ado-sync.md, the store v4 wire
// contract), and it has to be pinned by tests on a recorded fixture without a network, a PAT or a store. Every
// function here takes plain data and returns plain data; ado.mjs does the HTTP, the files and the store writes.
//
// Import (ADO -> proposal), per work item:
//   feature   the area path's last segment matched to a feature slug, feature name or context name of the
//             app-structure (case-insensitive, also slug-compared); an overlay areaPathMap entry wins (keyed by
//             the full area path or its last segment); else `backlog`
//   lens      'security' when the tags carry security; else 'quality' for a Bug; else 'business'
//   kind      'work-item', origin 'ado', external_ref 'ado:<id>', external_url <org>/<project>/_workitems/edit/<id>
//   title     System.Title
//   body      description (HTML stripped; a Bug's repro steps when it has no description) + acceptance criteria +
//             state + assigned-to DISPLAY NAME (never the unique name: that is an email address)
//   tier      Severity '1 - Critical' -> 0; else Priority 1 -> 1, 2 -> 2, 3|4 -> 3; else untriaged (absent)
//   riskClass 'authz' for a security tag; 'reliability' for a Bug; else absent (the triage phase classifies it)
// Write-back (proposal -> ADO) builds JSON-patch payloads only; ado.mjs decides whether one is ever sent.

export const API_VERSION = '7.1';
export const COMMENTS_API_VERSION = '7.1-preview.4';
export const BATCH_SIZE = 200;
export const BACKLOG_FEATURE = 'backlog';

export const FIELDS = [
  'System.Id', 'System.WorkItemType', 'System.Title', 'System.State', 'System.AreaPath', 'System.Tags',
  'System.AssignedTo', 'System.Description', 'System.ChangedDate', 'System.Rev',
  'Microsoft.VSTS.Common.AcceptanceCriteria', 'Microsoft.VSTS.TCM.ReproSteps',
  'Microsoft.VSTS.Common.Priority', 'Microsoft.VSTS.Common.Severity',
];

const slug = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
/** HTML (an ADO rich-text field) to plain text: block ends become newlines, tags go, entities decode. */
export function stripHtml(html) {
  if (html === undefined || html === null) return '';
  return String(html)
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '\n- ')
    .replace(/<\s*\/\s*(p|div|h[1-6]|tr|ul|ol|table)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') {
        const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/[ \t ]+/g, ' ')
    .split('\n').map((l) => l.trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** System.Tags is "a; b; c". */
export const tagsOf = (wi) => String(wi?.fields?.['System.Tags'] ?? '').split(';').map((t) => t.trim()).filter(Boolean);
const isSecurity = (tags) => tags.some((t) => /^security$|^sec$|security/i.test(t));

/** An org given as a name or a URL -> the collection base URL, no trailing slash. */
export function orgBase(org) {
  const o = String(org ?? '').trim();
  if (!o) return '';
  if (/^https?:\/\//i.test(o)) return o.replace(/\/+$/, '');
  return `https://dev.azure.com/${encodeURIComponent(o)}`;
}
export const projectBase = (org, project) => `${orgBase(org)}/${encodeURIComponent(String(project ?? '').trim())}`;
export const workItemUrl = (org, project, id) => `${projectBase(org, project)}/_workitems/edit/${id}`;

/** Severity '1 - Critical' -> 0; Priority 1 -> 1, 2 -> 2, 3|4 -> 3; anything else untriaged (undefined). */
export function tierOf(fields = {}) {
  const sev = String(fields['Microsoft.VSTS.Common.Severity'] ?? '');
  if (/^\s*1\b/.test(sev) || /critical/i.test(sev)) return 0;
  const p = Number(fields['Microsoft.VSTS.Common.Priority']);
  if (p === 1) return 1;
  if (p === 2) return 2;
  if (p === 3 || p === 4) return 3;
  return undefined;
}

/**
 * The feature index an area path is matched against: every feature's slug and name, and its contexts' names,
 * lower-cased and slugged. `structure` is an app-structure (or just {features: [...]}); absent, nothing matches.
 */
export function featureIndex(structure) {
  const idx = new Map();
  for (const f of structure?.features ?? []) {
    if (typeof f?.slug !== 'string') continue;
    for (const key of [f.slug, f.name, ...(f.contexts ?? [])]) {
      if (typeof key !== 'string' || !key.trim()) continue;
      for (const k of [key.trim().toLowerCase(), slug(key)]) if (k && !idx.has(k)) idx.set(k, f.slug);
    }
  }
  return idx;
}

/** Area path -> feature slug: the overlay map (full path, then last segment), then the feature index, else backlog. */
export function featureOf(areaPath, index, areaPathMap = {}) {
  const path = String(areaPath ?? '').trim();
  const last = path.split('\\').filter(Boolean).pop() ?? '';
  const map = new Map(Object.entries(areaPathMap ?? {}).map(([k, v]) => [k.trim().toLowerCase(), v]));
  for (const k of [path.toLowerCase(), last.toLowerCase()]) if (k && map.has(k)) return String(map.get(k));
  for (const k of [last.toLowerCase(), slug(last)]) if (k && index?.has(k)) return index.get(k);
  return BACKLOG_FEATURE;
}

const displayName = (v) => (v && typeof v === 'object' ? v.displayName : typeof v === 'string' ? v.replace(/\s*<[^>]*>\s*$/, '') : undefined);

/** One work item (a workitemsbatch `value[]` entry) -> the propose() options of the store v4 contract. */
export function mapWorkItem(wi, { org, project, index, areaPathMap } = {}) {
  const f = wi?.fields ?? {};
  const id = wi?.id ?? f['System.Id'];
  if (id === undefined || id === null || !Number.isInteger(Number(id))) throw new Error(`work item without an integer id: ${JSON.stringify(wi).slice(0, 120)}`);
  const type = String(f['System.WorkItemType'] ?? '');
  const tags = tagsOf(wi);
  const security = isSecurity(tags);
  const bug = /^bug$/i.test(type);
  const description = stripHtml(f['System.Description']) || (bug ? stripHtml(f['Microsoft.VSTS.TCM.ReproSteps']) : '');
  const ac = stripHtml(f['Microsoft.VSTS.Common.AcceptanceCriteria']);
  const who = displayName(f['System.AssignedTo']);
  const parts = [];
  if (description) parts.push(description);
  if (ac) parts.push(`Acceptance criteria:\n${ac}`);
  const meta = [`Type: ${type || 'unknown'}`, `State: ${f['System.State'] ?? 'unknown'}`];
  if (who) meta.push(`Assigned to: ${who}`);
  if (f['System.AreaPath']) meta.push(`Area path: ${f['System.AreaPath']}`);
  if (tags.length) meta.push(`Tags: ${tags.join(', ')}`);
  parts.push(meta.join('\n'));
  const out = {
    feature: featureOf(f['System.AreaPath'], index, areaPathMap),
    lens: security ? 'security' : bug ? 'quality' : 'business',
    kind: 'work-item',
    origin: 'ado',
    externalRef: `ado:${Number(id)}`,
    title: String(f['System.Title'] ?? '').trim() || `ADO #${id}`,
    body: parts.join('\n\n'),
  };
  if (org && project) out.externalUrl = workItemUrl(org, project, Number(id));
  const tier = tierOf(f);
  if (tier !== undefined) out.tier = tier;
  const riskClass = security ? 'authz' : bug ? 'reliability' : undefined;
  if (riskClass) out.riskClass = riskClass;
  return out;
}

/** WIQL ids -> workitemsbatch request bodies, BATCH_SIZE ids each (the API's cap). */
export function batchBodies(ids, fields = FIELDS) {
  const list = [...new Set(ids.map(Number).filter(Number.isInteger))];
  const out = [];
  for (let i = 0; i < list.length; i += BATCH_SIZE) out.push({ ids: list.slice(i, i + BATCH_SIZE), fields, errorPolicy: 'omit' });
  return out;
}
/** The ids a WIQL answer lists (flat query: workItems; a link query: workItemRelations' targets). */
export function wiqlIds(answer) {
  if (Array.isArray(answer?.workItems)) return answer.workItems.map((w) => w.id);
  if (Array.isArray(answer?.workItemRelations)) return answer.workItemRelations.map((r) => r?.target?.id).filter((x) => x !== undefined);
  return [];
}

// ------------------------------------------------------------------------------- write-back (designed, disabled)
/**
 * Proposal status -> ADO state, per process template. A status with no entry is not synced (failed, rework: the
 * work is still the store's, ADO keeps its state). See references/ado-sync.md for the reasoning per row.
 */
export const STATE_MAP = {
  agile: { proposed: 'New', approved: 'Active', executing: 'Active', done: 'Resolved', accepted: 'Resolved', released: 'Closed', declined: 'Removed', descoped: 'Removed' },
  scrum: { proposed: 'New', approved: 'Approved', executing: 'Committed', done: 'Done', accepted: 'Done', released: 'Done', declined: 'Removed', descoped: 'Removed' },
  basic: { proposed: 'To Do', approved: 'To Do', executing: 'Doing', done: 'Done', accepted: 'Done', released: 'Done', declined: 'Done', descoped: 'Done' },
  cmmi: { proposed: 'Proposed', approved: 'Active', executing: 'Active', done: 'Resolved', accepted: 'Resolved', released: 'Closed', declined: 'Removed', descoped: 'Removed' },
};
/** Statuses past the approval: from here the store is the truth for status (the conflict rule). */
export const STORE_OWNS_STATUS = ['approved', 'executing', 'done', 'accepted', 'released', 'declined', 'descoped'];

export const adoIdOf = (ref) => { const m = /^ado:(\d+)$/.exec(String(ref ?? '')); return m ? Number(m[1]) : undefined; };

/** The comment a status move leaves on the work item (ado-sync.md, comment-on-commit). */
export function commentText(p) {
  const lines = [`[bp] ${p.id} is ${p.status}: ${p.title}`];
  if (p.commit_sha || p.result_sha) lines.push(`commit ${p.result_sha ?? p.commit_sha}${p.pack_id ? ` in ${p.pack_id}` : ''}`);
  if (p.release_id) lines.push(`release ${p.release_id}`);
  if (p.tier !== undefined) lines.push(`tier T${p.tier}${p.risk_class ? ` ${p.risk_class}` : ''}`);
  return lines.join('\n');
}

/**
 * sync: one request per imported item whose status the store owns -> {id, method, url, body} or undefined (nothing
 * to send). The body is a JSON patch on System.State; the content type is application/json-patch+json.
 */
export function syncRequest(p, { org, project, process = 'agile' } = {}) {
  const adoId = adoIdOf(p.external_ref);
  if (adoId === undefined || !STORE_OWNS_STATUS.includes(p.status)) return undefined;
  const state = STATE_MAP[process]?.[p.status];
  if (!state) return undefined;
  return {
    proposal: p.id,
    method: 'PATCH',
    url: `${projectBase(org, project)}/_apis/wit/workitems/${adoId}?api-version=${API_VERSION}`,
    contentType: 'application/json-patch+json',
    body: [{ op: 'add', path: '/fields/System.State', value: state }],
    comment: {
      method: 'POST',
      url: `${projectBase(org, project)}/_apis/wit/workItems/${adoId}/comments?api-version=${COMMENTS_API_VERSION}`,
      contentType: 'application/json',
      body: { text: commentText(p) },
    },
  };
}

const TYPE_FOR_LENS = { quality: 'Bug', security: 'Bug' };
/** push: a scan-origin proposal -> the create request for a new work item (type from the lens; Task otherwise). */
export function pushRequest(p, { org, project, areaPath, process = 'agile' } = {}) {
  if (p.origin && p.origin !== 'scan') return undefined;
  if (p.external_ref) return undefined;
  const type = TYPE_FOR_LENS[p.lens] ?? (process === 'scrum' ? 'Product Backlog Item' : process === 'basic' ? 'Issue' : 'Task');
  const tags = ['bp', `bp:${p.id}`, `lens:${p.lens}`];
  if (p.tier !== undefined) tags.push(`T${p.tier}`);
  if (p.risk_class) tags.push(`risk:${p.risk_class}`);
  const ops = [
    { op: 'add', path: '/fields/System.Title', value: p.title },
    { op: 'add', path: '/fields/System.Description', value: escapeHtml(p.body ?? '').replace(/\n/g, '<br>') },
    { op: 'add', path: '/fields/System.Tags', value: tags.join('; ') },
  ];
  if (areaPath) ops.push({ op: 'add', path: '/fields/System.AreaPath', value: areaPath });
  const prio = { 0: 1, 1: 1, 2: 2, 3: 3 }[p.tier];
  if (prio !== undefined) ops.push({ op: 'add', path: '/fields/Microsoft.VSTS.Common.Priority', value: prio });
  return {
    proposal: p.id,
    method: 'POST',
    url: `${projectBase(org, project)}/_apis/wit/workitems/$${encodeURIComponent(type)}?api-version=${API_VERSION}`,
    contentType: 'application/json-patch+json',
    body: ops,
  };
}
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
