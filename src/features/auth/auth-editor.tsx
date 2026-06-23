'use client';

import type { AuthConfig } from '@/types';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface AuthEditorProps {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
}

export function AuthEditor({ auth, onChange }: AuthEditorProps) {
  const update = (partial: Partial<AuthConfig>) => onChange({ ...auth, ...partial });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-400 w-24">Type</label>
        <Select
          value={auth.type}
          onChange={(e) => update({ type: e.target.value as AuthConfig['type'] })}
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="api-key">API Key</option>
        </Select>
      </div>

      {auth.type === 'bearer' && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-400 w-24">Token</label>
          <Input
            type="password"
            value={auth.bearerToken ?? ''}
            onChange={(e) => update({ bearerToken: e.target.value })}
            placeholder="Bearer token or {{TOKEN}}"
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
            <Input
              type="password"
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
            <Input
              type="password"
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
