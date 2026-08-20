---
layout: insight
published: false
title: "4 reasons AirDrop keeps failing between two Macs in the same room"
dek: "AirDrop fails quietly: rarely an error, usually just an empty share sheet where a name should be."
description: "Why AirDrop shows nothing between two Macs on the same desk, ordered by how often we see it: Contacts Only, radios off, firewall and MDM policy, and sleep."
date: 2026-08-11
tags:
  - File Sharing
  - Collaboration
keywords: "why is AirDrop not working between two Macs, AirDrop not showing other Mac, AirDrop contacts only not working, fix AirDrop on Mac, AirDrop blocked by MDM, Mac support Calgary, Apple IT for agencies"
reading_time: 2
author: "RIPEDA"
tldr:
  - "AirDrop failures are almost always discovery failures. The file never gets a chance to move because the receiving Mac never appears."
  - "Contacts Only is the most common cause, and it shows nothing rather than an error when the conditions are not met."
  - "AirDrop needs both Bluetooth and Wi-Fi on at both ends, even when neither Mac is using Wi-Fi for anything else."
  - "On a managed fleet, a blocked AirDrop may be policy rather than a fault. Check before working around it."
related:
  - title: "The problem with AirDrop at agency scale"
    url: "/resources/insights/airdrop-and-team-file-sharing/"
    context: "Why a team that AirDrops a hundred times a week ends up without a single source of truth."
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How file transfer, device policy, and shared storage are set up so this stops being a daily question."
---

Two Macs, same desk, same Wi-Fi, and the receiving machine simply does not appear in the share sheet. AirDrop rarely explains itself when it fails. You get an empty list rather than a reason, which is why the same four causes keep costing people ten minutes each.

One thing to separate out first. If the file is very large, AirDrop being slow and dropping partway through is not a fault to troubleshoot. It is a signal that the transfer belongs on the team storage. What follows is in rough order of how often we see it.

## 1. The receiving Mac is set to Contacts Only

This accounts for more AirDrop failures than the other three combined. Contacts Only requires both people to be signed into iCloud, and each person's Apple Account email address to be saved in the other person's Contacts card. When any part of that chain is missing, the sending Mac shows nothing at all rather than telling you why. Open Control Centre on the receiving machine and set AirDrop to Everyone for 10 Minutes.

## 2. Bluetooth or Wi-Fi is off on one of the machines

AirDrop uses Bluetooth to discover the other device and a direct peer-to-peer Wi-Fi link to move the data. Both radios have to be on at both ends, even though the transfer never touches your network or your router. A Mac plugged into ethernet with Wi-Fi switched off cannot receive an AirDrop, which is why this shows up most often on desktops and docked laptops.

## 3. A firewall or MDM policy is blocking incoming connections

The macOS firewall option to block all incoming connections stops AirDrop along with everything else it is meant to stop. On a managed fleet, a configuration profile from Jamf, Mosyle, or Kandji can restrict AirDrop outright, and on some clients that restriction is deliberate policy rather than a misconfiguration. Confirm with whoever manages the fleet before working around it.

## 4. The receiving Mac is asleep or locked

A Mac with the lid closed or the display asleep drops off AirDrop discovery, and on some configurations a locked screen is enough to do it. Wake the machine, unlock it, and leave the AirDrop window open in the Finder while the sender looks. It is the cheapest cause to rule out and the easiest to forget when two people are troubleshooting from opposite sides of a desk.

## If you only do one thing

Set the receiving Mac to Everyone for 10 Minutes and wake its screen. That clears the two most common causes in one move, and if the file still will not go, you are looking at a radio or a policy rather than a setting.
