---
layout: insight
title: "Apple device security for client data"
dek: "When the deliverable is confidentiality, the device the work runs on is part of the service. The security posture has to match what the engagement implies."
description: "How professional services firms set up Apple device security to actually protect client data. Encryption, identity, recovery, and the policy that holds it together."
image: /images/insights/apple-device-security-client-data-og.png
date: 2026-04-28
tags:
  - Security
  - Encryption
  - Compliance
keywords: "Apple device security business, FileVault for business, client data Mac, professional services Apple security, Mac encryption compliance, iPad business security, secure Mac fleet, Apple consulting Calgary"
reading_time: 5
author: "RIPEDA"
tldr:
  - "Professional services firms carry client data as the core deliverable. The device posture has to match what the engagement promises."
  - "FileVault disk encryption with escrowed recovery keys is the floor. Without escrow, a forgotten password is a lost laptop."
  - "Identity-managed sign-in and conditional access change what 'lost laptop' actually means. A managed device is recoverable. An unmanaged one is not."
  - "Most security gaps in professional services firms are not technical. They are policy gaps that the technical layer cannot close on its own."
  - "The investment is small. The protection compounds with every client whose data is handled correctly."
related:
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How RIPEDA configures the device security stack for professional services firms."
  - title: "Professional Services"
    url: "/industries/professional-services/"
    context: "Device security is part of the broader stack we run for SaaS, accounting, consulting, and legal-adjacent firms."
  - title: "What remote management sees that screen sharing doesn't"
    url: "/resources/insights/remote-management-vs-screen-sharing/"
    context: "The visibility layer that makes managed devices actually manageable."
---

A consultant working with a financial-services client opens her laptop on a flight, finishes a memo, and forgets the laptop in the seatback pocket on landing. The laptop is found by the cleaning crew, handed to lost-and-found, and surfaces eight days later when she calls the airline. By that point, she has spent a week wondering whether the client data on the laptop is on its way somewhere unintended. The question her firm cannot answer for those eight days is the question her firm needs to be able to answer in an hour. Whether the device had FileVault enabled, whether the recovery key was escrowed, whether the firm's Mobile Device Management could lock or wipe the device remotely, whether the consultant's identity could be revoked across every system she had access to.

The honest version of this story is that the firm answers most of those questions correctly when they happen. The harder version is that the firm has not actually tested the answers until the day they are needed. Apple device security for client data is the work that closes the gap between "we think we are fine" and "we know we are fine."

## What client data actually requires

Professional services firms carry client data in three places: on the device, in the cloud accounts the device signs in to, and in the credentials the device stores. A security posture has to address all three.

**On the device.** FileVault full-disk encryption, enabled by Mobile Device Management (MDM), with the recovery key escrowed to the firm. Without escrow, a forgotten password is a wiped laptop. With escrow, it is a five-minute support call.

**In cloud accounts.** Identity-managed sign-in via the firm's identity provider (Microsoft Entra ID, Google Workspace, Okta). When the consultant leaves the firm or the device is lost, identity-side revocation cuts access to every system at once.

**In stored credentials.** A password vault (1Password Business, Keeper Business) holding shared and personal credentials. Lost-device recovery includes vault re-authentication, not just a password reset.

<div class="insight-stat">
  <p><strong>FileVault with escrow.</strong> Disk encryption with recovery keys held by the firm's MDM. Protects the data and the access path to it.</p>
  <p><strong>Identity-side revocation.</strong> Departures and incidents are handled at the identity provider, not device by device.</p>
  <p><strong>Remote lock and wipe.</strong> Lost devices can be locked, located, and wiped without physical access.</p>
</div>

## What good looks like

A professional services firm with the device-security posture right has answers to four questions at any given moment.

**How many devices does the firm own, and where are they?** Provided by the MDM's last-seen report.

**Are all of them encrypted, with escrowed keys?** Provided by the MDM's FileVault report.

**Is every staff member's identity active and accurate, and does the access revocation flow actually work?** Tested by a quarterly offboarding drill, not assumed.

**If a device is lost today, can it be locked, located, and wiped within an hour?** Tested by occasionally running the workflow on a spare device, not assumed.

These are not aspirational answers. They are the operational outputs of a firm that has done the foundational work.

## Where firms usually fall short

Most professional services firms have parts of this in place. Almost none have all of it. The gaps cluster in three predictable places.

**Recovery key escrow.** Firms enable FileVault but rely on staff to remember their passwords. When a staff member forgets, the laptop is unusable and the data is gone. Escrow to the MDM converts this from a crisis into a routine support call.

**Identity provider front-door discipline.** Firms enable single sign-on (SSO) for the major systems but leave several utility systems on local accounts. Departures revoke access to the SSO-fronted systems and leave the local-account systems unrevoked, sometimes for months.

**Untested offboarding.** Firms have a documented offboarding checklist but have not actually run it under realistic conditions. The first time it runs is the day of an actual departure, which is the wrong day to discover the gaps.

Each of these is fixable in a single quarter of focused work. None of them is hardware-cost-bound. They are operational and policy-bound.

## The policy that holds it together

Technology choices alone do not constitute a security posture. The technology decisions need a policy that says how they are used. Three short documents make most of the difference.

**Device handling policy.** What devices are acceptable, where they can be used, what is allowed on them, and what to do when something goes wrong.

**Identity and access policy.** Who gets access to what, how access is granted, how it is revoked, and what reviews happen periodically.

**Incident response runbook.** What happens in the first hour when a device is lost, when a credential is leaked, or when a client raises a security concern.

The documents do not need to be long. They need to be current and actually followed. A firm that has the technology in place but no policy is half-protected. A firm that has the policy but no technology is exposed. The two together are what the engagement actually implies.

## When to think about this

The right time to set this up is before the next client onboarding that includes a security questionnaire, before the next staff change, or before the next time a consultant calls about a missing laptop.

Client data is the deliverable. The device posture is part of how the firm delivers it.
