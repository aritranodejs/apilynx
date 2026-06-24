'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { EditorProps } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { cn } from '@/lib/utils';

type MonacoComponent = React.ComponentType<EditorProps>;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
  height?: string;
  onValidate?: (markers: editor.IMarker[]) => void;
}

export function CodeEditor({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  className,
  height = '200px',
  onValidate,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [MonacoEditor, setMonacoEditor] = useState<MonacoComponent | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void import('@monaco-editor/react')
      .then((mod) => {
        if (!cancelled) setMonacoEditor(() => mod.default);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMount = useCallback(
    (ed: editor.IStandaloneCodeEditor) => {
      editorRef.current = ed;
      ed.onDidChangeModelDecorations(() => {
        const model = ed.getModel();
        if (model && onValidate) {
          const markers = editorRef.current
            ? (
                window as unknown as {
                  monaco: {
                    editor: {
                      getModelMarkers: (o: { resource: unknown }) => editor.IMarker[];
                    };
                  };
                }
              ).monaco?.editor?.getModelMarkers({ resource: model.uri }) ?? []
            : [];
          onValidate(markers);
        }
      });
    },
    [onValidate]
  );

  const shellClass = cn('overflow-hidden rounded-md border border-zinc-700', className);

  if (loadError) {
    return (
      <div className={shellClass} style={{ height }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className="h-full w-full resize-none bg-zinc-950 p-3 font-mono text-xs text-zinc-100 outline-none"
        />
      </div>
    );
  }

  if (!MonacoEditor) {
    return (
      <div
        className={cn(shellClass, 'flex items-center justify-center bg-zinc-950 text-xs text-zinc-500')}
        style={{ height }}
      >
        Loading editor...
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
