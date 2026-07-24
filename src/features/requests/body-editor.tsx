'use client';

import { useMemo, useState } from 'react';
import type { BodyType, RequestBody } from '@/types';
import { CodeEditor } from '@/components/ui/code-editor';
import { KeyValueEditor } from '@/components/ui/key-value-editor';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { isValidJson, minifyJson, prettyJson } from '@/lib/utils';
import { AlertCircle, Minimize2, Wand2 } from 'lucide-react';

interface BodyEditorProps {
  body: RequestBody;
  onChange: (body: RequestBody) => void;
}

const DEFAULT_GQL_QUERY = `query {\n  __typename\n}`;

const DEFAULT_GQL_VARIABLES = `{}`;

function parseGraphqlContent(content: string): { query: string; variables: string } {
  const trimmed = content.trim();
  if (!trimmed) {
    return { query: DEFAULT_GQL_QUERY, variables: DEFAULT_GQL_VARIABLES };
  }
  try {
    const parsed = JSON.parse(trimmed) as { query?: unknown; variables?: unknown };
    const query = typeof parsed.query === 'string' ? parsed.query : '';
    const variables =
      parsed.variables === undefined
        ? '{}'
        : typeof parsed.variables === 'string'
          ? parsed.variables
          : JSON.stringify(parsed.variables ?? {}, null, 2);
    return { query, variables };
  } catch {
    // Treat raw text as the query document
    return { query: content, variables: '{}' };
  }
}

function composeGraphqlContent(query: string, variablesText: string): string {
  let variables: unknown = {};
  try {
    variables = JSON.parse(variablesText || '{}');
  } catch {
    variables = {};
  }
  return JSON.stringify({ query, variables }, null, 2);
}

export function BodyEditor({ body, onChange }: BodyEditorProps) {
  const [jsonError, setJsonError] = useState<string | undefined>();

  const validation = useMemo(() => {
    if (body.type !== 'json') return { valid: true };
    return isValidJson(body.content);
  }, [body.type, body.content]);

  const graphqlParts = useMemo(
    () => (body.type === 'graphql' ? parseGraphqlContent(body.content) : null),
    [body.type, body.content]
  );

  const variablesValidation = useMemo(() => {
    if (!graphqlParts) return { valid: true as const };
    return isValidJson(graphqlParts.variables);
  }, [graphqlParts]);

  const handleFormat = () => {
    try {
      onChange({ ...body, content: prettyJson(body.content) });
      setJsonError(undefined);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Format failed');
    }
  };

  const handleMinify = () => {
    try {
      onChange({ ...body, content: minifyJson(body.content) });
      setJsonError(undefined);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Minify failed');
    }
  };

  const handleTypeChange = (type: BodyType) => {
    if (type === 'graphql') {
      const nextContent =
        body.type === 'graphql' && body.content.trim()
          ? body.content
          : composeGraphqlContent(DEFAULT_GQL_QUERY, DEFAULT_GQL_VARIABLES);
      onChange({ ...body, type, content: nextContent });
      return;
    }
    onChange({ ...body, type });
  };

  const updateGraphql = (query: string, variables: string) => {
    onChange({
      ...body,
      type: 'graphql',
      content: composeGraphqlContent(query, variables),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-2">
        <Select
          value={body.type}
          onChange={(e) => handleTypeChange(e.target.value as BodyType)}
        >
          <option value="json">JSON</option>
          <option value="raw">Raw Text</option>
          <option value="form-data">Form Data</option>
          <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
          <option value="graphql">GraphQL</option>
        </Select>
        {body.type === 'json' && (
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={handleFormat}>
              <Wand2 className="h-3.5 w-3.5" /> Pretty
            </Button>
            <Button variant="ghost" size="sm" onClick={handleMinify}>
              <Minimize2 className="h-3.5 w-3.5" /> Minify
            </Button>
          </div>
        )}
        {body.type === 'graphql' && (
          <p className="ml-auto text-[11px] text-zinc-500 hidden sm:block">
            Sent as POST JSON · {'{ query, variables }'}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {body.type === 'graphql' && graphqlParts && (
          <div className="flex flex-col gap-4 min-h-0">
            <div>
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-zinc-500">Query</p>
              <CodeEditor
                value={graphqlParts.query}
                onChange={(query) => updateGraphql(query, graphqlParts.variables)}
                language="graphql"
                height="200px"
              />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-zinc-500">
                Variables (JSON)
              </p>
              <CodeEditor
                value={graphqlParts.variables}
                onChange={(variables) => updateGraphql(graphqlParts.query, variables)}
                language="json"
                height="140px"
              />
              {!variablesValidation.valid && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {variablesValidation.error ?? 'Invalid variables JSON'}
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-600">
              Tip: set method to POST and point the URL at your GraphQL endpoint (for example{' '}
              <code className="text-zinc-400">{'{{BASE_URL}}/graphql'}</code>).
            </p>
          </div>
        )}

        {(body.type === 'json' || body.type === 'raw') && (
          <>
            <CodeEditor
              value={body.content}
              onChange={(content) => onChange({ ...body, content })}
              language={body.type === 'json' ? 'json' : 'plaintext'}
              height="280px"
            />
            {body.type === 'json' && !validation.valid && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {validation.error ?? jsonError}
              </div>
            )}
          </>
        )}

        {(body.type === 'form-data' || body.type === 'x-www-form-urlencoded') && (
          <KeyValueEditor
            pairs={body.formData}
            onChange={(formData) => onChange({ ...body, formData })}
          />
        )}
      </div>
    </div>
  );
}
