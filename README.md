# ScopeDraft

Turn fictional project notes into a PayPal sandbox invoice draft you can check line by line. ScopeDraft uses NVIDIA NIM to suggest charges, derives the amounts and quantities from their source lines, and lets you select which charges to include. It reads the saved draft back from PayPal and checks its status, reference and line items.

[Watch the 1:43 PayPal AI Hackathon walkthrough](https://youtu.be/Sf49ei_bKxo).

[Try the live Netlify sample](https://gsmpraneeth-scopedraft.netlify.app/). Extract the fixed fictional notes, select both charges for USD 400, and create or reopen the shared sandbox draft.

## Run locally

1. Clone this repository and open its root directory with Node.js 22 installed. There are no dependencies to install.
2. Run `node check.mjs` to check payloads, extraction grounding and draft recovery without provider credentials.
3. Copy `.env.example` to `.env`. In the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/), switch to **Sandbox**, open or create an app under **Apps & Credentials**, and copy its Client ID and Secret to `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`. Under **Testing Tools → Sandbox Accounts**, copy a sandbox personal account email to `PAYPAL_TEST_BUYER`. [PayPal Sandbox guide](https://developer.paypal.com/sandbox-testing/overview)
4. Open the [NVIDIA Nemotron model page](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b), sign in and generate a key for the free endpoint. Set `NVIDIA_API_KEY` to that key and `NVIDIA_MODEL` to `nvidia/nemotron-3.5-lightning-30b-a3b`. Keep both providers' credentials in the ignored `.env` file.
5. Run `node --env-file=.env server.mjs` and open <http://127.0.0.1:3030/>. Use the prefilled fictional notes, select the two agreed charges, and create the sandbox draft. The expected total is **USD 400** and the returned status is **DRAFT**.

The local build uses the judge's own provider accounts. Both providers publish free developer access for these flows. Account eligibility and provider availability during judging can vary.

## Checks and demo scope

Run `node demo-check.mjs --create-sandbox-draft` in a second terminal to test extraction and create one draft through the local app. The check verifies the two source line numbers, their prices and quantities, and the exclusion of the optional audit. ScopeDraft compares the saved line items, currency and reference against the approved request before reporting success. This command replaces the server's active review and creates a fresh draft each time.

ScopeDraft supports one local review at a time and one explicit positive USD price per line. Use the format `2 x $75.00` for a whole-unit quantity. The source button highlights the original note. Read the full notes for conflicts across lines, and check any manually suggested row before selecting it. If draft creation has an uncertain result, use the displayed reference to check Sandbox Invoicing before starting another review.

Use fictional notes and sandbox accounts. Extraction sends notes to NVIDIA. PayPal receives selected names, amounts, quantities, source line references and the configured sandbox buyer. A manual item's name can contain its original line. The app creates sandbox drafts only.

## Host the fixed sample on Netlify

The hosted build uses the prefilled fictional notes. It stores NVIDIA's sample review and shares one PayPal Sandbox draft per selection. The local build above supports editing notes and using your own provider accounts.

Use Node.js 22, run `npm ci` and `npm test`, and configure the values in `.env.example` as Netlify Functions environment variables for the production context. Keep provider credentials secret. `npm run build` generates the browser page in `dist/`. The Netlify configuration routes the two API endpoints to the sample function. Deploy the site from this repository with Netlify or deploy the built assets and functions with the Netlify CLI.
