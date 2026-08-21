---
layout: insight
title: "5 things to check before you buy a used Mac"
dek: "A private Mac sale carries almost no mechanical risk and quite a lot of administrative risk, and all of it is checkable with the seller sitting in front of you."
description: "Activation Lock, MDM enrollment, storage config, and two more checks that decide whether a used Mac is a bargain or a paperweight. Do them before you pay."
date: 2026-08-11
tags:
  - Procurement
  - Apple Silicon
  - Lifecycle
keywords: "how to check activation lock before buying a used mac, what to check when buying a used macbook, used mac battery cycle count check, is this used mac enrolled in mdm, used MacBook buying checklist, Apple consulting Calgary, Mac support"
reading_time: 3
author: "RIPEDA"
verticals: [mdm-security]
tldr:
  - "Activation Lock is the only item here that can cost you the entire purchase price, so it goes first and it goes before the money moves."
  - "A Mac that was once a company machine can be enrolled in someone else's Apple Business Manager, and erasing it does not clear that."
  - "On Apple Silicon, memory and storage are fixed for the life of the machine, so the configuration in the listing has to be the configuration on the desk."
  - "Battery condition is a cost, not a deal-breaker. Use it to move the price."
related:
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How second-hand Macs get brought into a managed fleet without inheriting the previous owner's enrollment."
  - title: "Apple Authorized Repair"
    url: "/services/apple-authorized-repair/"
    context: "What a battery or display replacement on an out-of-warranty Mac actually involves."

---

A used M2 MacBook Air at a good price is a genuinely good buy, right up until it turns out to still belong to someone else's Apple Account. Very little of the risk in a private Mac sale is mechanical. Most of it is administrative, and all of it can be checked in about ten minutes while the seller is still in the room.

The order below runs from what voids the sale outright down to what only costs you money.

## 1. Watch it erase and boot to Setup Assistant

Activation Lock ties a Mac to the seller's Apple Account, and a locked machine cannot be released by anyone except that account holder. Before money changes hands, have the seller sign out of iCloud, erase the Mac, and let it restart in front of you. What you want to see is the Setup Assistant greeting, not a user login window and not a screen asking for a previous Apple ID. A seller who prefers to hand it over signed in, so you can "set it up later", is asking you to take the one risk on this list that has no remedy.

## 2. Ask whether it was ever a company machine

A Mac enrolled in an organization's Apple Business Manager receives its MDM configuration during setup, and erasing the disk does not remove that. It will re-enrol on the next run through Setup Assistant and ask for credentials the seller cannot provide. Only the original organization can release the serial from ABM, which a former employee has no ability to do. If a Remote Management screen appears during setup, or the listing mentions a previous workplace, stop there.

## 3. Run the serial number through Apple's coverage checker

Apple's Check Coverage page takes the serial from About This Mac and returns the model, the warranty status, and whether AppleCare+ is still running. Two results end the conversation: a serial Apple does not recognize, and a serial that describes a different model than the one on the table. If coverage is still live, ask whether the seller will transfer the AppleCare+ plan, because it can follow the device but the transfer does not happen on its own.

## 4. Confirm storage and RAM against the listing

On Apple Silicon the memory sits in the same package as the processor and the storage is soldered to the board, so the configuration you buy is the configuration you keep. Open About This Mac and read it against the listing before agreeing on a price. An 8 GB machine with a 256 GB disk sold as a 16 GB machine with 512 GB is not a discount, it is a different product, and no amount of money later will change it.

## 5. Read the battery condition and cycle count

System Settings shows battery condition as Normal or Service Recommended, and the exact cycle count sits in System Information under Power. Apple rates current notebook batteries for 1,000 cycles, so a Mac sitting at 900 is near the end of a battery rather than near the end of a Mac. A replacement is a real cost on an otherwise good machine, which makes this the item you negotiate with rather than the item you walk away over.

## If you only do one thing

Do not hand over money until you have watched the Mac erase and land on the Setup Assistant greeting. Everything else on this list has a price attached to it, and Activation Lock does not.
