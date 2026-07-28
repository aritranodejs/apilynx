import type { FormDataEntry, FormFieldType, KeyValuePair } from '@/types';

export const MAX_FORM_FILE_BYTES = 5 * 1024 * 1024;

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function readFileAsBase64(file: File): Promise<{
  fileData: string;
  fileName: string;
  mimeType: string;
}> {
  if (file.size > MAX_FORM_FILE_BYTES) {
    throw new Error(`File exceeds ${MAX_FORM_FILE_BYTES / (1024 * 1024)}MB limit`);
  }
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return {
    fileData: btoa(binary),
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
  };
}

export function buildFormEntries(pairs: KeyValuePair[]): FormDataEntry[] {
  return pairs
    .filter((p) => p.enabled && p.key.trim())
    .map((p) => {
      if (p.fieldType === 'file' && p.fileData) {
        return {
          key: p.key.trim(),
          type: 'file' as FormFieldType,
          fileName: p.fileName ?? 'file',
          mimeType: p.mimeType ?? 'application/octet-stream',
          fileData: p.fileData,
        };
      }
      return {
        key: p.key.trim(),
        type: 'text' as FormFieldType,
        value: p.value,
      };
    });
}

export function buildFormDataFromEntries(entries: FormDataEntry[]): FormData {
  const fd = new FormData();
  for (const entry of entries) {
    if (entry.type === 'file' && entry.fileData) {
      const bytes = base64ToBytes(entry.fileData);
      const blob = new Blob([Uint8Array.from(bytes)], {
        type: entry.mimeType ?? 'application/octet-stream',
      });
      fd.append(entry.key, blob, entry.fileName ?? 'file');
    } else {
      fd.append(entry.key, entry.value ?? '');
    }
  }
  return fd;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
