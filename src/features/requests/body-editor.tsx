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

export function BodyEditor({ body, onChange }: BodyEditorProps) {
  const [jsonError, setJsonError] = useState<string | undefined>();

  const validation = useMemo(() => {
    if (body.type !== 'json') return { valid: true };
    return isValidJson(body.content);
  }, [body.type, body.content]);

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-2">
        <Select
          value={body.type}
          onChange={(e) => onChange({ ...body, type: e.target.value as BodyType })}
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
      </div>

      <div className="flex-1 overflow-auto p-4">
        {(body.type === 'json' || body.type === 'raw' || body.type === 'graphql') && (
          <>
            <CodeEditor
              value={body.content}
              onChange={(content) => onChange({ ...body, content })}
              language={body.type === 'json' || body.type === 'graphql' ? 'json' : 'plaintext'}
              height="280px"
            />
            {body.type === 'graphql' && !body.content.trim() && (
              <p className="mt-2 text-xs text-zinc-500">
                Use JSON: {`{"query": "{ users { id } }", "variables": {}}`}
              </p>
            )}
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
