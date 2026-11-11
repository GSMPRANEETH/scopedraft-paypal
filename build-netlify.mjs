import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { sampleNotes } from './netlify/functions/sample.mjs';

let html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
assert.equal(html.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/)?.[1], sampleNotes);
for (const [original, hosted] of [
  ['<textarea id="notes"', '<textarea id="notes" readonly'],
  ['Use one USD charge per line. Only enter fictional notes. NVIDIA receives the text for extraction.', 'The hosted demo uses fixed fictional notes and NVIDIA extraction. The local build supports editing your own fictional notes.'],
  ['NVIDIA is identifying agreed charges and their source quotes.', 'Loading the charges and source quotes identified by NVIDIA.'],
  ['Create PayPal sandbox draft', 'Create or reopen sandbox draft'],
  ['Creating the PayPal draft…', 'Checking the shared PayPal draft…'],
  ["feedback('Verified in PayPal sandbox · ' + result.id", "feedback((result.reused ? 'Previously verified shared draft · ' : 'Verified in PayPal sandbox · ') + result.id"],
  ['Sandbox drafts only. PayPal stores approved item names, amounts and source line numbers. A manual review row can use the original line as its item name.', 'The hosted sample shares one verified PayPal Sandbox draft per selection. The app stores the sample review and draft references.'],
]) {
  assert.ok(html.includes(original), original);
  html = html.replace(original, hosted);
}
await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await writeFile(new URL('./dist/index.html', import.meta.url), html);
