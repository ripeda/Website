---
layout: insight
title: "The 3 Apple certificates that expire and take your MDM down"
dek: "None of the three announce themselves when they lapse, which is why the failure is usually discovered by a new starter rather than by IT."
description: "The three Apple certificates that expire every year, what each one breaks when it lapses, and why all three fail quietly enough that nobody in IT notices."
date: 2026-08-11
published: false
tags:
  - MDM
  - Security
  - Operations
keywords: "apple mdm certificate expiry, what happens when the APNs certificate expires, how to renew the automated device enrollment token, VPP token expired app assignment failing, apple push notification certificate renewal, MDM certificate management, Mac fleet management, Apple IT Calgary"
reading_time: 2
author: "RIPEDA"
tldr:
  - "Three Apple certificates expire annually: APNs, the Automated Device Enrollment server token, and the Apps and Books content token."
  - "All three fail silently. Devices keep showing as enrolled while commands, enrolments, or app assignments stop working."
  - "Each must be renewed with the Apple Account that created it, which is why a technician’s personal Apple ID is an expensive shortcut."
  - "A shared organisational account and three calendar reminders at 30 days out is the whole fix."
related:
  - title: "MDM beyond the enrollment screen"
    url: "/resources/insights/mdm-beyond-enrollment/"
    context: "What running an MDM actually involves once the devices are enrolled and the novelty has worn off."
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How certificate ownership and renewal dates are tracked as part of ongoing management."
  - title: "Strategy & Advisory"
    url: "/services/strategy-advisory/"
    context: "Why Apple account ownership belongs in an IT plan rather than in one person’s inbox."

# verticals: [mdm-security, quick-reads]
---

Nothing about an expired Apple certificate looks like an outage. The MDM console stays up, the devices stay listed as enrolled, and the only symptom is that what you ask them to do quietly does not happen. Three certificates behave this way, all renewed annually, all easy to miss. Each is renewed with the Apple Account that created it, which is the reason a technician’s personal Apple ID is such an expensive shortcut.

## 1. Renew the APNs certificate before it silences the fleet

The Apple Push Notification service certificate is the channel your MDM uses to tell a device to do anything: install an app, apply a configuration profile, lock, wipe. It expires twelve months after it is issued. When it lapses, every managed Mac, iPad, and iPhone keeps reporting as enrolled and stops acting on commands, so the fleet looks healthy right up until someone needs something from it. Replace it with a certificate created by a different Apple Account and the devices unenrol, which means visiting each one.

## 2. Renew the ADE token before the next hardware order arrives

The Automated Device Enrollment server token is what connects Apple Business Manager to your MDM so new devices configure themselves out of the box. It is also annual. When it lapses, everything already enrolled carries on working normally and only new devices fail, so nothing looks wrong until a box of MacBooks lands for people starting on Monday. That is the least convenient moment available to find out.

## 3. Renew the Apps and Books token before app assignment fails

The content token (most people still call it the VPP token) authorises your MDM to assign purchased and free apps to your devices and users. Annual as well. When it lapses, assignment fails silently, new starters get a Mac without the software they need, and the console error rarely uses the word expired in a way anyone would connect to a licence they bought last year. Nothing crashes and nothing pages anyone, so the gap between the expiry date and the day somebody notices is usually measured in weeks.

## If you only do one thing

Open your MDM’s certificate page today and write down three things for each of the three: the expiry date, the Apple Account that owns it, and who in your organisation can reach that account’s mailbox. If any answer is a person rather than a shared account, fix that one first.
