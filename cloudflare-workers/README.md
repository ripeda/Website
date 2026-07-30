# Cloudflare Workers — website lead pipeline

Source for the two Cloudflare Workers behind the ripeda.com contact form.

**These are not part of the Jekyll site.** `_config.yml` excludes this folder from the build, so nothing here is published. They deploy to Cloudflare separately — editing a file here does nothing until it is deployed.

| File | Worker | Trigger |
|---|---|---|
| `receiver-worker.js` | `ripeda-website-lead-receiver` | HTTP POST from the contact form |
| `enrichment-worker.js` | `ripeda-website-lead-enrichment` | Cron, every 10 minutes |

## What they do

**Receiver** — accepts the form POST, checks the honeypot, verifies the Cloudflare Turnstile token, then creates a prospect **Opportunity** in HaloPSA on the **Lead** type (ticket type `27`). Deliberately an Opportunity rather than a Ticket: a plain Halo ticket requires a Client/Site/User, so a client-less website enquiry fails with `400 "Please select a valid Client/Site/User"`.

**Enrichment** — finds Lead opportunities flagged `Pending`, researches each using Claude with web search, scores it against RIPEDA's lead rubric, writes the results into Halo custom fields, and posts a brief to Slack.

## Deploying

Paste into the Cloudflare dashboard, or use `wrangler deploy`. **Bump the `BUILD` constant at the top of `enrichment-worker.js` on every deploy** — it is echoed in every log line and is the only reliable way to confirm which version is live.

## Secrets

Set in the Cloudflare dashboard under Settings → Variables and Secrets. Never in this repo.

**Receiver:** `TURNSTILE_SECRET_KEY`, `HALO_CLIENT_ID`, `HALO_CLIENT_SECRET`, `HALO_BASE_URL`

**Enrichment:** `HALO_CLIENT_ID`, `HALO_CLIENT_SECRET`, `HALO_BASE_URL`, `ANTHROPIC_API_KEY`, `SLACK_WEBHOOK_URL`, `ADMIN_KEY`

The HaloPSA API application needs scopes `read:tickets`, `edit:tickets`, `read:sales`, `edit:sales`. Halo has no `*:opportunities` scope — opportunities live under the Sales module.

## Operating them

`ADMIN_KEY` gates every HTTP endpoint on the enrichment Worker. See **Internal Engineering → Website Lead Pipeline** in the documentation site for the endpoints, status values and troubleshooting.

## Before go-live

`ALLOWED_ORIGINS` in `receiver-worker.js` still contains `http://localhost:4000`, marked `TEST ONLY`. Remove it once the live form is confirmed working. The matching `localhost` entry on the Turnstile widget's allowed hostnames should go at the same time.
