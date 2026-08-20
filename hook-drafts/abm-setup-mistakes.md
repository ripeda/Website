---
layout: insight
title: "The 7 most common Apple Business Manager setup mistakes"
dek: "Most Apple Business Manager accounts are set up in an afternoon, and the gaps only surface months later at the worst possible moment."
description: "The seven Apple Business Manager setup mistakes we see most often, from skipped domain verification to certificate renewals nobody owns, and how to avoid each."
date: 2026-08-11
published: false
tags:
  - Apple Business Manager
  - Deployment
  - Identity
keywords: "apple business manager setup mistakes, how to set up apple business manager correctly, apple business manager domain verification, linking a reseller to apple business manager, APNs certificate renewal, Managed Apple Accounts, Apple IT Calgary, Mac deployment"
reading_time: 3
author: "RIPEDA"
tldr:
  - "Almost every Apple Business Manager problem we inherit traces back to the first hour of setup, not to anything that happened since."
  - "The expensive ones are a personal Apple Account on the APNs certificate, a missing reseller link, and a single administrator."
  - "Federated identity is worth having, but only after you have audited for personal Apple IDs using company email addresses."
  - "Three tokens expire every year. If no one owns those dates, the fleet goes quiet without warning."
related:
  - title: "Apple Business Manager: what’s actually involved"
    url: "/resources/insights/apple-business-manager-whats-involved/"
    context: "The full walkthrough of what setting up Apple Business Manager actually requires, and what it connects to."
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How Apple Business Manager is kept current once the initial setup is done."
  - title: "Strategy & Advisory"
    url: "/services/strategy-advisory/"
    context: "Where identity, federation, and Apple account ownership fit into a wider IT plan."

# verticals: [mdm-security, quick-reads]
---

Apple Business Manager takes about twenty minutes to sign up for and considerably longer to set up correctly. Most of the accounts we inherit were created in a hurry by whoever happened to be free that afternoon, and the gaps stay invisible until a device order fails to appear or a certificate lapses. These are the seven we find most often, ordered from most common to least.

## 1. Verify the domain your staff actually use

Verification is the step everyone postpones. Apple Business Manager asks you to prove control of a domain by publishing a TXT record in DNS, and an account in a hurry either skips it or verifies a founder’s personal domain because that one was easier to get at. Without the company domain verified, you cannot create Managed Apple Accounts for the addresses your staff sign in with. Verify the domain your email runs on, not a side project.

## 2. Link the reseller ID before the next purchase order

Devices bought through a reseller only appear in Apple Business Manager if that reseller’s Apple Customer Number is linked to your account and the order is assigned to it. Without the link, the Macs arrive, get unboxed, and never enrol on their own. Older orders cannot always be backfilled after the fact, so add the reseller ID before the next purchase order goes out rather than after the boxes land.

## 3. Add a second administrator today

An account with one administrator is one resignation, one lost phone, or one long holiday away from being unreachable. Apple’s recovery path for an orphaned Apple Business Manager account is slow and evidence heavy, and it does not run on your timeline. Name at least two administrators, and if IT is a single person, make the second one someone in operations or finance.

## 4. Create the APNs certificate under a shared organisational account

The Apple Push Notification service certificate is what lets your MDM speak to every managed device, and it must be renewed each year by the same Apple Account that created it. Created under a technician’s personal Apple ID, that renewal becomes impossible the week they leave, and a lapsed APNs certificate means re-enrolling the whole fleet by hand. Use a shared organisational account tied to a monitored mailbox that more than one person can reach.

## 5. Audit for username collisions before turning on federation

Federated authentication with Microsoft Entra ID or Google Workspace is worth having, because staff sign in with credentials they already know. What catches people out is that any existing personal Apple ID using a company email address blocks federation for that person until the address is changed or released, and Apple gives them a grace period that runs whether or not anyone has told them. Pull the list of conflicts and email those people first, or federation day becomes a queue at your desk.

## 6. Keep Managed Apple Accounts distinct from personal Apple IDs

A Managed Apple Account is created and owned by your organisation. A personal Apple ID belongs to the individual and leaves with them, along with their App Store purchases and whatever else is in that iCloud account. Staff who sign in to a company Mac with a personal Apple ID leave the device tied to their Find My, which is how Activation Lock ends up in the name of someone who left in March. Set the expectation at onboarding, not at exit.

## 7. Put the annual renewals in a shared calendar

The APNs certificate, the Automated Device Enrollment server token, and the Apps and Books content token all expire once a year, and none of them announce it loudly. Add all three to a shared calendar with a reminder 30 days out and a named owner in the invitation. An expiry that nobody owns is an outage with a date on it.

## If you only do one thing

Check which Apple Account owns your APNs certificate. If it is a personal Apple ID, move the certificate to a shared organisational account before the next renewal, because once it lapses the recovery is re-enrolling every device you manage.
