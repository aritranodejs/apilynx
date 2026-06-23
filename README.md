# ReqForge

A modern, cross-platform desktop API client — a production-ready alternative to Postman, Insomnia, and Bruno.

**Developed By Aritra Dutta**

![ReqForge](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![Electron](https://img.shields.io/badge/Electron-33-47848F) ![MongoDB](https://img.shields.io/badge/MongoDB-8-green)

## Features

- **Full HTTP support** — GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **No CORS limitations** — Requests routed through Electron main process via Axios
- **Request builder** — Params, headers, body (JSON/Raw/Form Data/urlencoded), auth
- **Monaco Editor** — Syntax highlighting, JSON validation, pretty/minify
- **Authentication** — None, Bearer, Basic, API Key (header/query)
- **Response viewer** — Pretty JSON tree, raw, headers, search, copy, download
- **Collections** — Create, rename, delete, import/export JSON
- **Environments** — `{{BASE_URL}}`, `{{TOKEN}}`, variable substitution
- **History** — MongoDB-backed with search, pagination, restore (10,000+ records)
- **Code generation** — Fetch, Axios, Node.js, PHP, Laravel, Python, Java OkHttp
- **Settings** — Theme, timeout, auto-save, max history (persisted in MongoDB)
- **Security** — Sanitized responses, no script execution, masked secrets

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Renderer (Next.js)               │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Zustand  │  │ TanStack     │  │ Feature Components    │  │
│  │ Stores   │  │ Query        │  │ (requests, collections│  │
│  └──────────┘  └──────────────┘  └───────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC (contextBridge)
┌──────────────────────────▼──────────────────────────────────┐
│                    Electron Main Process                     │
│  ┌──────────────┐  ┌──────────────────────────────────────┐  │
│  │ Axios HTTP   │  │ MongoDB (Mongoose)                   │  │
│  │ (no CORS)    │  │ settings, collections, requests,     │  │
│  │              │  │ history, environments                │  │
│  └──────────────┘  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
src/
├── app/                    # Next.js app router
├── components/             # Shared UI & layout
│   ├── ui/
│   └── layout/
├── features/               # Feature modules (Clean Architecture)
│   ├── requests/
│   ├── collections/
│   ├── environments/
│   ├── history/
│   ├── settings/
│   └── auth/
├── database/               # Mongoose models & repositories
├── electron/               # (at project root)
├── hooks/
├── stores/                 # Zustand state
├── services/               # IPC client layer
├── lib/
├── types/
└── utils/
electron/
├── main.ts                 # Main process entry
├── preload.ts              # Secure IPC bridge
└── ipc-handlers.ts         # HTTP + DB handlers
```

## Prerequisites

- **Node.js** 20.19+ (22+ recommended for Electron 42)
- **MongoDB** 6+ running locally or remote
- **npm** 10+

## Installation

```bash
# Clone and install
cd apiforge
npm install

# Configure MongoDB
cp .env.example .env
# Edit MONGODB_URI if needed (default: mongodb://127.0.0.1:27017/reqforge)

# Start MongoDB (if local)
sudo systemctl start mongod   # Linux
# or: brew services start mongodb-community  # macOS
```

## Development

### Web-only (UI preview, limited — CORS applies)

```bash
npm run dev
# Open http://localhost:3000
```

### Full desktop app (recommended)

```bash
npm run electron:dev
```

This compiles the Electron main process, starts Next.js dev server, and launches the desktop window.

## Building

```bash
# Build Next.js static export + Electron main process
npm run electron:build

# Run production build locally
npm run electron:start
```

## Packaging Installers

```bash
# All platforms (on respective OS)
npm run dist

# Platform-specific
npm run dist:win      # Windows .exe (NSIS)
npm run dist:mac      # macOS .dmg
npm run dist:linux    # Linux AppImage
```

Output: `release/` directory

### Electron Builder Targets

| Platform | Format   | Config                    |
|----------|----------|---------------------------|
| Windows  | `.exe`   | NSIS installer            |
| macOS    | `.dmg`   | x64 + arm64               |
| Linux    | AppImage | x64                       |

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## MongoDB Schema

| Collection              | Purpose                          |
|-------------------------|----------------------------------|
| `settings`              | App preferences                  |
| `collections`           | API collections with folders     |
| `requests`              | Saved API requests               |
| `requesttabs`           | Open tab persistence             |
| `histories`             | Request history log              |
| `environments`          | Environment variables            |

Default environments seeded on first run: **Local**, **Development**, **Staging**, **Production**.

## Environment Variables

| Variable      | Default                              | Description        |
|---------------|--------------------------------------|--------------------|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/reqforge` | MongoDB connection |

## Security

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- All HTTP requests executed in main process only
- Response content sanitized via DOMPurify before rendering
- Secret environment variables masked in UI
- External links open in system browser

## Tech Stack

| Layer        | Technology                    |
|--------------|-------------------------------|
| UI Framework | Next.js 16, React 19          |
| Desktop      | Electron 42, Electron Builder |
| Styling      | Tailwind CSS 4                |
| State        | Zustand, TanStack Query       |
| HTTP         | Axios (main process)          |
| Database     | MongoDB + Mongoose            |
| Editor       | Monaco Editor                 |
| Panels       | react-resizable-panels        |
| Virtualization | TanStack Virtual            |
| Testing      | Jest, React Testing Library   |

## Scripts Reference

| Script              | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Next.js dev server only              |
| `npm run electron:dev` | Full desktop dev mode             |
| `npm run build`     | Next.js static export                |
| `npm run electron:compile` | Compile Electron TypeScript     |
| `npm run electron:build` | Build UI + Electron              |
| `npm run electron:start` | Run production desktop app       |
| `npm run dist`      | Package installers                 |
| `npm test`          | Run test suite                     |

## License

MIT — © Aritra Dutta
# req-forge
