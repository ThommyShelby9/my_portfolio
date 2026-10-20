---
title: "AI integration in your products"
metaTitle: "AI and LLM integration in a SaaS: freelance developer · Rostel Panoumassi"
seoDescription: "I integrate generative AI (Gemini, OpenAI) into products in production: document analysis, data extraction, business assistants, with fallbacks and controlled costs."
summary: "Analysing documents, extracting data, sorting requests, drafting replies: I integrate generative AI into your product so that it saves your users time, reliably and at a known cost."
order: 2
related: [contractiq, it-opportunities-tracker]
faq:
  - q: "Which AI models do you use?"
    a: "Mostly Gemini and OpenAI, through their official APIs. I choose the model for the task, the language, the latency and the cost, and I plan a fallback model for when the first one is down or overloaded."
  - q: "Does my data stay confidential?"
    a: "I only send the model what the task needs, I use API plans that do not train models on your data, and I document exactly which data leaves your infrastructure."
  - q: "How do you stop the AI from making things up?"
    a: "By giving it a strict frame: structured outputs validated against a schema, instructions that forbid inventing, cited sources, and human review on the decisions that matter."
  - q: "How much does AI cost to run every day?"
    a: "Often a few cents per processed document. I measure the cost per operation from the prototype on, then optimise it: a lighter model when it is enough, caching, batch processing."
---

Generative AI is useful when it replaces a repetitive, measurable task: reading a contract, sorting requests, summarising a file, pre-filling a form. My job is to integrate it into a real product, with the same standards as the rest of the code: tests, error tracking, known costs.

## What I deliver

- **Document analysis**: clauses, deadlines, amounts or risks extracted from contracts, invoices or files, returned as structured data.
- **Business assistants**: drafted replies, proposals or reports, reviewed by the user before sending.
- **Classification and triage**: support requests, applications, job offers or leads scored and sorted automatically.
- **Automation**: agents that watch sources, qualify what they find and alert you, orchestrated with n8n or inside your own back end.

## A shipped example

**ContractIQ** is a B2B SaaS that reads contracts with AI, extracts their risks and deadlines, and warns before every renewal. Gemini does the analysis, with OpenAI as a fallback. The results are structured data that the application checks before saving them, not free text displayed as is.

## How I work

1. **Pick the right use case**: a frequent task whose gain can be measured.
2. **Prototype on your real data** to judge quality and cost before building.
3. **Integrate cleanly**: validated outputs, fallback between models, logging, spending limits.
4. **Keep a human in the loop** on important decisions.

## Technologies

Gemini, OpenAI, structured JSON outputs, n8n, Python, Node.js, Django, Next.js, job queues for long-running work.
