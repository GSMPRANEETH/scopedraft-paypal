# ScopeDraft submission draft

Internal cutoff is 12 November 2026 at 8 PM IST. Devpost closes on 13 November at 1:30 AM IST. [Official rules](https://paypalaihackathon.devpost.com/rules)

## Project copy

**Tagline**
Turn project notes into a PayPal invoice draft you can check line by line.

**What it does**
ScopeDraft helps freelancers turn agreed project charges into an invoice draft. NVIDIA NIM proposes line items by source line number. ScopeDraft displays the original text, derives amounts and whole-unit quantities from it, and explains why other lines were left out. The freelancer chooses which charges to include. If AI skips a price-valid line explicitly marked agreed, approved, or confirmed, the app shows it unchecked for manual review. PayPal Invoicing creates the sandbox draft, and ScopeDraft reads it back to confirm its status.

The live app check on 7 November 2026 extracted two agreed charges totaling $400, excluded the optional audit, and confirmed the resulting PayPal sandbox invoice was in DRAFT status. The project creates drafts only.

**Tools**
Node.js serves the local app and calls NVIDIA NIM and PayPal Sandbox Invoicing v2. The browser renders the review and selected totals. Codex implemented and verified the local flow. Antigravity reviewed the initial design and proposed making the evidence directly navigable. Claude Code reviewed evidence visibility, retry behavior and demo clarity. Add Jules only after reviewing its output.

## Video shot list

1. **0:00–0:20** Show how agreed freelancer charges and optional work can get mixed together in the same project notes.
2. **0:20–0:55** Paste the sample, run extraction and show two cited items plus the excluded audit. Click a source quote to highlight it in the original notes and point out why the optional audit was left out.
3. **0:55–1:25** Select both agreed items with the keyboard and show the $400 total.
4. **1:25–1:55** Create the sandbox draft. Show the returned invoice ID and DRAFT status, then match the ID in the sandbox dashboard. Crop account details.
5. **1:55–2:15** Explain NVIDIA's role, the human review step and how judges can run it.

## Before entry

- [x] Verify the sample against both live providers and record the resulting sandbox draft status.
- [ ] Verify that judges can get the required PayPal sandbox and NVIDIA NIM access. Keep credentials out of Git and video.
- [ ] Publish the source with a detectable open-source license and complete run instructions.
- [ ] Upload the working demo to YouTube as public, under three minutes, and verify the link in a signed-out browser.
- [ ] Complete the Devpost fields, confirm team representation if applicable, and verify submission from the dashboard or receipt.

## Jules task

Paste this brief into a new [Jules](https://jules.google.com/) task without a repository if repo access is unavailable. Use the draft above as the input.

> Review ScopeDraft's proposed submission against the official PayPal AI Hackathon Devpost rules. Return a revised English submission draft, a 2:15 demo shot list, and a judge setup checklist. Distinguish the verified live sample from additional tests that use stubbed provider responses. Scope is docs only. Use fictional examples. Keep repository, video and testing URLs as placeholders until verified. Report any mismatch between the planned local setup and the contest's access requirements.
