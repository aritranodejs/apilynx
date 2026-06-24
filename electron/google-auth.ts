import http from 'http';
import crypto from 'crypto';
import { shell } from 'electron';
import axios from 'axios';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const SIGN_IN_TIMEOUT_MS = 5 * 60 * 1000;

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
}

function generatePkce(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

function getRandomPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = http.createServer();
    probe.listen(0, '127.0.0.1', () => {
      const addr = probe.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to allocate callback port'));
        return;
      }
      const port = addr.port;
      probe.close((err) => (err ? reject(err) : resolve(port)));
    });
    probe.on('error', reject);
  });
}

function successHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Signed in</title></head>
<body style="font-family:system-ui,sans-serif;background:#09090b;color:#e4e4e7;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
  <div style="text-align:center;padding:2rem">
    <h1 style="color:#f97316;font-size:1.25rem">Signed in to Apilynx</h1>
    <p style="color:#a1a1aa">You can close this tab and return to the app.</p>
  </div>
</body>
</html>`;
}

function errorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Sign-in failed</title></head>
<body style="font-family:system-ui,sans-serif;background:#09090b;color:#e4e4e7;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
  <div style="text-align:center;padding:2rem;max-width:28rem">
    <h1 style="color:#f87171;font-size:1.25rem">Sign-in failed</h1>
    <p style="color:#a1a1aa">${message}</p>
  </div>
</body>
</html>`;
}

export async function signInWithGoogle(): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId) {
    throw new Error('Google sign-in is not configured. Add GOOGLE_CLIENT_ID to your .env file.');
  }

  const { verifier, challenge } = generatePkce();
  const port = await getRandomPort();
  const redirectUri = `http://127.0.0.1:${port}/callback`;

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      server.close();
      fn();
    };

    const server = http.createServer((req, res) => {
      void (async () => {
        try {
          if (!req.url?.startsWith('/callback')) {
            res.writeHead(404);
            res.end();
            return;
          }

          const callbackUrl = new URL(req.url, `http://127.0.0.1:${port}`);
          const code = callbackUrl.searchParams.get('code');
          const error = callbackUrl.searchParams.get('error');

          if (error) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(errorHtml('Sign-in was cancelled.'));
            finish(() => reject(new Error('Google sign-in was cancelled')));
            return;
          }

          if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(errorHtml('Missing authorization code.'));
            finish(() => reject(new Error('Google sign-in failed: missing authorization code')));
            return;
          }

          const tokenBody = new URLSearchParams({
            code,
            client_id: clientId,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            code_verifier: verifier,
          });
          if (clientSecret) tokenBody.set('client_secret', clientSecret);

          const tokenRes = await axios.post<{ access_token: string }>(
            GOOGLE_TOKEN_URL,
            tokenBody.toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          );

          const userRes = await axios.get<{
            sub: string;
            email?: string;
            name?: string;
            picture?: string;
          }>(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
          });

          if (!userRes.data.email) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(errorHtml('Google did not return an email address for this account.'));
            finish(() => reject(new Error('Google account has no email address')));
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(successHtml());

          finish(() =>
            resolve({
              googleId: userRes.data.sub,
              email: userRes.data.email!.toLowerCase(),
              name: userRes.data.name?.trim() || userRes.data.email!.split('@')[0],
              avatarUrl: userRes.data.picture,
            })
          );
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(errorHtml('Could not complete Google sign-in.'));
          finish(() =>
            reject(err instanceof Error ? err : new Error('Google sign-in failed'))
          );
        }
      })();
    });

    const timeout = setTimeout(() => {
      finish(() => reject(new Error('Google sign-in timed out. Please try again.')));
    }, SIGN_IN_TIMEOUT_MS);

    server.on('error', (err) => finish(() => reject(err)));

    server.listen(port, '127.0.0.1', () => {
      const authUrl = new URL(GOOGLE_AUTH_URL);
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('code_challenge', challenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      authUrl.searchParams.set('prompt', 'select_account');

      void shell.openExternal(authUrl.toString());
    });
  });
}
