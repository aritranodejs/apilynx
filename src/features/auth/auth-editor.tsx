'use client';

import type { AuthConfig } from '@/types';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';
import { describeAuthSource, resolveEffectiveAuth } from '@/lib/utils';

interface AuthEditorProps {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
  showInherit?: boolean;
  collectionAuth?: AuthConfig;
  environmentAuth?: AuthConfig;
}

function authTypeLabel(type: AuthConfig['type']): string {
  switch (type) {
    case 'bearer':
      return 'Bearer Token';
    case 'basic':
      return 'Basic Auth';
    case 'api-key':
      return 'API Key';
    case 'none':
      return 'No Auth';
    default:
      return 'Unknown';
  }
}

export function AuthEditor({
  auth,
  onChange,
  showInherit = false,
  collectionAuth,
  environmentAuth,
}: AuthEditorProps) {
  const update = (partial: Partial<AuthConfig>) => onChange({ ...auth, ...partial });

  const inherited = showInherit && auth.type === 'inherit'
    ? resolveEffectiveAuth(auth, { collectionAuth, environmentAuth })
    : null;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-400 w-24">Type</label>
        <Select
          value={auth.type}
          onChange={(e) => update({ type: e.target.value as AuthConfig['type'] })}
        >
          {showInherit && <option value="inherit">Inherit from parent</option>}
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="api-key">API Key</option>
        </Select>
      </div>

      {showInherit && auth.type === 'inherit' && (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400">
          {inherited && inherited.type !== 'none' ? (
            <span>
              Using <span className="text-orange-400">{authTypeLabel(inherited.type)}</span> from{' '}
              {describeAuthSource(auth, { collectionAuth, environmentAuth })}. Override by choosing
              a specific auth type above.
            </span>
          ) : (
            <span>
              No auth configured on this collection or active environment. Set default auth in the
              Environments panel (or collection auth) to apply it to all inheriting requests.
            </span>
          )}
        </div>
      )}

      {auth.type === 'bearer' && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-400 w-24">Token</label>
          <PasswordInput
            value={auth.bearerToken ?? ''}
            onChange={(e) => update({ bearerToken: e.target.value })}
            placeholder="Bearer token or {{token}}"
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-400 w-24">Username</label>
            <Input
              value={auth.basicUsername ?? ''}
              onChange={(e) => update({ basicUsername: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-400 w-24">Password</label>
            <PasswordInput
              value={auth.basicPassword ?? ''}
              onChange={(e) => update({ basicPassword: e.target.value })}
            />
          </div>
        </>
      )}

      {auth.type === 'api-key' && (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-400 w-24">Key</label>
            <Input
              value={auth.apiKeyKey ?? ''}
              onChange={(e) => update({ apiKeyKey: e.target.value })}
              placeholder="X-API-Key"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-400 w-24">Value</label>
            <PasswordInput
              value={auth.apiKeyValue ?? ''}
              onChange={(e) => update({ apiKeyValue: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-400 w-24">Add to</label>
            <Select
              value={auth.apiKeyAddTo ?? 'header'}
              onChange={(e) => update({ apiKeyAddTo: e.target.value as 'header' | 'query' })}
            >
              <option value="header">Header</option>
              <option value="query">Query Params</option>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
