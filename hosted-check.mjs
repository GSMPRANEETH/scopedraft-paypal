import assert from 'node:assert/strict';
import { handle, sampleNotes } from './netlify/functions/sample.mjs';

const rows = new Map();
const store = {
  get: async key => structuredClone(rows.get(key)),
  setJSON: async (key, value, { onlyIfNew } = {}) => {
    if (onlyIfNew && rows.has(key)) return { modified: false };
    rows.set(key, structuredClone(value));
    return { modified: true };
  },
  delete: async key => rows.delete(key),
};
const origin = 'https://scope.example';
const post = (path, body, from = origin) => handle(new Request(origin + path, {
  method: 'POST',
  headers: { Origin: from, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}), store);
Object.assign(process.env, {
  NVIDIA_API_KEY: 'stub', NVIDIA_MODEL: 'stub',
  PAYPAL_CLIENT_ID: 'stub', PAYPAL_CLIENT_SECRET: 'stub', PAYPAL_TEST_BUYER: 'buyer@example.test',
});
let extractions = 0;
let creates = 0;
let invoice;
let loseCreate = false;
let failRead = false;
globalThis.fetch = async (url, options) => {
  if (url.includes('nvidia.com')) {
    extractions++;
    return Response.json({ choices: [{ message: { content: JSON.stringify({ items: [
      { name: 'Landing page design', line: 1 }, { name: 'Icon sets', line: 2 },
    ] }) } }] });
  }
  if (url.endsWith('/token')) return Response.json({ access_token: 'stub' });
  if (options.method === 'POST') {
    creates++;
    invoice = { ...JSON.parse(options.body), status: 'DRAFT' };
    if (loseCreate) throw new Error('Lost POST response');
    return Response.json({ id: 'INV2-TEST' });
  }
  if (failRead) return new Response(null, { status: 503 });
  return Response.json(invoice);
};

assert.equal((await post('/extract', { notes: sampleNotes }, 'https://other.example')).status, 403);
assert.equal((await post('/extract', { notes: 'Custom notes' })).status, 400);
const results = await Promise.all(Array.from({ length: 2 }, () => post('/extract', { notes: sampleNotes })));
assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
const { id } = await results.find(result => result.ok).json();
assert.equal((await post('/extract', { notes: sampleNotes })).status, 200);
assert.equal(extractions, 1);
assert.equal((await post('/draft', { id, indices: [0, 0] })).status, 400);
const drafts = await Promise.all([post('/draft', { id, indices: [0, 1] }), post('/draft', { id, indices: [1, 0] })]);
assert.deepEqual(drafts.map(result => result.status).sort(), [200, 409]);
assert.deepEqual(await (await post('/draft', { id, indices: [0, 1] })).json(),
  { id: 'INV2-TEST', status: 'DRAFT', reused: true });
assert.equal(creates, 1);

failRead = true;
assert.equal((await post('/draft', { id, indices: [0] })).status, 502);
failRead = false;
assert.equal((await post('/draft', { id, indices: [0] })).status, 200);
assert.equal(creates, 2);

loseCreate = true;
assert.equal((await post('/draft', { id, indices: [1] })).status, 502);
assert.equal((await post('/draft', { id, indices: [1] })).status, 409);
assert.equal(creates, 3);
console.log('Hosted sample passed input bounds, concurrent requests, readback retry and uncertain creation.');
