export type DocTable = {
  headers: string[];
  rows: string[][];
};

export type DocBlock = {
  heading?: string;
  paragraphs: string[];
  list?: string[];
  code?: string;
  codeLang?: string;
  callout?: string;
  table?: DocTable;
};

export type DocSection = {
  slug: string;
  title: string;
  description: string;
  body: DocBlock[];
};

export const DOC_SECTIONS: DocSection[] = [
  {
    slug: 'download',
    title: 'Download & Install',
    description: 'Install Apilynx on Windows, macOS, or Linux — then start testing APIs.',
    body: [
      {
        paragraphs: [
          'Apilynx is a free desktop API client. Download the installer for your OS, install like any other app, and open it from your app menu. No terminal or coding required.',
        ],
        callout:
          'Linux installers are live on GitHub Releases. Windows and macOS builds appear as Coming soon until those packages are published — you can still try Apilynx in the browser.',
      },
      {
        heading: 'Pick your platform',
        paragraphs: [],
        table: {
          headers: ['Platform', 'File', 'How to install'],
          rows: [
            ['Windows', 'Apilynx-Setup-….exe', 'Run the installer → Finish → open from Start menu'],
            ['macOS (Apple Silicon)', 'Apilynx-…-arm64.dmg', 'Open DMG → drag to Applications → Open'],
            ['macOS (Intel)', 'Apilynx-…-x64.dmg', 'Same as above for Intel Macs'],
            ['Linux (Ubuntu/Debian)', 'apilynx_…_amd64.deb', 'Open with Software Install / App Center'],
            ['Linux (portable)', 'Apilynx-….AppImage', 'Allow “run as program” → double-click'],
          ],
        },
      },
      {
        heading: 'After install',
        paragraphs: [
          'Launch Apilynx. Your collections, environments, and history are saved for next time. Continue with Getting Started to send your first request.',
        ],
      },
      {
        heading: 'Browser vs desktop',
        paragraphs: [
          'The browser version is great for exploring the UI. The desktop app is best for calling real APIs without browser CORS limits — same idea as using the Postman desktop app instead of only the web UI.',
        ],
      },
    ],
  },
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Send your first request in under two minutes — Postman-style, step by step.',
    body: [
      {
        paragraphs: [
          'If you have used Postman, Insomnia, or Thunder Client, Apilynx will feel familiar: a URL bar, method dropdown, Send button, and a response panel underneath.',
        ],
      },
      {
        heading: 'Step 1 — Open a blank request',
        paragraphs: [
          'Launch Apilynx (or open the app in your browser). A new tab is created automatically. You can open more tabs with Ctrl+T (Cmd+T on Mac).',
        ],
      },
      {
        heading: 'Step 2 — Call a public test API',
        paragraphs: [
          'Leave the method on GET and paste this URL, then click Send (or press Ctrl+Enter / Cmd+Enter):',
        ],
        code: `https://httpbin.org/get`,
        codeLang: 'text',
        callout:
          'httpbin.org echoes your request back — perfect for learning, just like Postman’s “echo” examples.',
      },
      {
        heading: 'Step 3 — Read the response',
        paragraphs: [
          'Below the builder you should see status 200, response time in ms, headers, and a JSON body. Switch Pretty / Raw to inspect the payload.',
        ],
        code: `{
  "args": {},
  "headers": {
    "Accept": "*/*",
    "Host": "httpbin.org"
  },
  "url": "https://httpbin.org/get"
}`,
        codeLang: 'json',
      },
      {
        heading: 'Step 4 — Add a query param',
        paragraphs: [
          'Open the Params tab and add:',
        ],
        table: {
          headers: ['Key', 'Value'],
          rows: [
            ['page', '1'],
            ['limit', '10'],
          ],
        },
        callout: 'Send again. The URL becomes …/get?page=1&limit=10 and httpbin shows those keys under "args".',
      },
      {
        heading: 'Step 5 — Save to a collection',
        paragraphs: [
          'Create a collection named “Learning” in the sidebar, then press Ctrl+S / Cmd+S, pick the collection, name the request “List demo”, and save. Reopen it anytime from Collections — the same habit as saving a request in Postman.',
        ],
      },
      {
        heading: 'What to try next',
        paragraphs: [],
        list: [
          'POST JSON to https://httpbin.org/post (see Making Requests)',
          'Add an environment with {{BASE_URL}}',
          'Attach a Bearer token on the Auth tab',
          'Compare Apilynx vs Postman on the comparison page',
        ],
      },
    ],
  },
  {
    slug: 'compare',
    title: 'Compare API clients',
    description:
      'Apilynx vs Postman, Insomnia, Bruno, Thunder Client, and Hoppscotch — feature by feature.',
    body: [
      {
        paragraphs: [
          'Apilynx is built for the same daily job as other API clients: send REST and GraphQL requests, organize collections, switch environments, test responses, generate code, and share docs. Use the matrix below to see how we compare.',
        ],
        callout:
          'Pick Apilynx for a focused desktop client with REST + GraphQL, docs export, and mocks. Keep another tool if your team is locked into its cloud or VS Code workflow.',
      },
      {
        heading: 'At a glance',
        paragraphs: [],
        table: {
          headers: ['Topic', 'Apilynx', 'Others (typical)'],
          rows: [
            ['REST HTTP', 'Yes', 'Yes across major clients'],
            ['GraphQL query + variables', 'Yes (Body → GraphQL)', 'Postman, Insomnia, Bruno, Hoppscotch'],
            ['Desktop (no CORS)', 'Yes', 'Postman, Insomnia, Bruno'],
            ['VS Code extension', 'No', 'Thunder Client'],
            ['Git-native collections', 'Export JSON', 'Bruno shines here'],
            ['Docs HTML export', 'Yes', 'Strongest in Postman'],
            ['Mock server', 'Yes', 'Postman; partial elsewhere'],
            ['Core testing free', 'Yes', 'Varies by product / tier'],
          ],
        },
      },
      {
        heading: 'When to choose Apilynx',
        paragraphs: [],
        list: [
          'You want REST and GraphQL in one request builder',
          'You need a desktop app without browser CORS limits',
          'You want HTML docs, code gen, mocks, and collection runner together',
          'You prefer optional sign-in for day-to-day calls',
        ],
      },
      {
        heading: 'When another tool may fit better',
        paragraphs: [],
        list: [
          'Postman — large cloud workspaces, monitors, company standard',
          'Bruno — git-first collection files as the source of truth',
          'Thunder Client — you live entirely inside VS Code',
          'Hoppscotch — browser-first lightweight testing',
          'Insomnia — existing Insomnia/Kong workflows',
        ],
      },
      {
        heading: 'Migration tips',
        paragraphs: [
          'Paste cURL from any client into Apilynx → Import cURL. Rebuild environments with the same variable names (BASE_URL, TOKEN). For GraphQL, switch Body → GraphQL and paste the query + variables JSON.',
        ],
      },
    ],
  },
  {
    slug: 'graphql',
    title: 'GraphQL',
    description: 'Test GraphQL APIs with query + variables editors — like Postman and Insomnia.',
    body: [
      {
        paragraphs: [
          'Apilynx sends GraphQL over HTTP as a JSON body: { "query": "...", "variables": { } }. That is the same wire format most GraphQL servers expect.',
        ],
      },
      {
        heading: 'Quick start',
        paragraphs: [],
        list: [
          'Create a request and set method to POST (Apilynx auto-switches from GET when you pick GraphQL)',
          'Set URL to your endpoint, e.g. {{BASE_URL}}/graphql',
          'Open Body → choose GraphQL',
          'Write the query on the left/top editor and variables as JSON below',
          'Optional: Auth → Bearer {{TOKEN}}',
          'Send and inspect data / errors in the response panel',
        ],
      },
      {
        heading: 'Example query',
        paragraphs: [],
        code: `query User($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`,
        codeLang: 'graphql',
      },
      {
        heading: 'Example variables',
        paragraphs: [],
        code: `{
  "id": "42"
}`,
        codeLang: 'json',
      },
      {
        heading: 'What gets sent',
        paragraphs: ['Apilynx POSTs application/json shaped like:'],
        code: `{
  "query": "query User($id: ID!) { user(id: $id) { id name email } }",
  "variables": { "id": "42" }
}`,
        codeLang: 'json',
      },
      {
        heading: 'Tips',
        paragraphs: [],
        list: [
          'Use environments for {{BASE_URL}} and {{TOKEN}} across Staging/Production',
          'Save GraphQL operations into a collection folder named “GraphQL”',
          'Add tests for status 200 and body contains "data"',
          'Public practice APIs (when available) work the same as your own schema',
        ],
      },
    ],
  },
  {
    slug: 'features',
    title: 'Features overview',
    description: 'Everything in Apilynx — mapped to the workflows you know from modern API clients.',
    body: [
      {
        paragraphs: [
          'Apilynx covers the core loop of professional API testing. Each feature below links conceptually to how you would work in Postman.',
        ],
      },
      {
        heading: 'Feature map',
        paragraphs: [],
        table: {
          headers: ['Apilynx', 'What it does', 'Similar to'],
          rows: [
            ['Request builder', 'Method, URL, params, headers, body, auth', 'Postman request tab'],
            ['GraphQL', 'Body → GraphQL (query + variables)', 'Postman / Insomnia GraphQL'],
            ['Collections', 'Save & organize endpoints + folders', 'Postman Collections'],
            ['Environments', '{{vars}} for Local / Staging / Prod', 'Postman Environments'],
            ['Tests', 'Assert status, body, response time', 'Postman Tests'],
            ['Collection runner', 'Run many requests in order', 'Collection Runner'],
            ['Documentation', 'Preview & export HTML API docs', 'Postman Docs / publish'],
            ['Code', 'Copy Fetch, Axios, Python, …', 'Code snippet panel'],
            ['Mock Server', 'Local fake responses', 'Postman Mock Server'],
            ['History', 'Search & restore past sends', 'History'],
            ['cURL import', 'Paste curl → full request', 'Import → Raw text'],
          ],
        },
      },
      {
        heading: 'Keyboard shortcuts',
        paragraphs: [],
        table: {
          headers: ['Action', 'Windows / Linux', 'macOS'],
          rows: [
            ['Send', 'Ctrl+Enter', 'Cmd+Enter'],
            ['Save', 'Ctrl+S', 'Cmd+S'],
            ['New tab', 'Ctrl+T', 'Cmd+T'],
            ['Close tab', 'Ctrl+W', 'Cmd+W'],
            ['Shortcuts help', 'Ctrl+/', 'Cmd+/'],
          ],
        },
      },
    ],
  },
  {
    slug: 'examples',
    title: 'Examples cookbook',
    description: 'Copy-paste style recipes for GET, POST, auth, variables, and tests — like Postman learning examples.',
    body: [
      {
        paragraphs: [
          'Use these recipes as templates. Replace hosts and tokens with your own, or keep httpbin.org for safe practice.',
        ],
      },
      {
        heading: 'Example A — GET with query params',
        paragraphs: ['Method GET, URL:'],
        code: `https://httpbin.org/get`,
        codeLang: 'text',
      },
      {
        paragraphs: ['Params:'],
        table: {
          headers: ['Key', 'Value'],
          rows: [
            ['search', 'apilynx'],
            ['active', 'true'],
          ],
        },
      },
      {
        heading: 'Example B — POST JSON body',
        paragraphs: [
          'Method POST → https://httpbin.org/post. Headers: Content-Type = application/json. Body (JSON):',
        ],
        code: `{
  "name": "Aritra",
  "role": "developer",
  "newsletter": true
}`,
        codeLang: 'json',
        callout: 'Send and inspect the JSON under "json" in the httpbin response — same pattern as creating a resource on a real API.',
      },
      {
        heading: 'Example C — Bearer token auth',
        paragraphs: [
          'Auth tab → Bearer Token → paste a token (or {{TOKEN}}). Example protected echo:',
        ],
        code: `GET https://httpbin.org/bearer
Authorization: Bearer {{TOKEN}}`,
        codeLang: 'http',
      },
      {
        heading: 'Example D — Environment variables',
        paragraphs: [
          'Create an environment “Local” with:',
        ],
        table: {
          headers: ['Variable', 'Initial value', 'Secret?'],
          rows: [
            ['BASE_URL', 'https://httpbin.org', 'No'],
            ['TOKEN', 'demo-token-123', 'Yes'],
          ],
        },
      },
      {
        paragraphs: ['Then set the request URL to:'],
        code: `{{BASE_URL}}/headers`,
        codeLang: 'text',
        callout: 'Switch environments in the header to point the same collection at Staging or Production — exactly how Postman environments work.',
      },
      {
        heading: 'Example E — Basic auth',
        paragraphs: [
          'Auth → Basic → username user, password pass. URL:',
        ],
        code: `https://httpbin.org/basic-auth/user/pass`,
        codeLang: 'text',
      },
      {
        heading: 'Example F — API key in header',
        paragraphs: [
          'Auth → API Key → Key: X-API-Key · Value: {{API_KEY}} · Add to: Header. Useful for gateways that expect a custom header instead of Bearer.',
        ],
      },
      {
        heading: 'Example G — Form URL encoded',
        paragraphs: [
          'POST https://httpbin.org/post · Body → x-www-form-urlencoded:',
        ],
        table: {
          headers: ['Key', 'Value'],
          rows: [
            ['grant_type', 'password'],
            ['username', 'demo@example.com'],
            ['password', 'secret'],
          ],
        },
      },
      {
        heading: 'Example H — Tests after send',
        paragraphs: [
          'On the Tests tab, add assertions like a mini Postman test script — without writing JavaScript:',
        ],
        table: {
          headers: ['Test type', 'Expected', 'Meaning'],
          rows: [
            ['Status', '200', 'Must return HTTP 200'],
            ['Body contains', 'httpbin', 'Body text must include this string'],
            ['Response time', '3000', 'Fail if slower than 3000 ms'],
          ],
        },
      },
      {
        heading: 'Example I — Import from cURL (from browser DevTools)',
        paragraphs: [
          'In Chrome DevTools → Network → right-click a call → Copy as cURL, then Apilynx → Import cURL:',
        ],
        code: `curl 'https://httpbin.org/post' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer demo-token-123' \\
  --data-raw '{"ok":true}'`,
        codeLang: 'bash',
      },
      {
        heading: 'Example J — GraphQL query + variables',
        paragraphs: [
          'Method POST → {{BASE_URL}}/graphql. Body → GraphQL. Query:',
        ],
        code: `query Hello {
  __typename
}`,
        codeLang: 'graphql',
      },
      {
        paragraphs: ['Variables (optional):'],
        code: `{}`,
        codeLang: 'json',
        callout:
          'Apilynx sends {"query":"...","variables":{}}. See the full GraphQL guide for auth and collections tips.',
      },
      {
        heading: 'Example K — Generate code for your app',
        paragraphs: [
          'After the request works, open Code and copy Axios or Fetch into your frontend — the same “code snippet” idea as Postman.',
        ],
        code: `const res = await fetch("https://httpbin.org/get?page=1", {
  method: "GET",
  headers: { Accept: "application/json" },
});
const data = await res.json();`,
        codeLang: 'javascript',
      },
    ],
  },
  {
    slug: 'requests',
    title: 'Making Requests',
    description: 'Methods, params, headers, bodies, and cURL import — with real examples.',
    body: [
      {
        paragraphs: [
          'Each tab is one request (like one Postman tab). Keep several open to compare endpoints or draft changes side by side.',
        ],
      },
      {
        heading: 'Supported methods',
        paragraphs: [],
        table: {
          headers: ['Method', 'Typical use'],
          rows: [
            ['GET', 'Read data (list users, fetch one item)'],
            ['POST', 'Create resource or submit a form/JSON'],
            ['PUT', 'Replace a resource'],
            ['PATCH', 'Partial update'],
            ['DELETE', 'Remove a resource'],
            ['HEAD / OPTIONS', 'Headers only / CORS preflight checks'],
          ],
        },
      },
      {
        heading: 'URL & variables',
        paragraphs: [
          'Enter a full URL or compose with environments:',
        ],
        code: `{{BASE_URL}}/api/v1/users/{{USER_ID}}`,
        codeLang: 'text',
      },
      {
        heading: 'Params & headers',
        paragraphs: [
          'Add query parameters and headers as key/value rows. Disable a row to keep it for later without sending it — same pattern as checking/unchecking rows in Postman.',
        ],
        table: {
          headers: ['Header', 'Example'],
          rows: [
            ['Accept', 'application/json'],
            ['Content-Type', 'application/json'],
            ['X-Request-Id', '{{REQUEST_ID}}'],
          ],
        },
      },
      {
        heading: 'Body types',
        paragraphs: [],
        list: [
          'JSON — Monaco editor with highlighting, pretty, minify (great for REST APIs)',
          'Raw — plain text or XML',
          'Form Data — multipart fields',
          'x-www-form-urlencoded — classic form posts / some OAuth token endpoints',
        ],
      },
      {
        heading: 'Worked example — create a note',
        paragraphs: [],
        code: `POST {{BASE_URL}}/notes
Content-Type: application/json
Authorization: Bearer {{TOKEN}}

{
  "title": "Ship Apilynx docs",
  "done": false
}`,
        codeLang: 'http',
      },
      {
        heading: 'Import from cURL',
        paragraphs: [
          'Paste any cURL from docs, Swagger “Try it”, or browser DevTools. Apilynx fills method, URL, headers, and body — then review and Send.',
        ],
      },
    ],
  },
  {
    slug: 'collections',
    title: 'Collections',
    description: 'Organize endpoints like Postman Collections — folders, save, export, runner.',
    body: [
      {
        paragraphs: [
          'A collection is a folder of saved requests. Name it after a service (Payments API) or a project (Mobile backend).',
        ],
      },
      {
        heading: 'Suggested structure',
        paragraphs: [],
        table: {
          headers: ['Folder', 'Example requests'],
          rows: [
            ['Auth', 'Login, Refresh token, Logout'],
            ['Users', 'List users, Get user, Update profile'],
            ['Orders', 'Create order, Get order, Cancel'],
          ],
        },
      },
      {
        heading: 'Save & reopen',
        paragraphs: [
          'Ctrl/Cmd+S saves the active tab into a collection. Click a saved request later to open it, edit, and save again.',
        ],
      },
      {
        heading: 'Import & export',
        paragraphs: [
          'Export JSON for backup or sharing. Import on another machine to restore the tree — handy when onboarding a teammate (similar to sharing a Postman collection file).',
        ],
      },
      {
        heading: 'Collection runner',
        paragraphs: [
          'Run requests in order to smoke-test an environment: login → create → fetch → cleanup. Watch status and timing, fix failures, re-run.',
        ],
        callout: 'Keep dependent calls in a sensible order, just like a Postman Collection Runner workflow.',
      },
      {
        heading: 'Collection-level auth',
        paragraphs: [
          'Set auth once on the collection so children inherit it. Override on a single public health-check request when needed.',
        ],
      },
    ],
  },
  {
    slug: 'environments',
    title: 'Environments',
    description: 'Local, Staging, Production — {{variables}} the Postman way.',
    body: [
      {
        paragraphs: [
          'Environments store values like base URLs and tokens. Write {{VAR_NAME}} in URLs, headers, or bodies; Apilynx substitutes them when you send.',
        ],
        code: `GET {{BASE_URL}}/users/me
Authorization: Bearer {{TOKEN}}`,
        codeLang: 'http',
      },
      {
        heading: 'Starter variables',
        paragraphs: [],
        table: {
          headers: ['Variable', 'Local example', 'Production example'],
          rows: [
            ['BASE_URL', 'http://localhost:4000', 'https://api.myapp.com'],
            ['TOKEN', '(from login)', '(from secrets vault)'],
            ['TENANT_ID', 'dev-tenant', 'acme'],
          ],
        },
      },
      {
        heading: 'Secrets',
        paragraphs: [
          'Mark sensitive values as secret so they stay masked in the UI. Still avoid pasting real production secrets into exported HTML docs.',
        ],
      },
      {
        heading: 'Workflow tip',
        paragraphs: [
          'Keep request definitions environment-agnostic. Put hosts and secrets only in environments so one collection works everywhere — the same best practice Postman teams use.',
        ],
      },
    ],
  },
  {
    slug: 'authentication',
    title: 'Authentication',
    description: 'Bearer, Basic, API Key, collection inheritance — plus optional Apilynx sign-in.',
    body: [
      {
        paragraphs: [
          'Two different logins: (1) credentials your API needs on each request, (2) signing into Apilynx for workspaces/teams. They stay separate on purpose.',
        ],
      },
      {
        heading: 'Auth types',
        paragraphs: [],
        table: {
          headers: ['Type', 'When to use', 'Example'],
          rows: [
            ['None', 'Public endpoints', 'GET /health'],
            ['Bearer', 'JWT / OAuth access tokens', 'Authorization: Bearer eyJ…'],
            ['Basic', 'Legacy APIs, some admin tools', 'user / pass'],
            ['API Key', 'Gateway keys in header or query', 'X-API-Key: …'],
          ],
        },
      },
      {
        heading: 'Recipe — login then call a protected route',
        paragraphs: [],
        list: [
          'POST {{BASE_URL}}/auth/login with email/password JSON',
          'Copy access_token from the response (or save it into {{TOKEN}})',
          'On the next request, Auth → Bearer → {{TOKEN}}',
          'GET {{BASE_URL}}/users/me',
        ],
      },
      {
        heading: 'Collection auth',
        paragraphs: [
          'Set Bearer on the collection so every nested request inherits it. Override only where an endpoint is public.',
        ],
      },
    ],
  },
  {
    slug: 'responses',
    title: 'Responses & Tests',
    description: 'Inspect Pretty/Raw/Headers and assert results like Postman tests.',
    body: [
      {
        paragraphs: [
          'After Send you get status, duration, size, headers, and body — the same feedback loop as other API clients.',
        ],
      },
      {
        heading: 'Views',
        paragraphs: [],
        list: [
          'Pretty — readable JSON',
          'Raw — exact text',
          'Headers — response metadata',
          'Search / copy / download — keep payloads for bugs or docs',
        ],
      },
      {
        heading: 'Writing tests (no scripts required)',
        paragraphs: [],
        table: {
          headers: ['Type', 'Example expected', 'Passes when'],
          rows: [
            ['Status', '201', 'Status code is 201'],
            ['Body contains', '"id":', 'Substring exists in body'],
            ['Response time', '2000', 'Duration ≤ 2000 ms'],
          ],
        },
        callout: 'Enable only the tests you care about. Disabled tests stay saved but are skipped — similar to skipping assertions in other tools.',
      },
      {
        heading: 'Save example responses for docs',
        paragraphs: [
          'Attach a successful JSON sample on the request so published documentation includes a realistic example (redact PII first).',
        ],
      },
      {
        heading: 'Troubleshooting',
        paragraphs: [],
        list: [
          'Wrong environment BASE_URL — most common issue',
          'Expired Bearer token',
          'Missing Content-Type on POST JSON',
          'Browser CORS — switch to the desktop app',
        ],
      },
    ],
  },
  {
    slug: 'documentation',
    title: 'API Documentation',
    description: 'Turn collections into readable docs — preview, export HTML, share with teammates.',
    body: [
      {
        paragraphs: [
          'Like Postman Docs, Apilynx can publish a collection as documentation: overview, endpoints, methods, descriptions, and example responses.',
        ],
      },
      {
        heading: 'Build docs',
        paragraphs: [],
        list: [
          'Sidebar → Documentation',
          'Select a collection',
          'Set optional Base URL for readers',
          'Write a short API overview',
          'Add per-request descriptions + example responses (Request → Docs)',
        ],
      },
      {
        heading: 'Preview & export',
        paragraphs: [
          'Use live Preview inside the app, then Export to download a self-contained HTML file for GitHub Pages, Notion, or email — readers do not need Apilynx installed.',
        ],
      },
      {
        heading: 'Quality checklist',
        paragraphs: [],
        table: {
          headers: ['Check', 'Why'],
          rows: [
            ['Every public endpoint has a description', 'Readers understand intent'],
            ['Auth is explained in the overview', 'Fewer support questions'],
            ['Examples are redacted', 'No leaked tokens or PII'],
            ['Base URL matches the intended stage', 'Copy-paste works'],
          ],
        },
      },
    ],
  },
  {
    slug: 'code-generation',
    title: 'Code Generation',
    description: 'Copy working requests into Fetch, Axios, Python, Java, and more.',
    body: [
      {
        paragraphs: [
          'Open Code on a request to copy a snippet — the same idea as Postman’s code panel. It mirrors method, URL, headers, body, and auth.',
        ],
      },
      {
        heading: 'Supported targets',
        paragraphs: [],
        list: ['Fetch', 'Axios', 'Node.js', 'PHP', 'Laravel', 'Python', 'Java OkHttp'],
      },
      {
        heading: 'Example — Fetch snippet shape',
        paragraphs: [],
        code: `await fetch("{{BASE_URL}}/users", {
  method: "GET",
  headers: {
    Authorization: "Bearer {{TOKEN}}",
    Accept: "application/json"
  }
});`,
        codeLang: 'javascript',
        callout: 'Resolve or replace {{variables}} before shipping code to production.',
      },
    ],
  },
  {
    slug: 'mock-server',
    title: 'Mock Server',
    description: 'Local fake APIs while backends catch up — like Postman mock servers.',
    body: [
      {
        paragraphs: [
          'Define routes and canned responses locally so UI work continues before the real API is ready.',
        ],
      },
      {
        heading: 'Workflow',
        paragraphs: [],
        list: [
          'Open Mock Server in the sidebar',
          'Add method + path + sample JSON/status',
          'Start the server and copy the local base URL',
          'Point an environment BASE_URL at the mock, or call it from a tab',
        ],
      },
      {
        heading: 'Example mock payload',
        paragraphs: [],
        code: `{
  "items": [
    { "id": "1", "name": "Demo product" }
  ],
  "total": 1
}`,
        codeLang: 'json',
      },
    ],
  },
  {
    slug: 'workspaces-teams',
    title: 'Workspaces & Teams',
    description: 'Optional sign-in for projects, invites, and collaboration.',
    body: [
      {
        paragraphs: [
          'You can test APIs without an account. Sign in when you want projects/workspaces, teams, and invitations.',
        ],
      },
      {
        heading: 'Projects',
        paragraphs: [
          'Switch projects from the header selector. Collections follow the active project so personal and shared work stay separated.',
        ],
      },
      {
        heading: 'Invitations',
        paragraphs: [
          'The bell icon shows pending invites. Accept them to join shared spaces.',
        ],
      },
    ],
  },
  {
    slug: 'history-settings',
    title: 'History & Settings',
    description: 'Replay past calls, theme, timeout, and shortcuts.',
    body: [
      {
        heading: 'History',
        paragraphs: [
          'Search past sends and restore a call into a new tab when you need “what did we send yesterday?”',
        ],
      },
      {
        heading: 'Settings',
        paragraphs: [],
        list: [
          'Theme — dark or light',
          'Request timeout',
          'Auto-save preferences',
          'How much history to keep',
        ],
      },
      {
        heading: 'Keep data safe',
        paragraphs: [
          'History may include tokens. Prefer secret environment variables and scrub examples before publishing docs.',
        ],
      },
    ],
  },
];

export function getDoc(slug: string): DocSection | undefined {
  return DOC_SECTIONS.find((s) => s.slug === slug);
}
