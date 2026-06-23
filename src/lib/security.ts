import DOMPurify from 'dompurify';

/** Sanitize HTML/text before rendering in the response viewer. Never execute response content. */
export function sanitizeResponseContent(content: string): string {
  if (typeof window === 'undefined') {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/** Block script-like patterns in displayed content */
export function stripDangerousPatterns(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[removed]')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function maskSecret(value: string): string {
  if (value.length <= 4) return '••••';
  return `${value.slice(0, 2)}${'•'.repeat(Math.min(value.length - 4, 12))}${value.slice(-2)}`;
}
