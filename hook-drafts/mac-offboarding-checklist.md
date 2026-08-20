---
layout: insight
title: "5 things to do with a Mac the day an employee leaves"
dek: "What you do in the first few hours decides whether offboarding a Mac is a ten-minute task or a problem you find six weeks later on an invoice."
description: "A five-step offboarding checklist for a company Mac, in urgency order: identity, remote lock or wipe, Activation Lock, licences, and shared credentials."
date: 2026-08-11
published: false
tags:
  - Lifecycle
  - Security
  - MDM
keywords: "what to do when an employee leaves with a company macbook, mac offboarding checklist, how to remove activation lock from a company mac, remote wipe a mac after an employee leaves, reclaiming software licences offboarding, Apple Business Manager device removal, Mac fleet management, Apple IT Calgary"
reading_time: 2
author: "RIPEDA"
tldr:
  - "Suspend the identity account first. It cuts mail, files, and sign-ins in one move and makes every other step easier."
  - "Lock or wipe the Mac while it is still reachable. A command issued after the device goes offline may never land."
  - "Activation Lock is cheap to clear on the day and genuinely painful to clear afterwards."
  - "Assigned software seats keep billing whether or not anyone signs in, so reclaim them the same day."
related:
  - title: "Managing a hybrid office Mac fleet"
    url: "/resources/insights/hybrid-office-mac-fleet/"
    context: "The wider picture on managing Macs across the office, home setups, and client sites."
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How offboarding fits into ongoing device management rather than being a scramble each time."
  - title: "Apple IT for Professional Services"
    url: "/industries/professional-services/"
    context: "How firms handle device turnover when the people leaving had access to client data."

# verticals: [quick-reads, mdm-security]
---

The exit conversation is at two o’clock and the MacBook comes back at four. What happens between those two hours is the difference between a device you can reissue on Monday and one that sits in a drawer for a month while somebody argues with a support queue. In order of urgency.

## 1. Suspend the identity account first

Whether identity lives in Microsoft Entra ID, Google Workspace, or Okta, suspending the account cuts mail, file access, and every single sign-on session in one action. Do this before anything else, because every step that follows is simpler once the person cannot reach anything. Suspend rather than delete: deleting the account can take the mailbox and the cloud file contents with it, and you will want both later.

## 2. Confirm the Mac is reachable, then lock or wipe it

Check in your MDM (Jamf, Mosyle, Kandji, SimpleMDM) that the device has checked in recently, not that it is merely listed. If the handover is anything other than hand to hand, issue a remote lock with a recorded PIN, or a full wipe, while the Mac is still on a network you can reach. A command sent to a Mac that has already gone offline sits queued until the next check-in, which may never come.

## 3. Clear Activation Lock while you still can

If the person ever signed in to Find My with a personal Apple ID, that Mac is Activation Locked to them. Cleared through Apple Business Manager or your MDM before the account is untangled, it takes a minute. Discovered after the fact, it becomes a documentation exercise with Apple involving original proof of purchase, and until it is resolved the Mac cannot be set up by anyone else.

## 4. Reclaim the assigned software licences

Adobe Creative Cloud, Microsoft 365, Figma, and most design and project tools keep billing for an assigned seat whether or not anyone signs in to it. Unassign the person in each admin console on the same day and record where the seat went. A seat that has been quietly renewing for a year is a credit conversation with a vendor, not a refund.

## 5. Rotate shared credentials and release the device record

Anything the person knew and shared should be changed, not just noted: the office Wi-Fi passphrase, vendor portal logins, the alarm code, any service account they had the password for. If the Mac is being retired rather than reissued, release it from Apple Business Manager as well, so it stops counting against your fleet and stops trying to auto-enrol the next time it is wiped.

## If you only do one thing

Suspend the identity account before the person leaves the building. It closes mail, files, and sign-ins in a single move, and it buys you the time to do everything else properly instead of at speed.
