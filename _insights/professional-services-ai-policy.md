---
layout: insight
title: "AI policy for professional services firms"
dek: "Staff are already using AI. The question is whether the firm has a position on what is allowed, what is not, and what gets logged."
description: "How professional services firms set realistic AI policy for staff use of large language models and on-device AI. Practical, enforceable, and current to 2026."
image: /images/insights/professional-services-ai-policy-og.png
date: 2026-05-21
tags:
  - Apple Intelligence
  - Security
  - Strategy
keywords: "AI policy professional services, business AI policy, ChatGPT firm policy, AI use staff policy, Apple Intelligence business, AI for accounting firms, AI for consulting firms, Apple consulting Calgary"
reading_time: 5
author: "RIPEDA"
tldr:
  - "Staff at professional services firms are already using AI tools. A firm without a policy has policy by default, and it is rarely one the partners would have written."
  - "An effective AI policy has three parts: what is allowed, what is not, and what is logged."
  - "Client data is the line that matters most. Sending client information to a public large language model (LLM) is the failure mode most policies need to prevent."
  - "On-device AI like Apple Intelligence changes the privacy calculus because the data does not leave the device. The policy needs to recognize that distinction."
  - "A short, current, enforceable policy beats a long aspirational one. Staff who read it once should be able to act on it."
related:
  - title: "Apple Consulting and Strategy Advisory"
    url: "/services/strategy-advisory/"
    context: "How we help firms write and operationalize an AI policy that fits their work."
  - title: "Professional Services"
    url: "/industries/professional-services/"
    context: "AI policy is part of the broader operational stack we support for professional firms."
  - title: "Apple device security for client data"
    url: "/resources/insights/apple-device-security-client-data/"
    context: "The device-security foundation that an AI policy depends on to actually be enforceable."
---

A senior accountant at a Calgary firm pastes a client's financial statements into a chat-based AI tool to draft an executive summary for an upcoming meeting. The output is useful. The accountant emails the summary to the partner, deletes the chat history, and moves on with the day. The firm has no AI policy. The partner is unaware that the firm's client data has just left the firm's perimeter. The client is unaware that this happened at all. The accountant believes she was being productive and would be confused if anyone described what she did as a security incident. By most reasonable definitions, it is one.

This scene plays out in some version at most professional services firms in 2026. Staff are already using AI tools. The firms that have not set policy have policy by default, which is whatever the most enthusiastic staff member is currently doing.

## What a working AI policy actually covers

An AI policy that staff can act on has three parts. Not a fifteen-page legal document. Three short sections.

**What is allowed.** Which AI tools the firm has approved and what categories of work they can be used for. Naming the tools is what gives the policy teeth. "Approved AI tools" is not a policy. "ChatGPT Team, Claude for Work, and the AI features built into Apple Intelligence and Microsoft 365 Copilot" is a policy.

**What is not.** Which categories of data must never leave the firm's perimeter for AI processing, regardless of the tool. Client financial data, client personal information, draft legal arguments, anything covered by Personal Information Protection and Electronic Documents Act (PIPEDA) obligations or client confidentiality agreements.

**What is logged.** The firm's expectation that AI use on approved tools is auditable. Most enterprise AI tools support logging. Staff should know that the logging exists and that it is not surveillance, it is operational governance.

## The data line is the policy

The single most important thing the policy does is name the line that client data does not cross. Everything else flows from that line.

A firm without a policy has staff making this judgment individually, in real time, without training. Some staff are conservative. Others are not. The variance is the risk. With a written line, the variance collapses to something the firm can actually defend in front of a client or a regulator.

The line for most professional services firms looks like this:

**Client identifying information.** Names, addresses, account numbers, anything that could identify the client or their staff. Never pasted into a public AI tool.

**Client financial or operational data.** Statements, contracts, projections, internal documents. Never pasted into a public AI tool.

**Draft legal positions or strategy.** Anything that the client would consider confidential work product. Never pasted into a public AI tool.

**Generalized research and drafting.** General research, prose drafting, idea generation, public-domain content. Fine on approved AI tools.

The line is not subtle. Staff who understand it can apply it. Staff who do not have a line will sometimes apply something looser.

## Where on-device AI changes the calculus

Apple Intelligence and other on-device AI capabilities change one specific part of this calculation. When the AI runs on the device, the data does not leave the device. The privacy properties of summarizing a document with Apple Intelligence on a managed Mac are fundamentally different from pasting the same document into a public AI tool.

The policy should recognize this distinction explicitly. Not because on-device AI is unlimited (it has its own constraints), but because lumping it together with public AI tools makes the policy harder to follow than it needs to be.

<div class="insight-compare">
  <div class="insight-compare-col">
    <h4>Policy by Default</h4>
    <p>What the firm has if it has not written one:</p>
    <ul>
      <li>Each staff member decides individually</li>
      <li>No record of what tools are in use</li>
      <li>No defined line for client data</li>
      <li>Incidents discovered after the fact, if at all</li>
    </ul>
    <p class="insight-compare-conclusion"><strong>Result:</strong> the firm cannot answer a client question about how AI is used on their work, and the variance across staff is itself a risk.</p>
  </div>
  <div class="insight-compare-col is-strong">
    <h4>Written Policy</h4>
    <p>What changes once the policy exists:</p>
    <ul>
      <li>Approved tools are named and provisioned</li>
      <li>The client-data line is explicit</li>
      <li>Logging is enabled on the approved tools</li>
      <li>Staff have a single document to refer to</li>
    </ul>
    <p class="insight-compare-conclusion"><strong>Result:</strong> the firm can answer the client question, and staff are not making security decisions alone in the moment.</p>
  </div>
</div>

## What an enforceable policy looks like

A useful starting frame for a thirty-person professional services firm:

**One page.** Long enough to cover the three sections. Short enough that staff read it.

**Named tools.** Not categories. Actual product names with versions where they matter.

**The client-data line.** Stated plainly, with examples on either side.

**Review cadence.** The policy is dated and reviewed every six months. AI tooling changes faster than annual policy cycles can keep up with.

**Owner.** One person at the firm owns the policy. New AI tools route through them before being adopted.

**Training.** Staff need to know what the policy means in practice, not just what it says. Short hands-on sessions that walk through the approved tools and the client-data line tend to land better than an emailed memo. RIPEDA runs Apple-focused AI training for business teams through [getanhourback.com](https://getanhourback.com) for firms that want outside help with the rollout.

## When to think about this

The right time to write the policy is before the next client question about AI, before the next staff member adopts a new AI tool without checking, or before the next industry incident makes AI policy a board-level question.

The policy will not be perfect. It will need updating. That is fine. A current policy that staff actually follow protects the firm. A pristine policy nobody has read does not.
