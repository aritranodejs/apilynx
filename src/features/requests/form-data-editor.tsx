'use client';

import { memo, useRef } from 'react';
import type { FormFieldType, KeyValuePair } from '@/types';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Trash2, Paperclip, X, FileImage } from 'lucide-react';
import { createEmptyKeyValue } from '@/lib/utils';
import { formatFileSize, MAX_FORM_FILE_BYTES, readFileAsBase64 } from '@/lib/form-body';
import { showError } from '@/stores/toast-store';
import { cn } from '@/lib/utils';

interface FormDataEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}

function createEmptyFormRow(): KeyValuePair {
  return { ...createEmptyKeyValue(), fieldType: 'text' };
}

export const FormDataEditor = memo(function FormDataEditor({
  pairs,
  onChange,
}: FormDataEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeFileIdRef = useRef<string | null>(null);

  const updatePair = (id: string, patch: Partial<KeyValuePair>) => {
    onChange(pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const addRow = () => onChange([...pairs, createEmptyFormRow()]);

  const removeRow = (id: string) => {
    if (pairs.length <= 1) {
      onChange([createEmptyFormRow()]);
    } else {
      onChange(pairs.filter((p) => p.id !== id));
    }
  };

  const handleFieldTypeChange = (id: string, fieldType: FormFieldType) => {
    if (fieldType === 'text') {
      updatePair(id, {
        fieldType: 'text',
        fileName: undefined,
        mimeType: undefined,
        fileData: undefined,
        value: '',
      });
    } else {
      updatePair(id, {
        fieldType: 'file',
        value: '',
        fileName: undefined,
        mimeType: undefined,
        fileData: undefined,
      });
    }
  };

  const openFilePicker = (id: string) => {
    activeFileIdRef.current = id;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (file: File | undefined) => {
    const id = activeFileIdRef.current;
    activeFileIdRef.current = null;
    if (!id || !file) return;

    try {
      const { fileData, fileName, mimeType } = await readFileAsBase64(file);
      updatePair(id, {
        fieldType: 'file',
        fileData,
        fileName,
        mimeType,
        value: fileName,
      });
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not read file');
    }
  };

  const clearFile = (id: string) => {
    updatePair(id, {
      fileName: undefined,
      mimeType: undefined,
      fileData: undefined,
      value: '',
    });
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf,.json,.xml,.txt,.csv,.zip"
        onChange={(e) => {
          handleFileSelected(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="hidden sm:grid sm:grid-cols-[24px_1fr_88px_1fr_32px] sm:gap-2 sm:px-1 sm:text-xs sm:font-medium sm:text-zinc-500">
        <span />
        <span>Key</span>
        <span>Type</span>
        <span>Value / File</span>
        <span />
      </div>

      {pairs.map((pair) => {
        const isFile = pair.fieldType === 'file';
        const hasFile = isFile && pair.fileData && pair.fileName;

        return (
          <div
            key={pair.id}
            className="grid grid-cols-[24px_1fr_32px] gap-2 items-start sm:grid-cols-[24px_1fr_88px_1fr_32px] sm:items-center"
          >
            <Checkbox
              checked={pair.enabled}
              onChange={(v) => updatePair(pair.id, { enabled: v })}
              className="mt-2 sm:mt-0"
            />
            <Input
              value={pair.key}
              onChange={(e) => updatePair(pair.id, { key: e.target.value })}
              placeholder="Key"
              className={cn(!pair.enabled && 'opacity-50')}
            />

            <Select
              value={pair.fieldType ?? 'text'}
              onChange={(e) => handleFieldTypeChange(pair.id, e.target.value as FormFieldType)}
              className="hidden sm:block"
            >
              <option value="text">Text</option>
              <option value="file">File</option>
            </Select>

            <div className="col-span-2 sm:col-span-1">
              {isFile ? (
                <div className="flex min-h-9 items-center gap-2">
                  {hasFile ? (
                    <div
                      className={cn(
                        'flex min-w-0 flex-1 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/60 px-2.5 py-1.5',
                        !pair.enabled && 'opacity-50'
                      )}
                    >
                      {pair.mimeType?.startsWith('image/') ? (
                        <FileImage className="h-4 w-4 shrink-0 text-orange-400" />
                      ) : (
                        <Paperclip className="h-4 w-4 shrink-0 text-orange-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-zinc-200">{pair.fileName}</p>
                        <p className="text-[10px] text-zinc-500">
                          {pair.mimeType ?? 'file'}
                          {pair.fileData
                            ? ` · ~${formatFileSize(Math.round((pair.fileData.length * 3) / 4))}`
                            : ''}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="!p-1 shrink-0 text-zinc-500 hover:text-red-400"
                        onClick={() => clearFile(pair.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      className="w-full justify-center gap-2 border-dashed border-zinc-700 text-zinc-400 hover:border-orange-500/40 hover:text-orange-300"
                      onClick={() => openFilePicker(pair.id)}
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Select file
                    </Button>
                  )}
                  <Select
                    value="file"
                    onChange={(e) => handleFieldTypeChange(pair.id, e.target.value as FormFieldType)}
                    className="sm:hidden w-24 shrink-0"
                  >
                    <option value="text">Text</option>
                    <option value="file">File</option>
                  </Select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={pair.value}
                    onChange={(e) => updatePair(pair.id, { value: e.target.value })}
                    placeholder="Value"
                    className={cn('flex-1', !pair.enabled && 'opacity-50')}
                  />
                  <Select
                    value="text"
                    onChange={(e) => handleFieldTypeChange(pair.id, e.target.value as FormFieldType)}
                    className="sm:hidden w-24 shrink-0"
                  >
                    <option value="text">Text</option>
                    <option value="file">File</option>
                  </Select>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => removeRow(pair.id)}
              className="!p-1 text-zinc-500 hover:text-red-400 sm:mt-0 mt-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" type="button" onClick={addRow}>
          <Plus className="h-4 w-4" /> Add field
        </Button>
        <p className="text-[11px] text-zinc-600">
          Max file size {MAX_FORM_FILE_BYTES / (1024 * 1024)}MB per field · images, PDF, JSON, and more
        </p>
      </div>
    </div>
  );
});
