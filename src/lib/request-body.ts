import type { BodyType, FormDataEntry, KeyValuePair } from '@/types';
import { buildFormEntries } from '@/lib/form-body';

export type BuiltRequestBody = {
  body?: string | FormData;
  bodyType: BodyType;
  formEntries?: FormDataEntry[];
};

export function buildRequestBodyPayload(
  bodyType: BodyType,
  content: string,
  formData: KeyValuePair[]
): BuiltRequestBody {
  switch (bodyType) {
    case 'json':
    case 'raw':
    case 'graphql':
      return { body: content, bodyType: bodyType === 'graphql' ? 'json' : bodyType };
    case 'x-www-form-urlencoded': {
      const params = new URLSearchParams();
      formData
        .filter((p) => p.enabled && p.key.trim())
        .forEach((p) => params.set(p.key.trim(), p.value));
      return { body: params.toString(), bodyType: 'x-www-form-urlencoded' };
    }
    case 'form-data': {
      const formEntries = buildFormEntries(formData);
      return { bodyType: 'form-data', formEntries };
    }
    default:
      return { bodyType };
  }
}
