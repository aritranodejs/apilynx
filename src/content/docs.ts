export type DocBlock = {
  heading?: string;
  paragraphs: string[];
  list?: string[];
  code?: string;
  codeLang?: string;
  callout?: string;
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
    description: 'Get Apilynx on Windows, macOS, or Linux in a few clicks.',
    body: [
      {
        paragraphs: [
          'Apilynx is a free desktop app. When installers are published, pick your platform below, install like any other app, and open it from your app menu — no coding required.',
        ],
        callout:
          'Desktop installers are coming soon. Until they go live, open Apilynx in your browser from this website to explore the product.',
      },
      {
        heading: 'Right now',
        paragraphs: [],
        list: [
          'Use “Open Apilynx in browser” on the Download page to start testing APIs today',
          'Watch this page for Windows, macOS, and Linux installers when they ship',
        ],
      },
      {
        heading: 'Windows (when available)',
        paragraphs: [],
        list: [
          'Click Download for Windows on this site.',
          'Open the downloaded setup file.',
          'Follow the installer (Next → Install → Finish).',
          'Open Apilynx from the Start menu or the desktop shortcut.',
        ],
      },
      {
        heading: 'macOS (when available)',
        paragraphs: [],
        list: [
          'Download the version that matches your Mac (Apple Silicon or Intel). Unsure? Apple menu → About This Mac.',
          'Open the downloaded disk image.',
          'Drag Apilynx into the Applications folder.',
          'Open Apilynx from Launchpad or Applications.',
          'If macOS says the app can’t be opened: right-click Apilynx → Open → click Open once.',
        ],
      },
      {
        heading: 'Linux (when available)',
        paragraphs: [
          'Two options — choose what fits your desktop:',
        ],
        list: [
          '.deb (Ubuntu, Debian, Linux Mint, Pop!_OS) — download and open with Software Install / App Center, then confirm install.',
          'AppImage (most Linux desktops) — download, open file properties and allow “run as program”, then double-click the file.',
        ],
      },
      {
        heading: 'After you install',
        paragraphs: [
          'Launch Apilynx and you are ready to send requests. Your collections, environments, and history are saved for next time.',
        ],
        list: [
          'Continue with Getting Started to send your first request',
          'Or open the in-app sidebar and explore Collections',
        ],
      },
      {
        heading: 'Browser vs desktop',
        paragraphs: [
          'The browser version is great for trying the UI. The desktop app is best for calling real APIs without browser security limits.',
        ],
      },
    ],
  },
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Install once, then send your first API request in minutes.',
    body: [
      {
        paragraphs: [
          'Apilynx helps you call APIs, save them in collections, switch environments, and share documentation with your team — similar to tools like Postman, with a focused desktop workflow.',
        ],
      },
      {
        heading: 'Before you begin',
        paragraphs: [],
        list: [
          'Install Apilynx for your operating system (see Download & Install)',
          'Open the app from your Start menu, Launchpad, or applications list',
        ],
      },
      {
        heading: 'Send your first request',
        paragraphs: [],
        list: [
          'A blank request tab opens automatically when you start.',
          'Leave the method on GET (or pick another method from the dropdown).',
          'In the URL field, type a public test API — for example https://httpbin.org/get',
          'Click Send (or press Ctrl+Enter on Windows/Linux, Cmd+Enter on Mac).',
          'Check the bottom panel for status (for example 200), time, headers, and the response body.',
        ],
        callout:
          'Seeing a CORS or network error in the browser version? Download the desktop app — it is built for calling APIs without those browser limits.',
      },
      {
        heading: 'Save the request',
        paragraphs: [],
        list: [
          'In the sidebar, open Collections and create a collection (for example “My first API”).',
          'Click Save in the header (or press Ctrl+S / Cmd+S).',
          'Choose the collection, give the request a name, and confirm.',
          'You can reopen it anytime from the Collections panel.',
        ],
      },
      {
        heading: 'What to explore next',
        paragraphs: [],
        list: [
          'Environments — switch base URLs without rewriting every request',
          'Auth — attach Bearer tokens or API keys',
          'Documentation — turn a collection into shareable HTML docs',
          'Code — copy the same request as Fetch, Axios, Python, and more',
        ],
      },
    ],
  },
  {
    slug: 'requests',
    title: 'Making Requests',
    description: 'Methods, params, headers, bodies, and importing from cURL.',
    body: [
      {
        paragraphs: [
          'Each tab is one request. You can keep several tabs open to compare endpoints or draft changes side by side.',
        ],
      },
      {
        heading: 'Method and URL',
        paragraphs: [
          'Choose GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS. Enter the full URL, or use variables like {{BASE_URL}}/users after you set up an environment.',
        ],
      },
      {
        heading: 'Params',
        paragraphs: [
          'Add query parameters as key/value rows. Turn a row off to keep it for later without sending it. Empty keys are ignored.',
        ],
      },
      {
        heading: 'Headers',
        paragraphs: [
          'Add headers such as Content-Type or Accept. If you use the Auth tab, Apilynx can add Authorization for you — you usually do not need to type that header twice.',
        ],
      },
      {
        heading: 'Body',
        paragraphs: [
          'For POST, PUT, and PATCH you will often send a body:',
        ],
        list: [
          'JSON — structured data with highlighting and format tools',
          'Raw — plain text or other formats',
          'Form Data — fields (including uploads when your API expects them)',
          'x-www-form-urlencoded — classic form-style fields',
        ],
      },
      {
        heading: 'Import from cURL',
        paragraphs: [
          'Already have a cURL command from API docs or your browser’s Network tab? Use Import cURL, paste it, and Apilynx fills in method, URL, headers, and body. Review the tab, then Send.',
        ],
        code: `curl -X POST 'https://api.example.com/v1/login' \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"you@example.com","password":"secret"}'`,
        codeLang: 'bash',
      },
      {
        heading: 'Shortcuts',
        paragraphs: [],
        list: [
          'Send — Ctrl+Enter (Windows/Linux) or Cmd+Enter (Mac)',
          'New tab — Ctrl+T / Cmd+T',
          'Close tab — Ctrl+W / Cmd+W',
          'Save — Ctrl+S / Cmd+S',
        ],
      },
    ],
  },
  {
    slug: 'collections',
    title: 'Collections',
    description: 'Organize endpoints, nest folders, share JSON, and run everything.',
    body: [
      {
        paragraphs: [
          'A collection is a folder of saved requests — the best way to keep an API tidy for yourself or your team.',
        ],
      },
      {
        heading: 'Create a collection',
        paragraphs: [
          'Open Collections in the sidebar, create a new collection, and give it a clear name (Payments API, Identity, Staging checks). Add a short overview if you plan to publish docs later.',
        ],
      },
      {
        heading: 'Save and reopen',
        paragraphs: [
          'From any tab, Save and pick the collection (and optional folder). Click a saved request later to open it again, edit, and save updates.',
        ],
      },
      {
        heading: 'Folders',
        paragraphs: [
          'Group related calls — for example Users, Orders, or Auth. Rename folders as your API grows so teammates can find endpoints quickly.',
        ],
      },
      {
        heading: 'Import and export',
        paragraphs: [
          'Export a collection as a file to back it up or share it. Import a file on another computer to restore the same structure. Great for handing a workspace to a teammate.',
        ],
      },
      {
        heading: 'Collection runner',
        paragraphs: [
          'Run a whole collection in order to smoke-test an environment. Watch each status and timing, fix failures, then run again. Keep login → create → cleanup style flows in a sensible order.',
        ],
      },
      {
        heading: 'Shared auth',
        paragraphs: [
          'Set authentication on the collection so every request inside can reuse it. Override on a single request when one endpoint is public or needs a different key.',
        ],
      },
    ],
  },
  {
    slug: 'environments',
    title: 'Environments',
    description: 'One collection, many stages — Local, Staging, Production, and more.',
    body: [
      {
        paragraphs: [
          'Environments store values like base URLs and tokens. Put {{BASE_URL}} in your requests, then switch the active environment in the header instead of editing every URL.',
        ],
      },
      {
        heading: 'How variables work',
        paragraphs: [
          'Write a name between double curly braces. Apilynx replaces it when you send the request.',
        ],
        code: `GET {{BASE_URL}}/users/me
Authorization: Bearer {{TOKEN}}`,
        codeLang: 'http',
      },
      {
        heading: 'Built-in stages',
        paragraphs: [
          'Apilynx starts you with Local, Development, Staging, and Production. Edit each one with the right URL and credentials for that stage.',
        ],
      },
      {
        heading: 'Secrets',
        paragraphs: [
          'Mark sensitive values as secret so they stay masked in the UI. Still avoid pasting real production secrets into docs you export and share publicly.',
        ],
      },
      {
        heading: 'Suggested variables',
        paragraphs: [],
        list: [
          'BASE_URL — the API host for that stage',
          'TOKEN or API_KEY — credentials',
          'IDs you reuse often (workspace, tenant, user)',
        ],
        callout:
          'Keep request definitions generic. Put hosts and secrets only in environments so the same collection works everywhere.',
      },
    ],
  },
  {
    slug: 'authentication',
    title: 'Authentication',
    description: 'Secure your API calls — and optionally sign in to Apilynx for teams.',
    body: [
      {
        paragraphs: [
          'There are two different “logins”: credentials your API needs on each request, and signing into Apilynx for shared workspaces. They are separate on purpose.',
        ],
      },
      {
        heading: 'Auth on a request',
        paragraphs: ['Open the Auth tab and choose:'],
        list: [
          'None — no auth added',
          'Bearer Token — common for modern APIs',
          'Basic Auth — username and password',
          'API Key — send a key in a header or query parameter',
        ],
      },
      {
        heading: 'Reuse tokens from environments',
        paragraphs: [
          'Store TOKEN in your environment and reference it in Auth. When the token rotates, update the environment once — every request picks it up.',
        ],
      },
      {
        heading: 'Auth for a whole collection',
        paragraphs: [
          'Set auth on the collection so nested requests inherit it. Override only where needed (for example a public health check).',
        ],
      },
      {
        heading: 'Sign in to Apilynx',
        paragraphs: [
          'Use Sign in in the header for profile, projects, teams, and invitations. That does not automatically send your Apilynx password to the APIs you are testing.',
        ],
      },
    ],
  },
  {
    slug: 'responses',
    title: 'Responses & Tests',
    description: 'Read responses clearly and catch regressions with simple checks.',
    body: [
      {
        paragraphs: [
          'After you Send, the response panel shows status, how long it took, size, headers, and body.',
        ],
      },
      {
        heading: 'Reading the body',
        paragraphs: [],
        list: [
          'Pretty — easy-to-read JSON',
          'Raw — exact text',
          'Headers — everything the server returned',
          'Search, copy, or download when you need to keep a payload',
        ],
      },
      {
        heading: 'Tests',
        paragraphs: [
          'On the Tests tab, add checks that run after every response:',
        ],
        list: [
          'Status — expect 200, 201, and so on',
          'Body contains — make sure important text appears',
          'Response time — fail if the call is too slow',
        ],
      },
      {
        heading: 'Example responses for docs',
        paragraphs: [
          'Save a good example response on the request so published documentation includes a realistic sample. Remove personal data before you share docs outside your team.',
        ],
      },
      {
        heading: 'If something fails',
        paragraphs: [],
        list: [
          'Confirm the active environment (wrong BASE_URL is common)',
          'Check token expiry and Auth type',
          'Read the status code and error body for clues',
          'Use the desktop app if the browser blocks the call',
        ],
      },
    ],
  },
  {
    slug: 'documentation',
    title: 'API Documentation',
    description: 'Publish clean docs from your collections — preview and export.',
    body: [
      {
        paragraphs: [
          'Turn a collection into documentation your teammates (or partners) can read — overview, endpoints, methods, descriptions, and examples.',
        ],
      },
      {
        heading: 'Build docs from a collection',
        paragraphs: [],
        list: [
          'Open Documentation in the sidebar',
          'Select a collection',
          'Add an optional Base URL readers should use',
          'Write a short overview of the API',
        ],
      },
      {
        heading: 'Describe each endpoint',
        paragraphs: [
          'On a request, open Docs and add a clear description and an example response. Good request names become clear headings in the finished docs.',
        ],
      },
      {
        heading: 'Preview and export',
        paragraphs: [
          'Use Preview to see the published look inside Apilynx. Export downloads an HTML file you can host, attach in chat, or drop into an internal wiki — readers do not need Apilynx installed.',
        ],
        callout:
          'Re-export after you change descriptions or examples so shared docs stay up to date.',
      },
      {
        heading: 'Before you share',
        paragraphs: [],
        list: [
          'Every important endpoint has a description',
          'Auth expectations are clear in the overview',
          'Examples do not contain real passwords or personal data',
        ],
      },
    ],
  },
  {
    slug: 'code-generation',
    title: 'Code Generation',
    description: 'Copy the same request into your app’s language.',
    body: [
      {
        paragraphs: [
          'Open the Code panel on a request to copy a ready-made snippet. It follows the method, URL, headers, body, and auth you already configured.',
        ],
      },
      {
        heading: 'Languages you can copy',
        paragraphs: [],
        list: [
          'Fetch',
          'Axios',
          'Node.js',
          'PHP',
          'Laravel',
          'Python',
          'Java OkHttp',
        ],
      },
      {
        heading: 'Typical flow',
        paragraphs: [],
        list: [
          'Get the request working in Apilynx first',
          'Open Code and pick your stack',
          'Copy into your project',
          'Add your own error handling and secret management',
        ],
      },
    ],
  },
  {
    slug: 'mock-server',
    title: 'Mock Server',
    description: 'Fake responses locally while the real API is still in progress.',
    body: [
      {
        paragraphs: [
          'Use Mock Server when the UI is ready but the backend is not — or when you need predictable error payloads for demos and tests.',
        ],
      },
      {
        heading: 'Quick workflow',
        paragraphs: [],
        list: [
          'Open Mock Server in the sidebar',
          'Define a route (method and path) and a sample response',
          'Start the mock server and note the local address',
          'Point a request (or an environment BASE_URL) at that address and Send',
        ],
      },
      {
        heading: 'Tips',
        paragraphs: [
          'Keep mock payloads close to your real API shape. When the real service is ready, switch the environment back and run your collection to verify.',
        ],
      },
    ],
  },
  {
    slug: 'workspaces-teams',
    title: 'Workspaces & Teams',
    description: 'Share projects, accept invites, and collaborate.',
    body: [
      {
        paragraphs: [
          'Sign in to unlock projects/workspaces, teams, and invitations so work is not stuck on one laptop profile.',
        ],
      },
      {
        heading: 'Projects',
        paragraphs: [
          'Use the project selector in the header to switch context. Collections follow the active project so personal and shared work stay separated.',
        ],
      },
      {
        heading: 'Invitations',
        paragraphs: [
          'The bell icon shows invites to projects and teams. Accept them to join shared spaces. The list refreshes while you are signed in.',
        ],
      },
      {
        heading: 'Teams',
        paragraphs: [
          'Open Teams in the sidebar to see collaboration options available on your account. You can still craft and send requests without signing in; sign-in is for multi-user features.',
        ],
      },
    ],
  },
  {
    slug: 'history-settings',
    title: 'History & Settings',
    description: 'Replay past calls, customize the app, and learn shortcuts.',
    body: [
      {
        heading: 'History',
        paragraphs: [
          'Apilynx can keep a log of requests you send. Open History to search, browse, and restore an old call into a new tab — handy when you need “what did we send yesterday?”',
        ],
      },
      {
        heading: 'Settings',
        paragraphs: [
          'Open Settings from the gear icon to adjust:',
        ],
        list: [
          'Theme — dark or light',
          'Request timeout — how long to wait on slow APIs',
          'Auto-save preferences',
          'How much history to keep',
        ],
      },
      {
        heading: 'Keyboard shortcuts',
        paragraphs: [
          'Press ? in the header (or Ctrl+/ / Cmd+/) for the full list. The everyday ones:',
        ],
        list: [
          'Send — Ctrl+Enter / Cmd+Enter',
          'Save — Ctrl+S / Cmd+S',
          'New tab — Ctrl+T / Cmd+T',
          'Close tab — Ctrl+W / Cmd+W',
        ],
      },
      {
        heading: 'Keep data safe',
        paragraphs: [
          'History and collections may include tokens. Prefer secret environment variables, and scrub example responses before publishing docs outside your team.',
        ],
      },
    ],
  },
];

export function getDoc(slug: string): DocSection | undefined {
  return DOC_SECTIONS.find((s) => s.slug === slug);
}
