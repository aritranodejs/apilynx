'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { curlToRequest } from '@/lib/curl-parser';
import { showError, showSuccess } from '@/stores/toast-store';
import type { ApiRequest } from '@/types';

interface ImportCurlModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (request: Partial<ApiRequest>) => void;
}

export function ImportCurlModal({ open, onClose, onImport }: ImportCurlModalProps) {
  const [curl, setCurl] = useState('');

  const handleImport = () => {
    if (!curl.trim()) {
      showError('Paste a cURL command first');
      return;
    }
    try {
      const parsed = curlToRequest(curl);
      onImport({
        method: parsed.method,
        url: parsed.url,
        params: parsed.params,
        headers: parsed.headers,
        body: parsed.body,
        auth: parsed.auth,
        name: parsed.name,
      });
      showSuccess('cURL imported — review and send');
      setCurl('');
      onClose();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to parse cURL');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Import cURL" className="max-w-2xl">
      <p className="mb-3 text-xs text-zinc-500">
        Paste a cURL command from browser DevTools, Postman, or terminal. Apilynx will structure
        method, URL, headers, and body automatically.
      </p>
      <textarea
        value={curl}
        onChange={(e) => setCurl(e.target.value)}
        placeholder={`curl -X POST 'https://api.example.com/users' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"name":"test"}'`}
        className="w-full h-40 rounded-md border border-zinc-700 bg-zinc-900 p-3 font-mono text-xs text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleImport}>
          Import &amp; Structure
        </Button>
      </div>
    </Modal>
  );
}
