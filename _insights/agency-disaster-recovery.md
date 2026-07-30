---
layout: insight
title: "Disaster recovery when the work is the assets"
dek: "Backup is not the same as disaster recovery. For an agency, the difference is whether a missing day costs you a deadline or costs you the client."
description: "Disaster recovery for a creative agency. What to back up, what to replicate, and how to test the plan before the day you need it to work."
image: /images/insights/agency-disaster-recovery-og.png
date: 2026-04-22
tags:
  - Backup
  - Data Recovery
  - Architecture
keywords: "agency disaster recovery, creative agency backup, design studio data recovery, off-site backup agency, 3-2-1 backup rule, disaster recovery plan agency, agency business continuity, Apple consulting Calgary"
reading_time: 6
author: "RIPEDA"
tldr:
  - "Backup answers 'can we recover this file.' Disaster recovery answers 'can the studio operate on Monday.'"
  - "The 3-2-1 rule still applies: three copies, two media types, one off-site."
  - "Active project material, brand assets, and finished deliverables each need a different recovery time."
  - "The disaster recovery plan that has never been tested is the disaster recovery plan that does not work."
  - "Off-site copies are the difference between a slow week and a closed studio. The cost of getting this wrong arrives all at once."
related:
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "Backup and disaster recovery are part of how we run ongoing Apple environments."
  - title: "Design Agencies"
    url: "/industries/design-agencies/"
    context: "How we support creative studios with backup, business continuity, and asset protection."
  - title: "Where iCloud stops and business backup begins"
    url: "/resources/insights/business-backup-beyond-icloud/"
    context: "The distinction between consumer cloud sync and business-grade backup, written for non-IT readers."
---

A boutique design agency in Edmonton loses a NAS to a sudden hardware failure on a Thursday afternoon. The studio has Time Machine backups on the same NAS. Three concurrent projects are sitting on it. By Friday morning the backup vendor confirms that nothing on the original disks is recoverable and the Time Machine snapshots are gone with it. The studio's client list, brand asset library, and active project files all evaporate in the same moment. The recovery, once they bring in a data recovery firm, takes six weeks and costs roughly fifteen thousand dollars. Two of the three clients walk during that window.

This is what disaster recovery is for. Not the small day-to-day "I deleted a file" recovery, which a backup handles. The big "the room is on fire" recovery, which only a plan handles. For an agency where the work is the assets, the difference between the two is whether the studio survives a bad month or stops existing.

## The distinction that matters

**Backup** is what answers "can we recover this file from yesterday." It runs continuously or on a schedule, captures incremental changes, and lives close to the data it protects. Time Machine, network-attached backup, and cloud sync all live in this category.

**Disaster recovery** is what answers "can the studio operate on Monday after the server room floods." It requires off-site copies, defined recovery times, and a written plan for who does what in the first hour. Disaster recovery uses backup as one input, but the two are not the same problem.

The studios that confuse the two assume that because they have a NAS doing Time Machine, they have disaster recovery covered. They do not. A NAS doing Time Machine in the same room as the production storage is one fire away from being no protection at all.

## The 3-2-1 rule still works

The phrase predates the cloud and still holds. Three copies of every important file. Two different media types. One copy off-site. The implementation has changed over twenty years. The principle has not.

For a creative agency in 2026, a workable 3-2-1 looks like:

**Copy one.** The active working file on a designer's Mac and on the studio NAS. Both update continuously through the production day.

**Copy two.** A second NAS or a dedicated backup appliance in the same building, taking nightly snapshots of the production NAS. Survives the failure of the production hardware but not the building.

**Copy three.** Cloud backup of the production NAS and the brand asset library to a separate provider. Backblaze B2, Wasabi, or Amazon Web Services (AWS) Glacier for archive tiers. Survives the building. Survives the city.

<div class="insight-compare">
  <div class="insight-compare-col">
    <h4>Backup Only</h4>
    <p>What many agencies still do:</p>
    <ul>
      <li>Time Machine to a NAS in the production room</li>
      <li>Single backup destination, no off-site copy</li>
      <li>No defined recovery time</li>
      <li>No documented plan</li>
    </ul>
    <p class="insight-compare-conclusion"><strong>Result:</strong> protected against file deletion. Not protected against site failure, hardware failure, or ransomware.</p>
  </div>
  <div class="insight-compare-col is-strong">
    <h4>Disaster Recovery</h4>
    <p>What actually keeps the studio operating:</p>
    <ul>
      <li>Three copies, two media types, one off-site</li>
      <li>Defined recovery time objective per asset class</li>
      <li>Documented plan with named owners</li>
      <li>Quarterly tested restore from off-site</li>
    </ul>
    <p class="insight-compare-conclusion"><strong>Result:</strong> the studio can operate on Monday regardless of what happened over the weekend.</p>
  </div>
</div>

## Recovery time objectives per asset class

Not every asset needs the same urgency. The smart move is to separate the recovery plan by asset class.

**Active project material.** Recovery time objective measured in hours. The active editor's machine and the production NAS both need fast restore paths. Off-site cloud copy is the fallback for catastrophic loss.

**Brand asset libraries.** Recovery time objective measured in a day. Brand assets per client are slow-changing but irreplaceable. Cloud copy is the primary safeguard.

**Finished deliverables.** Recovery time objective measured in days. Completed work that has been shipped to the client. Archive tier cloud storage is sufficient. Cold storage is acceptable.

**Operational systems.** Recovery time objective measured in hours. Email, accounting, time tracking, identity. Most of these are already cloud-hosted, so the recovery plan is account-level rather than file-level.

## The plan only works if it has been tested

The single most common failure pattern is a documented disaster recovery plan that has never been executed. The plan looks correct on paper. The first time it runs is the day it is needed. That is the wrong day to discover that the cloud restore takes nine days at consumer bandwidth, or that the brand asset library backup was excluding the folder it most needed to include.

A quarterly restore test from the off-site copy is the minimum discipline. The test does not need to restore everything. It needs to restore enough to prove the path works end to end. One project room, one client brand library, one operational system. Repeat with different selections each quarter.

## When to think about this

The right time to set up disaster recovery is before it is needed. After the NAS dies is not the time to learn that the off-site copy was excluded from the backup schedule. Before the studio takes on a project with non-disclosure obligations that require documented business continuity is the right time. Before the next client Request For Proposal (RFP) that includes a security questionnaire is the right time.

For an agency where the work is the assets, disaster recovery is not optional infrastructure. It is the line between a difficult month and a closed studio.
