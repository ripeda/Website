---
layout: insight
title: "The first 5 things to do after a laptop goes missing"
dek: "The hour after a MacBook disappears decides how much of this becomes an incident and how much stays an inconvenience."
description: "The first hour after a MacBook goes missing decides how bad it gets: lock the device, suspend the account, work out what was on it, then decide about the wipe."
date: 2026-08-11
tags:
  - Security
  - MDM
  - Compliance
keywords: "what to do when a work laptop is stolen, how to remote wipe a stolen macbook, lost laptop data breach checklist, does filevault protect a stolen mac, Alberta PIPA breach notification, MDM remote lock Mac, Apple IT Calgary, Mac fleet management"
reading_time: 3
author: "RIPEDA"
verticals: [professional-services, mdm-security]
tldr:
  - "Lock the device first. Marking it lost or pushing a remote lock costs nothing and can be undone."
  - "Suspending the user's identity account matters more than the hardware, because a signed-in session is a working key to mail and files."
  - "Whether FileVault was on and whether the Mac was powered off or asleep changes the entire conversation that follows."
  - "A remote wipe ends your ability to locate the device, so make that call deliberately and write down who made it."
related:
  - title: "Apple device security for client data"
    url: "/resources/insights/apple-device-security-client-data/"
    context: "The full picture on protecting client information on Apple devices, before anything goes missing."
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "Why the remote lock and wipe options only exist if the fleet was enrolled beforehand."
  - title: "Apple IT for Professional Services"
    url: "/industries/professional-services/"
    context: "How firms handling client files structure device security and offboarding."
---

Someone calls from a client site to say their MacBook is not in the bag. Nobody knows yet whether it was left behind, taken, or is sitting in a lost-and-found drawer. The first hour matters more than the rest of the week, because the options available to you narrow as the battery drains and the device drops off the network.

Work the list in order. The fourth decision is much easier to make once the first three are done, and much harder to reverse afterwards.

## 1. Mark it lost or push the remote lock

Find My on a personal Mac and the remote lock command in Jamf, Mosyle, or SimpleMDM do the same core job. Both lock the Mac with a passcode you set and display a message and callback number on the screen, and neither commits you to wiping anything. Do this before you decide anything else, because it is free, reversible, and keeps location reporting alive so the Mac checks in when it next reaches a network. On a managed Mac the MDM lock is the stronger of the two, since it does not depend on anyone having been signed into iCloud.

## 2. Suspend the identity account, not just the device

A missing laptop with a live session on it is a working key to mail, files, and everything the browser has stayed signed into. Suspend the user's account in Entra ID, Google Workspace, or Okta, and revoke active sessions and refresh tokens, which in most consoles is a separate action from disabling the account. Rotate any shared credentials that lived in the browser rather than in a password manager. This is the step people skip, because the hardware feels like the emergency.

## 3. Work out what was actually on it

A FileVault-encrypted Mac that was powered off when it went missing is a very different conversation than one that was asleep with a user logged in, because the encryption keys are only out of memory in the first case. Confirm from your MDM or inventory record whether FileVault was enabled and when the device last checked in. Then list what was stored locally rather than in cloud storage: client files on the Desktop, a local mail archive, a Downloads folder nobody has cleared since March. Write that list down while it is fresh, because every conversation after this one depends on it.

## 4. Decide on the remote wipe, knowing it is one way

Erasing the Mac remotely also ends your ability to locate it, and on an offline device the command simply queues until the Mac next connects. If the data is sensitive and recovery looks unlikely, wipe it. If there is a real chance of getting it back (a hotel, a client office, a filed report with the serial number on it), a locked device plus a suspended account may be the better trade for a day or two. Make the call deliberately and record who made it and when.

## 5. Report it and ask the privacy question

File a police report and record the serial number, which insurance, your MDM records, and any later conversation with Apple will all need. Then ask whether the incident triggers a notification obligation. Alberta's PIPA sets out requirements around breaches involving personal information, and client contracts frequently carry their own notification clauses with their own timelines. We are not lawyers and this is not legal advice, but it is a question worth raising in the first hour rather than the third week.

## If you only do one thing

Lock the device and suspend the account inside the same ten minutes. The hardware is replaceable, and the signed-in session is what turns a lost laptop into an incident.
