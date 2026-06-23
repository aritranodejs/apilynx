'use client';

import { useMemo, useState } from 'react';
import type { ApiRequest, CodeLanguage } from '@/types';
import { generateCode } from '@/lib/code-generator';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/ui/code-editor';
import { Copy, Check } from 'lucide-react';

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: 'javascript-fetch', label: 'JavaScript (Fetch)' },
  { value: 'axios', label: 'Axios' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'curl', label: 'cURL' },
  { value: 'php-curl', label: 'PHP cURL' },
  { value: 'laravel', label: 'Laravel HTTP' },
  { value: 'python', label: 'Python Requests' },
  { value: 'java-okhttp', label: 'Java OkHttp' },
];

interface CodeGenPanelProps {
  request: ApiRequest;
  resolvedUrl: string;
}

export function CodeGenPanel({ request, resolvedUrl }: CodeGenPanelProps) {
  const [language, setLanguage] = useState<CodeLanguage>('javascript-fetch');
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () => generateCode(language, { request, resolvedUrl }),
    [language, request, resolvedUrl]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const editorLanguage =
    language === 'python'
      ? 'python'
      : language === 'curl'
        ? 'shell'
        : language.includes('java')
          ? 'java'
          : 'javascript';

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="flex items-center gap-3">
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
          className="flex-1"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>
        <Button variant="secondary" onClick={() => void handleCopy()}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <CodeEditor value={code} onChange={() => undefined} language={editorLanguage} readOnly height="320px" />
    </div>
  );
}
