'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef } from 'react';
import type { editor } from 'monaco-editor';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

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

  const handleMount = useCallback(
    (ed: editor.IStandaloneCodeEditor) => {
      editorRef.current = ed;
      ed.onDidChangeModelDecorations(() => {
        const model = ed.getModel();
        if (model && onValidate) {
          const markers = editorRef.current
            ? (window as unknown as { monaco: { editor: { getModelMarkers: (o: { resource: unknown }) => editor.IMarker[] } } }).monaco?.editor?.getModelMarkers({ resource: model.uri }) ?? []
            : [];
          onValidate(markers);
        }
      });
    },
    [onValidate]
  );

  return (
    <div className={cn('overflow-hidden rounded-md border border-zinc-700', className)}>
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
