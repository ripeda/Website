---
layout: insight
title: "Six to 150: the IT debt that catches every SaaS post-Series A"
dek: "A six-person SaaS team closes Series A and scales to 150 staff in a year. Nine months in, they discover that nobody set up Apple Business Manager. The remediation is expensive. The setup that would have prevented it was small."
description: "The IT debt pattern that catches SaaS companies after Series A. Why fleet visibility, identity, and offboarding break at scale, and what the remediation actually costs."
image: /images/insights/saas-series-a-it-debt-og.png
date: 2026-05-18
tags:
  - Apple Business Manager
  - MDM
  - Strategy
keywords: "SaaS Series A IT, post Series A scaling IT, SaaS fleet management debt, scaling startup Apple, SaaS hiring IT debt, Apple Business Manager retroactive, distributed SaaS team IT, Apple consulting Calgary"
reading_time: 6
author: "RIPEDA"
tldr:
  - "A pattern we've seen before: six people closes Series A, scales to 150 across multiple countries in a year, and discovers nine months in that the IT foundation never got built."
  - "The symptoms are predictable. No Apple Business Manager (ABM) tenant. Devices personally enrolled to whoever opened the box. Contractors who left months ago still have access. No fleet visibility at all."
  - "The remediation is roughly a quarter of expensive work involving every staff member, every device, and every system."
  - "The setup that would have prevented it costs less per year than one senior engineer week of remediation time."
  - "The right moment to install the foundation is before the round closes, not after it does."
related:
  - title: "Apple Consulting and Strategy Advisory"
    url: "/services/strategy-advisory/"
    context: "How we help SaaS founders install IT foundations before the scaling that follows Series A."
  - title: "Professional Services"
    url: "/industries/professional-services/"
    context: "SaaS scaling is the most common engagement type inside RIPEDA's Professional Services practice."
  - title: "SaaS company IT on a budget: the Apple-first approach"
    url: "/resources/insights/saas-company-it-budget/"
    context: "The preventative version of this story, written for pre-Series A teams."
---

A founder calls in November. The SaaS company closed Series A in February, scaled from six to ninety by October across three countries, and now needs a security review before a key enterprise customer signs. The founder mentions, almost in passing, that they should also "get the IT sorted." Over the next hour the picture comes into focus.

There is no Apple Business Manager (ABM) tenant. Every laptop was opened by the staff member it was issued to and signed in to a new Apple ID that morning. There is no Mobile Device Management (MDM). Three contractors who finished engagements in May still have access to the production code repository. The customer relationship management (CRM) account is in the founder's name. The product manager who left in July still has admin access to the deployment platform. The remediation will take approximately a quarter, scheduled around a team that is still hiring, still shipping, and preparing for a Series B raise.

We have seen this pattern more than once. The names change. The shape does not.

## Why six-to-150 breaks IT differently

A SaaS company at six staff does not need IT structure. The team holds the configuration in its head. Onboarding is the founder handing a laptop across a desk. Offboarding has not happened yet.

The Series A close changes things overnight. Six in February is twenty by April, forty by June, ninety by October, 150 by the next spring. Hires happen in three time zones. Devices ship directly to staff homes. The team that used to know everything no longer knows anything.

Three categories of IT decision fail quietly in that window.

**Fleet visibility.** Devices issued without MDM enrolment. The company genuinely does not know how many laptops are out there or what state they are in.

**Identity and access.** Hires get accounts created as needs arise. Departures rarely trigger full revocation. Credentials accumulate.

**Apple ID hygiene.** Devices signed in to personal Apple IDs. Photos sync to iCloud accounts the company does not own. Apps purchased on personal cards belong to staff members, not the company.

These gaps are invisible while the team is shipping product and closing customers. They become visible all at once when an enterprise customer asks the security questions, when a board member raises governance, or when a major staff departure exposes that clean access revocation is not possible.

## What the remediation actually costs

The honest answer is eight to sixteen weeks of focused work involving every staff member, every device, and every system.

<div class="insight-stat">
  <p><strong>Device audit.</strong> Every laptop, who has it, what state it is in, whether it can be enrolled retroactively in ABM.</p>
  <p><strong>Identity audit.</strong> Every account in every system, mapped to current staff, contractor, or departed-person status.</p>
  <p><strong>Access revocation.</strong> Departed contractors removed from every system. Departed staff with lingering access removed.</p>
  <p><strong>Foundation install.</strong> ABM, MDM, identity provider, password vault, written offboarding checklist.</p>
</div>

The device audit alone often takes two to three weeks because every staff member has to confirm a serial number, surrender the device briefly for re-enrolment, and re-sign in with a managed Apple Account. Coordinating that across 150 staff in three time zones, around live product work, is a project. The identity and access audit is similar.

The work has to happen. The customer needs the answer. The board needs the answer. The security questionnaire needs the answer. The timing is what hurts. It hits when the company can least absorb the distraction.

## What the preventative setup costs

For comparison, the foundation installed at twenty hires costs roughly two thousand dollars per year and one week of founder time. ABM registered. MDM vendor connected. Identity provider used as the front door for every system. Password vault rolled out. Offboarding checklist written.

That work, done early, means the device that ships to a new hire in Manila in October arrives pre-enrolled in the company's MDM. The new hire signs in with a managed Apple Account and the laptop joins the fleet automatically. The contractor who finishes an engagement in May loses access the moment their identity provider account is suspended. The CRM account is in the company's name from the day it was created.

A week at twenty hires saves a quarter at 150.

## Why this catches founders

The pattern catches founders because it does not feel like IT debt while it is accumulating. The team is shipping. Customers are signing. Hiring is working. Everything the founders are measuring looks healthy. The IT structure underneath is invisible until the moment it is not.

The warning signs are not subtle once a founder is looking. Hires this month not knowing how previous hires' devices were configured. A founder who cannot say how many laptops the company has shipped. A departed staff member surfacing two months later as still having access. Any of those is the signal. All of them are common in companies that have not yet installed the foundation.

## When to think about this

The right time to set up the foundation is before the round closes. Pre-funding is when the founder still has time. Post-funding is when the founder no longer does. The work is small. The window is also small.

A company that arrives at Series A with a working IT foundation skips the remediation quarter. A company that arrives without one pays at the worst time, in the most painful way, and at three to five times the price.
