# ScopeDraft · PayPal AI Hackathon

Deadline is **13 November 2026 at 1:30 a.m. IST**. [Official rules](https://paypalaihackathon.devpost.com/rules)

## Devpost fields

**Project name**
ScopeDraft

**Tagline**
Turn project notes into a PayPal invoice draft you can check line by line.

**Inspiration**
Freelancers often agree on scope in the same notes they use for optional ideas and follow-up work. When it’s time to invoice, they have to piece together which charges were approved and double-check the math.

**What it does**
ScopeDraft suggests agreed charges from fictional project notes and shows the source line for each suggestion. It derives prices and quantities from that text and explains why it skipped other lines. If the AI misses a usable line marked agreed, approved or confirmed, ScopeDraft offers it unchecked for manual review. The freelancer selects the charges. PayPal Invoicing creates a sandbox draft, which ScopeDraft reads back to confirm its status, reference and line items.

**How we built it**
A dependency-free Node.js server calls NVIDIA NIM with Nemotron 3.5 Lightning to propose charges by source line number. The app validates each proposal against the original note and derives amounts independently. After the user confirms the selection, it uses PayPal Sandbox Invoicing v2 to create and retrieve the draft. The browser UI supports keyboard selection and lets users jump from a suggested charge to its source text. Codex assisted with implementation and verification. Antigravity and Claude Code reviewed the interaction and failure handling.

**What we learned**
An invoice ID alone does not verify the invoice. Reading the draft back catches differences in the saved charges or their references. In a live test the app extracted two charges totaling USD 400, excluded the optional audit and verified the saved draft.

**Built with**
JavaScript, Node.js, HTML, CSS, NVIDIA NIM, Nemotron 3.5 Lightning, PayPal Sandbox Invoicing v2

**Try it out**
Use the repository's Run locally steps with Node.js 22 and your own PayPal Sandbox and NVIDIA developer credentials. The prefilled notes produce a USD 400 draft. The video shows the workflow on the local app.

## Links

- [Public MIT repository and judge setup](https://github.com/GSMPRANEETH/scopedraft-paypal)
- [Public YouTube demo · 1:43](https://youtu.be/Sf49ei_bKxo)
