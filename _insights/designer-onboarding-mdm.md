---
layout: insight
title: "Onboarding a new designer in 90 minutes"
dek: "The first day of a creative hire sets the tone for the next year. The studios that do this well have automated the boring parts so the human parts can breathe."
description: "MDM, Apple Business Manager, and asset provisioning make a creative agency hire productive in 90 minutes. What the workflow actually looks like end to end."
image: /images/insights/designer-onboarding-mdm-og.png
date: 2026-04-14
tags:
  - MDM
  - Deployment
  - Operations
keywords: "designer onboarding MDM, creative agency new hire setup, Apple Business Manager onboarding, zero-touch Mac deployment, agency MDM Mac, Mac fleet management agency, design studio operations, Apple consulting Calgary"
reading_time: 5
author: "RIPEDA"
tldr:
  - "A designer's first 90 minutes should be opening the box, signing in once, and getting on with the day. Anything more is friction the agency is paying for."
  - "Mobile Device Management (MDM) and Apple Business Manager (ABM) turn first-day setup into a sign-and-go process."
  - "Asset library access, brand-tool licenses, and shared inboxes are provisioned by role, not requested by ticket."
  - "Standardized role profiles cut the variance between hires and protect against credential creep over time."
  - "The cost of doing this badly is not first-day frustration. It is the third week, when the new hire still cannot find what they need."
related:
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How RIPEDA runs MDM, ABM, and zero-touch deployment for agencies."
  - title: "Design Agencies"
    url: "/industries/design-agencies/"
    context: "Onboarding sits inside the broader operational stack we support for creative studios."
  - title: "MDM beyond the enrollment screen"
    url: "/resources/insights/mdm-beyond-enrollment/"
    context: "What MDM actually does past the first-day setup, written for non-IT readers."
---

A new senior designer starts on a Monday at a fifteen-person agency. The MacBook Pro is on her desk, unopened. She signs in with her studio credentials, watches the apps install themselves for a few minutes, and is in the asset library by 10:30. By 11:00 she has joined the standup, opened the active project, and started working. Nobody from the studio has touched the laptop. This is what onboarding looks like at a studio that runs Apple Business Manager (ABM) and Mobile Device Management (MDM). It looks unremarkable. That is the point.

In a studio without that setup, the same Monday looks different. The laptop arrives, somebody hunts down the right Adobe license, the new hire spends an hour trying to remember every password they set during the first hour, the asset library access takes a day to approve, the shared inbox takes two days, and by Wednesday the new designer is still half-onboarded. The cost is not the lost hours on day one. It is the lower starting baseline the new hire builds from for the next quarter.

## What zero-touch onboarding actually is

Mobile Device Management is the software layer that controls what a managed Mac does after it is unboxed. Apple Business Manager is the enrollment layer that tells Apple which Macs belong to which company, so the MDM rules apply automatically the first time the laptop connects to the internet.

Together they replace the first-day IT visit with a sign-on flow. The new designer opens the laptop, picks the studio identity provider from the login screen, signs in, and the rest happens in the background. Apps install, settings apply, profiles configure, the asset library mounts, the brand tools authenticate. The new hire watches it happen.

<div class="insight-stat">
  <p><strong>Zero-touch.</strong> The laptop never touches the IT team's desk. Drop-shipped from an Apple Authorized Reseller (Apple direct or a partner like RIPEDA), enrolled automatically, ready on first sign-in.</p>
  <p><strong>Role-based provisioning.</strong> Apps and access are assigned by job role, not requested ticket by ticket.</p>
  <p><strong>Reversible.</strong> When someone leaves, MDM revokes access and wipes the device with the same predictability that set it up.</p>
</div>

## The role profile is where the work pays back

The piece most agencies underweight is the role profile. The MDM can deliver apps and settings to any Mac, but somebody has to decide what each role gets. The studios that move quickly have written this down. A designer role profile. A motion designer profile. A project manager profile. An operations profile. Each one is a list of the apps, the asset libraries, the shared inboxes, the licenses, and the network shares that role needs.

The cost of writing those profiles is a one-time exercise. The benefit shows up every time a new hire arrives. The role profile is the difference between a 90-minute onboarding and a three-day onboarding. It is also what protects the studio from credential creep, the gradual accumulation of access that staff acquired over years and that nobody can untangle when an offboarding hits.

A useful starting frame for a creative agency:

**Designer.** Adobe Creative Cloud, Figma, Sketch where it survives, asset library mount, brand templates, project room access, agency Slack, design-team Slack channels.

**Motion designer.** Designer profile plus After Effects, Cinema 4D, the motion asset library, the render queue access.

**Video editor.** Motion designer profile minus Cinema 4D, plus Premiere or DaVinci Resolve, plus the video tier of the storage.

**Project manager.** Productivity apps, project room access, finance and time-tracking tools, client communication tools, agency Slack.

**Operations and account.** Productivity apps, finance tools, client management, agency Slack, no creative tools by default.

The profiles are not permanent. They evolve as the tool stack evolves. The discipline is keeping them written down so the next new hire benefits from the work done on the last one.

## When to think about this

The right moment to set up zero-touch onboarding is before the next hire, not after. The studios that do this in advance see it pay back on the first new hire. The studios that wait until after a painful onboarding spend the next quarter trying to retrofit the structure while still hiring.

A studio that can onboard a designer in 90 minutes is also a studio that can offboard one in 90 minutes. The same infrastructure handles both. The cost of building it is small. The cost of not building it is paid every time the studio grows.
