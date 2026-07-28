# Apilynx Demo Video Script

**Target length:** 90–120 seconds  
**Tone:** Clear, confident, developer-friendly — not hype-heavy  
**Format:** Screen recording + light voiceover (or captions only)

---

## Scene 1 — Hook (0:00–0:12)

**Visual:** Landing page hero → cursor clicks "Try in browser"

**VO / Caption:**
> Every API client makes you sign up before you send a GET. Apilynx doesn't.

**On screen text:** *No signup · Free · MIT*

---

## Scene 2 — First request (0:12–0:35)

**Visual:** Browser app `/app` — empty request tab

**Actions:**
1. Method: GET
2. URL: `https://api.github.com/users/octocat`
3. Click **Send**

**VO:**
> Open Apilynx in your browser or install the desktop app. Paste a URL, pick a method, hit Send. You get status, headers, and formatted JSON — instantly.

**On screen:** Highlight green **200 OK** and response body.

---

## Scene 3 — Environments (0:35–0:50)

**Visual:** Environments panel

**Actions:**
1. Create environment `Production` with `BASE_URL = https://api.github.com`
2. Change URL to `{{BASE_URL}}/users/octocat`
3. Send again

**VO:**
> Environments work like you'd expect — `{{variables}}` in URLs, headers, and auth. Switch staging to production in one click.

---

## Scene 4 — GraphQL (0:50–1:05)

**Visual:** New request, Body → GraphQL

**Actions:**
1. POST to a GraphQL endpoint (or demo endpoint)
2. Paste a short query + variables
3. Send

**VO:**
> REST and GraphQL live in the same builder. No tab hopping between tools.

---

## Scene 5 — Collections & runner (1:05–1:20)

**Visual:** Save request to collection → open collection runner → run 2–3 requests

**VO:**
> Save to collections, organize by workspace, and run a collection to smoke-test your API before deploy.

---

## Scene 6 — Load test & mocks (1:20–1:35) *(optional cut if short)*

**Visual:** Load test panel — 10 concurrent requests; brief mock server toggle

**VO:**
> Load tests and mocks are built in — not another subscription.

---

## Scene 7 — CTA (1:35–1:50)

**Visual:** Back to landing → Download button + GitHub logo

**VO:**
> Apilynx is free for core testing and MIT licensed. Download for desktop or try it in your browser today.

**On screen text:**
- **apilynx.dev** *(replace with your URL)*
- Download free · Try in browser

**End card:** Logo + orange CTA button

---

## B-roll suggestions

- Terminal with `curl` → Import cURL into Apilynx
- Docs page: "Why Apilynx vs Postman"
- Dark mode UI with orange Send button (brand consistency)

---

## Music / pacing notes

- Subtle ambient electronic, low volume
- Cut on UI actions — no dead air while loading (use fast APIs or pre-cached responses)
- Prefer 1080p capture; crop to 16:9 for YouTube and Product Hunt maker video

---

## Short cut (60s version)

Keep scenes 1, 2, 5, and 7 only. Skip GraphQL, load test, and mocks.
