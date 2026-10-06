// Firestore emulator started by playwright.config.ts. Read and clear through its REST API
// (no firebase-admin in the test process). The emulator accepts `Bearer owner` as an admin token.

export const EMULATOR_HOST = '127.0.0.1:8085';
export const EMULATOR_PROJECT = 'demo-rostel-portfolio';

const DOCUMENTS = `http://${EMULATOR_HOST}/v1/projects/${EMULATOR_PROJECT}/databases/(default)/documents`;
const AUTH = { Authorization: 'Bearer owner' };

type Value =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { mapValue: { fields?: Record<string, Value> } }
  | { arrayValue: { values?: Value[] } };

export type Doc = { id: string; data: Record<string, unknown> };

/** Firestore REST value to plain JS (integers become numbers, timestamps stay ISO strings). */
function decode(value: Value): unknown {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('mapValue' in value) return decodeFields(value.mapValue.fields ?? {});
  return (value.arrayValue.values ?? []).map(decode);
}

function decodeFields(fields: Record<string, Value>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decode(v)]));
}

type RawDoc = { name: string; fields?: Record<string, Value> };
const toDoc = (raw: RawDoc): Doc => ({ id: raw.name.split('/').pop() ?? '', data: decodeFields(raw.fields ?? {}) });

/** Every document of a top-level collection. */
export async function listDocs(collection: string): Promise<Doc[]> {
  const docs: Doc[] = [];
  let pageToken = '';
  do {
    const url = `${DOCUMENTS}/${collection}?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const res = await fetch(url, { headers: AUTH });
    if (!res.ok) throw new Error(`emulator list ${collection}: ${res.status}`);
    const body = (await res.json()) as { documents?: RawDoc[]; nextPageToken?: string };
    docs.push(...(body.documents ?? []).map(toDoc));
    pageToken = body.nextPageToken ?? '';
  } while (pageToken);
  return docs;
}

/** One document, or null when it does not exist. */
export async function getDoc(path: string): Promise<Doc | null> {
  const res = await fetch(`${DOCUMENTS}/${path}`, { headers: AUTH });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`emulator get ${path}: ${res.status}`);
  return toDoc((await res.json()) as RawDoc);
}

/** Submissions whose payload contains `token` in any string field (tests tag their input with a unique token). */
export async function submissionsWith(token: string): Promise<Doc[]> {
  const docs = await listDocs('submissions');
  return docs.filter((d) => JSON.stringify(d.data.payload ?? {}).includes(token));
}

/** Deletes every document of the emulator project. */
export async function clearEmulator(): Promise<void> {
  const res = await fetch(`http://${EMULATOR_HOST}/emulator/v1/projects/${EMULATOR_PROJECT}/databases/(default)/documents`, {
    method: 'DELETE',
    headers: AUTH,
  });
  if (!res.ok) throw new Error(`emulator clear: ${res.status}`);
}

/** Today in Africa/Porto-Novo, the day key of `stats_daily` (same as `dayKey` in src/lib/server/stats.ts). */
export function statsDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Porto-Novo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** A token unique to this test run, safe in text fields and Firestore keys. */
export function uniqueToken(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
