# ScopeDraft

PayPal AI Hackathon on Devpost. Registered on 27 October. Official deadline is 13 November 2026 at 1:30 AM IST. Target submission is 12 November at 8:00 PM IST.

## Live demo

[Watch the 1:43 PayPal sandbox walkthrough](https://youtu.be/Sf49ei_bKxo).

A freelancer pastes fictional project notes. The app extracts priced items with exact source quotes and lists unclear or unpriced work separately. The freelancer reviews items and totals, then explicitly creates a PayPal sandbox invoice draft. Show the matching invoice ID and DRAFT status from PayPal. Start with USD and positive whole quantities. Keep sending and payment outside the first demo.

## Sandbox check

Use Node.js 22. Run these commands from this directory.

1. Run `node check.mjs` for the local payload check.
2. Copy `.env.example` to `.env`. Fill it with the sandbox app client ID and secret from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/), plus the email of a sandbox personal account. Use local environment variables or this ignored file.
3. Run `node --env-file=.env sandbox.mjs --smoke`. Each invocation attempts to create a separate sandbox draft with one $250 sample item. The script retrieves it and checks for DRAFT. Record a sanitized result and redact account details in screenshots.

## Run the app

Set `NVIDIA_API_KEY` and `NVIDIA_MODEL` in the same `.env` file. Use a chat model available to your [NVIDIA NIM account](https://docs.api.nvidia.com/nim/reference/llm-apis) that can return plain JSON. Start with `node --env-file=.env server.mjs` and open <http://127.0.0.1:3030/>.

To verify the same flow as the demo through the running server, run `node demo-check.mjs --create-sandbox-draft` in a second terminal. Each run checks the sample extraction before attempting to create one sandbox draft and printing its verified status. This replaces any active review in the local server.

The app uses a single local review at a time. It supports a single explicit USD amount per line, with optional whole-unit quantities written as `2 x $75.00`. Put unpriced, conditional and conflicting terms on separate lines. Click a source quote to locate it in the notes. If the AI skips a price-valid line starting with Agreed, Approved, or Confirmed, it can appear as an unchecked manual review row. Read the original agreement before selecting it. Review the names, quoted amounts and the reasons for omitted lines before selecting items. Use fictional notes only. Extraction sends those notes to NVIDIA. Creating a draft sends selected item names, amounts and the configured sandbox recipient to PayPal.

Local checks passed for payload construction and extraction grounding. The HTTP flow passed with stubbed NVIDIA and PayPal responses, including one create call for concurrent duplicate requests. Chromium also passed keyboard selection, total and draft result rendering with stubbed responses. A stubbed recovery check also confirms that a failed status lookup retries only the read, while an uncertain create response requires reconciliation using the displayed reference. On 7 November 2026, the live app check extracted two charges totaling $400, excluded the optional audit, and created and read back a PayPal sandbox invoice in DRAFT status.

## Sprint and handoffs

- **7–8 November.** Prove PayPal OAuth and draft retrieval. Confirm which NVIDIA NIM model and credentials can be used by the app. Integrate extraction, source verification and a review screen. Test missing prices, conflicting prices and instructions embedded in the input.
- **9–10 November.** Test a clean setup, stable retries on the same draft action, keyboard access and provider errors. Record a demo once the real workflow passes.
- **By 11 November.** Jules can draft judge setup, submission text and a video shot list. Use the [repoless handoff](SUBMISSION.md#jules-task) to start docs review without granting repository access. Keep the task docs-only, use fictional examples and mark all unverified results. Pull the output before Jules becomes read-only after 11 November.
- **12 November.** Verify judge access, open-source license, public repository, public YouTube demo under three minutes and all Devpost fields. Submit by the internal cutoff and verify receipt. Official rules allow a reproducible local build with complete setup instructions. Judge access needs to work through 15 December. Decide how to provide free access without publishing secrets before choosing the submission route.

Codex owns the core integration and verification. Antigravity completed the first design review and can independently review extraction behavior once the first flow exists. Use the modded Claude Code for adversarial examples and fixture review once its NVIDIA route is confirmed. Keep notes about tools and what they contributed for Devpost.

[Official rules](https://paypalaihackathon.devpost.com/rules) · [PayPal Invoicing quickstart](https://developer.paypal.com/api/invoicing) · [Jules changelog](https://jules.google/docs/changelog)
