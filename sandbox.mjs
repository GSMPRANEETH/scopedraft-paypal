import { randomUUID } from 'node:crypto';

const root = 'https://api-m.sandbox.paypal.com';

async function request(path, init) {
  const response = await fetch(root + path, { ...init, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    const debugId = response.headers.get('paypal-debug-id');
    const code = `PayPal ${response.status}${debugId ? ` (debug ID ${debugId})` : ''}`;
    if (path === '/v1/oauth2/token' && response.status === 401) {
      throw new Error(`${code}. Check that the Client ID and Secret come from the same Sandbox app, then restart ScopeDraft.`);
    }
    throw new Error(code);
  }
  return response.json();
}

export function draftPayload(recipient, items) {
  return {
    detail: { currency_code: 'USD' },
    invoicer: { name: { given_name: 'Scope', surname: 'Draft Demo' } },
    primary_recipients: [{ billing_info: { email_address: recipient } }],
    items: items.map(({ name, quantity, unitPrice }) => ({
      name, quantity: String(quantity), unit_amount: { currency_code: 'USD', value: unitPrice },
    })),
  };
}

export async function createDraft(items, attempt) {
  if (attempt.submitted && !attempt.invoiceId) {
    throw new Error(`PayPal draft creation needs reconciliation. Check sandbox Invoicing for reference ${attempt.requestId} before trying a new review.`);
  }
  const { PAYPAL_CLIENT_ID: id, PAYPAL_CLIENT_SECRET: secret, PAYPAL_TEST_BUYER: buyer } = process.env;
  if (!id || !secret || !buyer) throw new Error('Set PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET and PAYPAL_TEST_BUYER for sandbox.');
  const { access_token: token } = await request('/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const headers = { Authorization: `Bearer ${token}` };
  const path = '/v2/invoicing/invoices';
  if (!attempt.invoiceId) {
    attempt.submitted = true;
    try {
      const payload = draftPayload(buyer, items);
      payload.detail.reference = attempt.requestId;
      const draft = await request(path, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json', 'PayPal-Request-Id': attempt.requestId },
        body: JSON.stringify(payload),
      });
      const invoiceId = draft.id ?? draft.href?.split('/').at(-1);
      if (!/^INV2-[A-Z0-9-]+$/.test(invoiceId ?? '')) throw new Error('PayPal did not return a recognizable invoice ID.');
      attempt.invoiceId = invoiceId;
    } catch (error) {
      throw new Error(`${error.message} Check sandbox Invoicing for reference ${attempt.requestId} before trying a new review.`);
    }
  }
  try {
    const invoice = await request(`${path}/${attempt.invoiceId}`, { headers });
    if (invoice.status !== 'DRAFT') throw new Error('Expected PayPal to report DRAFT.');
  } catch (error) {
    throw new Error(`Verification failed for ${attempt.invoiceId}. ${error.message}`);
  }
  return attempt.invoiceId;
}

if (process.argv[2] === '--smoke') {
  createDraft([{ name: 'Demo landing page', quantity: 1, unitPrice: '250.00' }], { requestId: randomUUID() })
    .then(id => console.log(`Verified sandbox invoice ${id} is DRAFT.`))
    .catch(error => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
