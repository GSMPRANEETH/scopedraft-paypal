import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:3030';
const agreed = ['Agreed landing page design for $250.', 'Agreed 2 x $75 for two icon sets.'];
const optional = 'Accessibility audit optional, price TBD.';

async function post(path, body) {
  const response = await fetch(origin + path, {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? `HTTP ${response.status}`);
  return result;
}

if (process.argv[2] !== '--create-sandbox-draft') {
  console.error('This check creates one sandbox draft. Run with --create-sandbox-draft against the local ScopeDraft server.');
  process.exitCode = 1;
} else {
  const review = await post('/extract', { notes: [...agreed, optional].join('\n') });
  assert.deepEqual(review.unreviewed.map(item => item.quote), [optional]);
  assert.equal(review.items.length, agreed.length);
  const byQuote = new Map(review.items.map(item => [item.quote, [item.quantity, item.unitPrice]]));
  assert.deepEqual(byQuote.get(agreed[0]), [1, '250.00']);
  assert.deepEqual(byQuote.get(agreed[1]), [2, '75.00']);
  const manualCount = review.items.filter(item => item.manual).length;
  console.log(`Verified two reviewable charges totaling USD 400.00, with the optional audit excluded. Manual review rows: ${manualCount}.`);

  const draft = await post('/draft', { id: review.id, indices: review.items.map((_, index) => index) });
  assert.match(draft.id, /^INV2-[A-Z0-9-]+$/);
  assert.equal(draft.status, 'DRAFT');
  console.log(`Verified PayPal sandbox invoice ${draft.id} is DRAFT.`);
}
