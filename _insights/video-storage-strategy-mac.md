---
layout: insight
title: "Storage strategy for video production on Mac"
dek: "Video work hits storage harder than any other creative discipline. NAS, cloud, hybrid, and direct-attached each fit a stage of the pipeline, and the wrong choice shows up in render queues."
description: "NAS, cloud, hybrid, or direct-attached storage for Mac video production. Where each fits, where each fails, and what to build for an editing team that scales."
image: /images/insights/video-storage-strategy-mac-og.png
date: 2026-05-08
tags:
  - Storage
  - Infrastructure
  - Architecture
keywords: "video storage Mac, NAS for video editing, Mac post-production storage, video editing storage strategy, 10GbE for video editing, cloud video editing storage, Mac production pipeline, Apple consulting Calgary"
reading_time: 6
author: "RIPEDA"
tldr:
  - "Editing storage and archive storage are two different problems. Treating them the same is the most common mistake."
  - "Direct-attached storage is fast and cheap per terabyte but isolates work to one editor. NAS solves collaboration. Cloud solves distance."
  - "10 Gigabit Ethernet (10GbE) is the threshold for serious multi-editor work. Below that, the network becomes the bottleneck."
  - "Hybrid pipelines now dominate at the studios that scale. Local for active edit, NAS for shared review, cloud for archive and delivery."
  - "Capacity planning matters more than headline transfer speed. A storage strategy without archive is a storage strategy that breaks at year two."
related:
  - title: "Network Infrastructure Services"
    url: "/services/network-infrastructure/"
    context: "How we design the 10GbE backbones and NAS deployments behind multi-editor pipelines."
  - title: "Design Agencies"
    url: "/industries/design-agencies/"
    context: "Storage strategy is part of the broader agency stack we support."
  - title: "Where iCloud stops and business backup begins"
    url: "/resources/insights/business-backup-beyond-icloud/"
    context: "Backup considerations for the storage tiers a production team relies on."
---

A two-person video shop runs everything off external Thunderbolt drives. It works. A six-person agency tries the same pattern and hits the wall by the third project. Files live on three different drives, the wrong version gets exported, and a junior editor spends a Friday afternoon copying media for next week's review. The storage strategy that worked at two people stops working between four and six. The studios that get past this point all do the same thing: they separate editing storage from archive storage, and they build a network that can carry both.

Video production hits storage harder than any other creative discipline. A single feature-length project in 4K ProRes 422 High Quality (HQ) runs close to a terabyte before grading. Multiply that by ten projects in flight, three editors, and an archive of completed work nobody wants to delete, and the storage conversation stops being optional. It becomes the foundation of the whole pipeline.

## Where each storage tier fits

**Direct-attached storage (DAS).** A Thunderbolt drive on the desk. Fast, cheap per terabyte, and isolated to a single editor. The right call for the active edit of a single project, where speed matters and collaboration does not. Wrong call when more than one person needs the same media at the same time. A DAS is not a backup, no matter how often it gets called one. The drive on the desk needs its own backup target, because the day it fails is the day every project sitting on it is gone with it.

**Network-attached storage (NAS).** Synology, QNAP, or TrueNAS over 10 Gigabit Ethernet (10GbE). The right call for multi-editor projects, shared review folders, and centralised media management. Modern NAS at 10GbE sustains real ProRes editing across multiple seats. Below 10GbE, the network throttles the work before the drives do.

**Cloud storage.** Backblaze B2, Wasabi, Amazon Web Services (AWS) S3, or a managed service like Frame.io. The right call for distance: remote editors, client review across cities, off-site archive that survives a studio fire. Wrong call for active editing of large media. The network and the cloud egress costs both punish that pattern.

**Hybrid.** The pipeline most working studios actually run. Active project media on a NAS or local DAS. Shared review and proxy versions in the cloud. Completed projects archived to cloud with metadata indexes that survive without a working NAS.

## Building it for a scaling team

The mistake we see most often is treating storage as one purchase rather than a layered pipeline. A studio buys a single large NAS, fills it, and then either runs out of room or tries to make it serve both edit and archive. Performance suffers and capacity planning becomes a quarterly emergency.

<div class="insight-stat">
  <p><strong>Edit tier.</strong> Fast NAS at 10GbE or direct-attached Thunderbolt. Capacity sized for active projects only, with monthly clearance back to archive.</p>
  <p><strong>Archive tier.</strong> Slower, larger storage. Often a second NAS or a cloud bucket. Holds completed projects with searchable metadata.</p>
  <p><strong>Backup.</strong> Edit tier mirrored to the archive tier. Archive tier mirrored off-site. Two failure modes covered.</p>
</div>

The throughput numbers worth caring about: a 10GbE link sustains roughly 1.1 GB per second, which handles two to three streams of ProRes 422 HQ at 4K. Most multi-editor pipelines are network-bound long before they are drive-bound. Upgrading the NAS without upgrading the switching gets a studio nothing. The right sequence is the wiring first, switches second, then NAS, then drives.

Capacity planning is the other half. A studio producing two completed projects a month, each weighing roughly 1 TB in raw and graded media, accumulates 24 TB of new material per year before duplication. The archive plan needs to account for that growth across a five-year horizon, not just the current quarter.

## When the cloud earns its place

Cloud storage in a video pipeline is rarely the primary edit tier. The latency and the bandwidth costs both work against that use. Where it earns its place is at the edges: remote reviewers, distributed editors, deliverables for clients on tight turnarounds, and archive for material the studio cannot afford to lose to a single site failure.

Frame.io for review and approval. A cloud bucket for finished masters and client deliverables. Optional remote-editor proxies for an editor working in another city. These all sit alongside the NAS, not instead of it.

## When to think about this

The right moment to design the storage pipeline is before the third editor is hired, before the studio takes on a project bigger than its current drive, or before an in-flight project crosses a deadline because someone could not find the right take. After any of those, the conversation becomes remedial.

A storage strategy is not just about how much. It is about which tier does which job, and what holds the whole thing together when projects start to overlap.
