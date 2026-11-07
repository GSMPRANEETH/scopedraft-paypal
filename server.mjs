import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extract } from './extract.mjs';
import { createDraft } from './sandbox.mjs';

const html = await readFile(new URL('./index.html', import.meta.url));
const origin = 'http://127.0.0.1:3030';
let review;

createServer(async (request, response) => {
  const json = (status, value) => {
    response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify(value));
  };
  if (request.headers.host !== new URL(origin).host) return json(403, { error: 'Use the local address.' });
  if (request.method === 'GET' && request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return response.end(html);
  }
  if (request.method !== 'POST' || !['/extract', '/draft'].includes(request.url)) {
    return json(404, { error: 'Page not found.' });
  }
  if (request.headers.origin !== origin || request.headers['content-type'] !== 'application/json') {
    return json(403, { error: 'Use the local app to make this request.' });
  }
  let body;
  try {
    const chunks = [];
    let bytes = 0;
    for await (const chunk of request.iterator({ destroyOnReturn: false })) {
      bytes += chunk.length;
      if (bytes > 20000) return json(413, { error: 'Request is too large.' });
      chunks.push(chunk);
    }
    body = JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return json(400, { error: 'Expected JSON input.' });
  }
  if (request.url === '/extract') {
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : '';
    if (!notes || notes.length > 4000 || notes.split('\n').length > 30) {
      return json(400, { error: 'Enter up to 4,000 characters and 30 lines.' });
    }
    try {
      const result = await extract(notes);
      const id = randomUUID();
      // ponytail: One review per local server. Use per-session storage before supporting multiple users.
      review = { id, items: result.items };
      return json(200, { id, ...result });
    } catch (error) {
      return json(502, { error: error.message });
    }
  }
  const current = review;
  if (!current || body?.id !== current.id) return json(409, { error: 'Run extraction again to refresh this review.' });
  const selection = body.indices;
  if (!Array.isArray(selection) || !selection.length || new Set(selection).size !== selection.length ||
      selection.some(index => !Number.isInteger(index) || index < 0 || index >= current.items.length)) {
    return json(400, { error: 'Select one or more reviewed items.' });
  }
  const key = [...selection].sort((a, b) => a - b).join(',');
  if (current.selection && current.selection !== key) {
    return json(409, { error: 'A draft attempt already exists for a different selection. Check PayPal before starting a new review.' });
  }
  current.selection = key;
  current.attempt ??= { requestId: randomUUID() };
  current.draft ??= createDraft(selection.map(index => current.items[index]), current.attempt);
  try {
    return json(200, { id: await current.draft, status: 'DRAFT' });
  } catch (error) {
    current.draft = undefined;
    return json(502, { error: error.message });
  }
}).listen(3030, '127.0.0.1', () => console.log(origin));
