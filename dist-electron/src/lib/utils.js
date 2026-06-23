"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.generateId = generateId;
exports.createEmptyKeyValue = createEmptyKeyValue;
exports.createDefaultAuth = createDefaultAuth;
exports.createDefaultBody = createDefaultBody;
exports.createDefaultRequest = createDefaultRequest;
exports.formatBytes = formatBytes;
exports.formatDuration = formatDuration;
exports.getStatusColor = getStatusColor;
exports.buildUrlWithParams = buildUrlWithParams;
exports.substituteVariables = substituteVariables;
exports.applyAuthToHeaders = applyAuthToHeaders;
exports.applyAuthToUrl = applyAuthToUrl;
exports.headersFromKeyValues = headersFromKeyValues;
exports.isValidJson = isValidJson;
exports.prettyJson = prettyJson;
exports.minifyJson = minifyJson;
exports.methodAllowsBody = methodAllowsBody;
exports.normalizeRequestUrl = normalizeRequestUrl;
exports.methodColor = methodColor;
exports.sanitizeForDisplay = sanitizeForDisplay;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function generateId() {
    return crypto.randomUUID();
}
function createEmptyKeyValue() {
    return { id: generateId(), key: '', value: '', enabled: true };
}
function createDefaultAuth() {
    return { type: 'none' };
}
function createDefaultBody(type = 'json') {
    return {
        type,
        content: type === 'json' ? '{\n  \n}' : '',
        formData: [createEmptyKeyValue()],
    };
}
function createDefaultRequest(name = 'Untitled Request') {
    const now = new Date().toISOString();
    return {
        id: generateId(),
        name,
        method: 'GET',
        url: '',
        params: [createEmptyKeyValue()],
        headers: [createEmptyKeyValue()],
        body: createDefaultBody(),
        auth: createDefaultAuth(),
        createdAt: now,
        updatedAt: now,
    };
}
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
}
function getStatusColor(status) {
    if (status >= 200 && status < 300)
        return 'text-emerald-400';
    if (status >= 300 && status < 400)
        return 'text-amber-400';
    if (status >= 400 && status < 500)
        return 'text-orange-400';
    if (status >= 500)
        return 'text-red-400';
    return 'text-zinc-400';
}
function buildUrlWithParams(baseUrl, params) {
    if (!baseUrl)
        return '';
    try {
        const url = new URL(baseUrl.includes('://') ? baseUrl : `http://${baseUrl}`);
        params
            .filter((p) => p.enabled && p.key.trim())
            .forEach((p) => url.searchParams.set(p.key.trim(), p.value));
        return url.toString();
    }
    catch {
        const enabled = params.filter((p) => p.enabled && p.key.trim());
        if (enabled.length === 0)
            return baseUrl;
        const query = enabled
            .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`)
            .join('&');
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}${query}`;
    }
}
function substituteVariables(text, variables) {
    return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
        const trimmed = key.trim();
        return variables[trimmed] ?? `{{${trimmed}}}`;
    });
}
function applyAuthToHeaders(auth, headers) {
    const result = { ...headers };
    switch (auth.type) {
        case 'bearer':
            if (auth.bearerToken) {
                result['Authorization'] = `Bearer ${auth.bearerToken}`;
            }
            break;
        case 'basic':
            if (auth.basicUsername !== undefined) {
                const encoded = btoa(`${auth.basicUsername}:${auth.basicPassword ?? ''}`);
                result['Authorization'] = `Basic ${encoded}`;
            }
            break;
        case 'api-key':
            if (auth.apiKeyKey && auth.apiKeyValue && auth.apiKeyAddTo === 'header') {
                result[auth.apiKeyKey] = auth.apiKeyValue;
            }
            break;
        default:
            break;
    }
    return result;
}
function applyAuthToUrl(url, auth) {
    if (auth.type !== 'api-key' || auth.apiKeyAddTo !== 'query')
        return url;
    if (!auth.apiKeyKey || !auth.apiKeyValue)
        return url;
    try {
        const parsed = new URL(url.includes('://') ? url : `http://${url}`);
        parsed.searchParams.set(auth.apiKeyKey, auth.apiKeyValue);
        return parsed.toString();
    }
    catch {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${encodeURIComponent(auth.apiKeyKey)}=${encodeURIComponent(auth.apiKeyValue)}`;
    }
}
function headersFromKeyValues(pairs) {
    const headers = {};
    pairs
        .filter((p) => p.enabled && p.key.trim())
        .forEach((p) => {
        headers[p.key.trim()] = p.value;
    });
    return headers;
}
function isValidJson(str) {
    if (!str.trim())
        return { valid: true };
    try {
        JSON.parse(str);
        return { valid: true };
    }
    catch (e) {
        const message = e instanceof Error ? e.message : 'Invalid JSON';
        return { valid: false, error: message };
    }
}
function prettyJson(str) {
    return JSON.stringify(JSON.parse(str), null, 2);
}
function minifyJson(str) {
    return JSON.stringify(JSON.parse(str));
}
function methodAllowsBody(method) {
    return method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
}
/** Ensure URLs have a protocol so requests work when users omit https:// */
function normalizeRequestUrl(url) {
    const trimmed = url.trim();
    if (!trimmed)
        return trimmed;
    if (/^https?:\/\//i.test(trimmed))
        return trimmed;
    return `https://${trimmed}`;
}
function methodColor(method) {
    const colors = {
        GET: 'text-emerald-400',
        POST: 'text-amber-400',
        PUT: 'text-blue-400',
        PATCH: 'text-purple-400',
        DELETE: 'text-red-400',
        HEAD: 'text-cyan-400',
        OPTIONS: 'text-pink-400',
    };
    return colors[method];
}
function sanitizeForDisplay(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}
