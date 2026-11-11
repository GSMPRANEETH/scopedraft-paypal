import { randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { extract } from '../../extract.mjs';
import { createDraft } from '../../sandbox.mjs';

export const config = { path: ['/extract', '/draft'] };
export const sampleNotes = [
  'Agreed landing page design for $250.',
  'Agreed 2 x $75 for two icon sets.',
  'Accessibility audit optional, price TBD.',
].join('\n');

const sampleKey = 'sample-v1';
const json = (status, value) => Response.json(value, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});
const conflict = error => json(409, { error });
const sampleUnavailable = 'The sample review is unavailable. Wait briefly and try again.';

export default function hostedSample(request) {
  return handle(request, getStore({ name: 'scopedraft-sample', consistency: 'strong' }));
}

export async function handle(request, store) {
  const url = new URL(request.url);
  if (request.method !== 'POST') return json(405, { error: 'Use POST.' });
  if (request.headers.get('origin') !== url.origin ||
      request.headers.get('content-type') !== 'application/json') {
    return json(403, { error: 'Use the hosted ScopeDraft page.' });
  }
  let body;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > 1024) return json(413, { error: 'Request is too large.' });
    body = JSON.parse(text);
  } catch {
    return json(400, { error: 'Expected JSON input.' });
  }
  try {
    const sample = await store.get(sampleKey, { type: 'json' });
    if (url.pathname === '/extract') {
      if (body?.notes !== sampleNotes) return json(400, { error: 'Use the fixed fictional notes.' });
      if (sample?.items) return json(200, sample);
      const claim = await store.setJSON(sampleKey, { pending: true }, { onlyIfNew: true });
      if (!claim.modified) return conflict(sampleUnavailable);
      try {
        const result = await extract(sampleNotes);
        if (result.items.length !== 2 ||
            result.items.some((item, index) => item.line !== index + 1 || item.manual)) {
          throw new Error('NVIDIA did not return both cited charges.');
        }
        const review = { id: sampleKey, ...result };
        await store.setJSON(sampleKey, review);
        return json(200, review);
      } catch {
        await store.delete(sampleKey);
        return json(502, { error: sampleUnavailable });
      }
    }
    if (url.pathname !== '/draft') return json(404, { error: 'Unknown route.' });
    if (!sample?.items || body?.id !== sampleKey) return conflict('Extract the sample first.');
    const indices = body.indices;
    if (!Array.isArray(indices) || indices.length < 1 || indices.length > 2 ||
        new Set(indices).size !== indices.length || indices.some(index => index !== 0 && index !== 1)) {
      return json(400, { error: 'Select one or both sample charges.' });
    }
    indices.sort();
    const draftKey = `${sampleKey}-draft-${indices.join('')}`;
    const saved = await store.get(draftKey, { type: 'json' });
    if (saved?.verified) return json(200, { id: saved.invoiceId, status: 'DRAFT', reused: true });
    if (saved && !saved.invoiceId) {
      // ponytail: An interrupted create requires reconciliation before the claim can be cleared.
      return conflict('This selection has a pending draft attempt. Wait briefly and try again. If it persists, use the local setup.');
    }
    const attempt = { requestId: saved?.requestId ?? randomUUID(), invoiceId: saved?.invoiceId };
    if (!saved) {
      const claim = await store.setJSON(draftKey, { requestId: attempt.requestId }, { onlyIfNew: true });
      if (!claim.modified) return conflict('Another visitor is creating this draft. Try again shortly.');
    }
    try {
      const id = await createDraft(indices.map(index => sample.items[index]), attempt);
      await store.setJSON(draftKey, { requestId: attempt.requestId, invoiceId: id, verified: true });
      return json(200, { id, status: 'DRAFT', reused: false });
    } catch {
      if (!saved && attempt.invoiceId) {
        await store.setJSON(draftKey, { requestId: attempt.requestId, invoiceId: attempt.invoiceId });
      } else if (!saved && !attempt.submitted) {
        await store.delete(draftKey);
      }
      return json(502, { error: 'PayPal could not verify this draft. Try again shortly or use the local setup.' });
    }
  } catch {
    return json(503, { error: 'Hosted demo temporarily unavailable. Try again shortly or use the local setup.' });
  }
}
