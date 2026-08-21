---
layout: insight
title: "4 things to try before you assume a Mac drive is dead"
dek: "A Mac that will not boot gets diagnosed as a dead drive far more often than it actually is one, and the wrong first move can make a recoverable disk unrecoverable."
description: "Four checks before you write off a Mac drive, ordered from least invasive first: cables and display, Recovery mode, copying data off, and Mac Sharing Mode."
date: 2026-08-11
tags:
  - Data Recovery
  - Storage
  - Backup
keywords: "mac wont boot what to do, how to tell if a mac hard drive has failed, boot apple silicon mac to recovery mode, disk utility does not see the drive, Mac Sharing Mode target disk mode, Mac data recovery Calgary, Apple support Calgary"
reading_time: 3
author: "RIPEDA"
verticals: [mdm-security, dental-medical, design-agencies, education, professional-services]
tldr:
  - "A Mac that seems dead is often a Mac that is running with no picture, so cables and displays come before anything else."
  - "Recovery mode and Disk Utility answer the only question that matters early: can the machine see the disk at all?"
  - "If the volume mounts, copy data off before running any repair. First Aid can make a marginal drive worse."
  - "On Apple Silicon the storage is soldered to the logic board, which is exactly why the backup matters more than the recovery."
related:
  - title: "Data recovery when a Mac drive fails"
    url: "/resources/insights/mac-drive-data-recovery/"
    context: "What actually happens to the data when a Mac drive fails, and what recovery does and does not get back."
  - title: "Apple Authorized Repair"
    url: "/services/apple-authorized-repair/"
    context: "When a non-booting Mac stops being a software problem and becomes a hardware one."
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How managed backup turns a failed drive into a bad afternoon instead of a lost quarter."
---

"The drive is dead" is the most common diagnosis for a Mac that will not start up, and it is wrong often enough to be worth testing before anyone acts on it. Four checks cost nothing, and done in this order they will not make the situation worse. One thing worth knowing up front: on Apple Silicon the storage is soldered to the logic board, so there is no pulling the drive and reading it in an enclosure the way there was on a 2012 MacBook Pro. That constraint is exactly why the backup matters more than the recovery.

## 1. Change the cable, the charger, and the display

A Mac that seems dead is very often a Mac that is running with no picture. Try a different power adapter and a different USB-C cable (a failed cable is more common than a failed Mac), then a different display and a different port. Listen for fans or a startup chime, and put a hand on the enclosure to feel whether it is warm. If an external display shows a desktop, this is a panel or cable problem and the data was never in danger.

## 2. Boot to Recovery and open Disk Utility

On Apple Silicon, hold the power button until "Loading startup options" appears, then choose Options. On Intel, hold Command-R at power-on. In Disk Utility, switch View to Show All Devices: if the physical disk appears but the volume will not mount, this is a file system problem, and if nothing appears at all, it points at storage or the logic board. That one observation decides everything that follows, and it is worth making before anyone starts running repairs.

## 3. If the volume mounts, copy data off before repairing anything

First Aid is a repair tool, not a recovery tool, and running it against a marginal drive can turn a readable volume into an unreadable one. If Disk Utility mounts the volume, connect an external disk and copy the folders that matter off first, then think about repair. Recovery includes Terminal, so `cp` or `rsync` will do the job if the Finder is not cooperating. A copy you can make now is worth more than a repair you might attempt later.

## 4. Try Mac Sharing Mode from a second Mac

Apple Silicon Macs offer Mac Sharing Mode: boot the problem Mac into Recovery, choose Options, then Utilities and Share Disk, and connect it to a working Mac over USB-C or Thunderbolt. On Intel Macs the equivalent is target disk mode, holding T at power-on. A second Mac will sometimes mount a volume the first one could not, which occasionally turns a dead Mac into a slow but successful copy job. If nothing mounts here either, the next step is a conversation about professional recovery rather than another attempt on your own.

## If you only do one thing

If the volume mounts at any point on this list, stop and copy it. A successful copy off a failing drive is the only outcome in this process you control.
