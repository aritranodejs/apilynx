export type ComparisonValue = 'yes' | 'no' | 'partial' | string;

export type ComparisonToolId =
  | 'apilynx'
  | 'postman'
  | 'insomnia'
  | 'bruno'
  | 'thunder'
  | 'hoppscotch';

export const COMPARISON_TOOLS: { id: ComparisonToolId; name: string }[] = [
  { id: 'apilynx', name: 'Apilynx' },
  { id: 'postman', name: 'Postman' },
  { id: 'insomnia', name: 'Insomnia' },
  { id: 'bruno', name: 'Bruno' },
  { id: 'thunder', name: 'Thunder Client' },
  { id: 'hoppscotch', name: 'Hoppscotch' },
];

export type ComparisonRow = {
  feature: string;
  note?: string;
} & Record<ComparisonToolId, ComparisonValue>;

/** Multi-tool feature matrix for docs + landing. */
export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'REST / HTTP requests',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'yes',
    hoppscotch: 'yes',
  },
  {
    feature: 'GraphQL queries & variables',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'partial',
    hoppscotch: 'yes',
    note: 'Apilynx: Body → GraphQL with query + variables editors (POST JSON)',
  },
  {
    feature: 'Params, headers, JSON / form / raw body',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'yes',
    hoppscotch: 'yes',
  },
  {
    feature: 'Bearer, Basic, API Key auth',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'yes',
    hoppscotch: 'yes',
  },
  {
    feature: 'Collections & folders',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'yes',
    hoppscotch: 'yes',
  },
  {
    feature: 'Environments & {{variables}}',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'yes',
    hoppscotch: 'yes',
  },
  {
    feature: 'Import from cURL',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'yes',
    hoppscotch: 'yes',
  },
  {
    feature: 'Collection / folder runner',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'partial',
    hoppscotch: 'partial',
  },
  {
    feature: 'Response tests / assertions',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'yes',
    hoppscotch: 'partial',
  },
  {
    feature: 'Code generation snippets',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'partial',
    thunder: 'partial',
    hoppscotch: 'yes',
  },
  {
    feature: 'API documentation export / publish',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'partial',
    bruno: 'partial',
    thunder: 'no',
    hoppscotch: 'partial',
  },
  {
    feature: 'Mock server',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'partial',
    bruno: 'no',
    thunder: 'no',
    hoppscotch: 'partial',
  },
  {
    feature: 'Request history',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'partial',
    thunder: 'yes',
    hoppscotch: 'yes',
  },
  {
    feature: 'Desktop app (no browser CORS limits)',
    apilynx: 'yes',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'no',
    hoppscotch: 'partial',
    note: 'Thunder Client is VS Code–only; Hoppscotch is primarily web (+ desktop option)',
  },
  {
    feature: 'Works inside VS Code',
    apilynx: 'no',
    postman: 'no',
    insomnia: 'no',
    bruno: 'no',
    thunder: 'yes',
    hoppscotch: 'no',
  },
  {
    feature: 'Git-friendly local collections',
    apilynx: 'partial',
    postman: 'partial',
    insomnia: 'partial',
    bruno: 'yes',
    thunder: 'partial',
    hoppscotch: 'partial',
    note: 'Bruno stores collections as plain files in git by design',
  },
  {
    feature: 'Free core API testing',
    apilynx: 'yes',
    postman: 'partial',
    insomnia: 'partial',
    bruno: 'yes',
    thunder: 'partial',
    hoppscotch: 'yes',
    note: 'Paid tiers vary — Apilynx keeps core testing free',
  },
  {
    feature: 'No account required to send requests',
    apilynx: 'yes',
    postman: 'partial',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'yes',
    hoppscotch: 'yes',
  },
  {
    feature: 'Cloud team workspaces',
    apilynx: 'partial',
    postman: 'yes',
    insomnia: 'yes',
    bruno: 'partial',
    thunder: 'partial',
    hoppscotch: 'yes',
  },
  {
    feature: 'Lightweight focused UI',
    apilynx: 'yes',
    postman: 'partial',
    insomnia: 'yes',
    bruno: 'yes',
    thunder: 'yes',
    hoppscotch: 'yes',
  },
];

export const FEATURE_PILLARS = [
  {
    title: 'REST & GraphQL',
    text: 'Send any HTTP method, or switch Body → GraphQL for query + variables — same tab workflow.',
  },
  {
    title: 'Collections',
    text: 'Group endpoints into folders, save drafts, import/export JSON, and run a whole collection as a smoke test.',
  },
  {
    title: 'Environments',
    text: 'Swap Local → Staging → Production with {{BASE_URL}} and {{TOKEN}} without rewriting every request.',
  },
  {
    title: 'Tests & history',
    text: 'Assert status, body, and timing after each send. Replay past calls from history when something breaks.',
  },
  {
    title: 'Docs & code',
    text: 'Generate shareable HTML docs from a collection, and copy client snippets for Fetch, Axios, Python, and more.',
  },
  {
    title: 'Mock server',
    text: 'Stub routes locally so frontend work continues while the real API is still in progress.',
  },
  {
    title: 'Teams & workspaces',
    text: 'Create workspaces, invite teammates, and keep collections organized per project — optional sign-in for cloud sync.',
  },
  {
    title: 'Load testing',
    text: 'Open the Load Test tab on any request to fire concurrent calls and see latency stats before you ship.',
  },
  {
    title: 'Import cURL & tabs',
    text: 'Paste a curl command to build a full request in one click. Work across multiple tabs with keyboard shortcuts.',
  },
];
