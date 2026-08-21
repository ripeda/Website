---
layout: insight
title: "5 things to check about your clinic's backup this month"
dek: "A backup job that reports success every night is not the same as a backup you can restore a patient chart from."
description: "Five checks for a dental or medical clinic backup, ordered by what fails most often in the field. Restore testing, imaging data, offline copies, and retention."
image: /images/insights/clinic-backup-checks-og.png
date: 2026-08-11
verticals: [dental-medical, professional-services, design-agencies]
tags:
  - Backup
  - Data Recovery
  - Operations
keywords: "how to test a dental clinic backup, is my practice management database backed up, dental imaging backup CBCT, clinic ransomware backup offline copy, backup retention for medical records, dental practice IT Calgary, Apple backup for clinics"
reading_time: 3
author: "RIPEDA"
tldr:
  - "A backup nobody has restored from is a hypothesis, not a backup. Test a restore before you check anything else."
  - "Practice management databases are usually in scope. Imaging data often is not, because the volumes are large and get excluded during setup."
  - "At least one copy has to sit somewhere the clinic network cannot reach, or ransomware will encrypt the backup along with everything else."
  - "Check the oldest recoverable point, not just the newest. Problems found three weeks late need a copy from before they started."
related:
  - title: "Where iCloud stops and business backup begins"
    url: "/resources/insights/business-backup-beyond-icloud/"
    context: "Why consumer sync is not a backup, and what a clinic actually needs instead."
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How backup testing and monitoring fit into ongoing support for a clinic fleet."
  - title: "Apple IT for Dental and Medical Practices"
    url: "/industries/dental-medical/"
    context: "How clinics handle imaging, patient records, and privacy obligations on Apple."
---

Most clinic backups we look at are running. Fewer of them are complete, and fewer still have ever been restored from. The gap between those three states is where clinics lose a week of charting.

These are ordered by how often they fail in the field, not by how hard they are to check.

## 1. Restore something, and time how long it takes

Pick a real file from last week, restore it to a scratch folder, and open it. Until that happens, the backup is a hypothesis, and this is the single check that matters more than the other four combined. If pulling one file back takes forty minutes, you have also learned something useful about what a full recovery would look like on a Monday morning.

## 2. Confirm the imaging data is in the job, not just the database

Practice management databases usually get caught, because they are small and obvious. Imaging is the one that goes missing: CBCT volumes and intraoral series run to hundreds of gigabytes, and whoever was trying to get a slow first backup to finish often excluded that path and never put it back. Open the job's include list and read it. Both have to be there, and neither counts as backed up because the other one is.

## 3. Check that a copy exists somewhere the clinic network cannot reach

Ransomware encrypts what it can see, and that includes the USB drive behind the server and any NAS share the workstations have mounted. At least one copy needs to be offline, immutable, or held in a cloud account whose credentials are not the same as your day-to-day admin login. If every copy is reachable from a compromised front desk workstation, you effectively have one copy. Whatever sits offsite needs the same encryption and access control as the server, because patient data carries privacy obligations wherever it lives.

## 4. Make sure someone other than the person who built it can run a restore

The restore procedure tends to live in the head of whoever set the system up, and that person takes holidays in the same month things break. Write down where the copies are, which credentials open them, and the actual sequence of steps. Then have a second person follow the document while the first one watches and says nothing.

## 5. Look at how far back the retention actually goes

A database problem noticed at month end needs a copy from before it started, and a seven day window will not have one. Check the oldest recoverable point, not just the newest. Silent corruption and quiet deletions are the cases that expose this, and they are exactly the ones nobody catches on day one.

## If you only do one thing

Restore a file this week. Four of these checks are predictions about how a recovery will go; a completed restore is the only evidence you have.
