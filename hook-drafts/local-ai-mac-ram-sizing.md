---
layout: insight
published: false
title: "How much RAM you actually need to run AI locally on a Mac"
dek: "On Apple Silicon the GPU addresses system memory, so total RAM decides which models you can run at all."
description: "How much RAM you need to run AI models locally on a Mac, with sizing bands from 16GB to 96GB and why memory bandwidth matters separately from capacity."
date: 2026-08-11
verticals: [ai-productivity]
tags:
  - Apple Silicon
  - Performance
  - Procurement
keywords: "how much ram to run ai models locally on a mac, apple silicon unified memory explained, running large language models on a macbook pro, 64gb vs 128gb mac for local ai, mac for local llm inference, Apple Silicon Calgary, local ai workstation"
reading_time: 3
author: "RIPEDA"
tldr:
  - "Apple Silicon uses unified memory, so usable model size is governed by total RAM rather than a separate video memory pool."
  - "A quantized model needs slightly more memory than its file size, plus headroom for macOS and everything else open."
  - "16GB runs small models for light use and is genuinely constrained. 48GB and up is where larger models become comfortable."
  - "Memory bandwidth varies by chip tier and affects speed independently of how much RAM is installed."
related:
  - title: "Why local AI workloads run best on a Mac"
    url: "/resources/insights/mac-local-ai-workstation/"
    context: "The architectural case for running models on Apple Silicon instead of renting cloud inference."
  - title: "Strategy & Advisory"
    url: "/services/strategy-advisory/"
    context: "Specifying and buying Macs for AI work without over-purchasing the wrong component."
---

The question comes up in almost every conversation about running models locally, usually phrased as whether a MacBook Pro is enough. The answer is less about the chip than about how much memory is soldered next to it, and the arithmetic on a Mac is not the same as on a PC with a discrete graphics card.

## Why RAM is the whole constraint on a Mac

On a machine with a discrete GPU, a model has to fit in video memory, which is a separate pool and usually much smaller than system RAM. Apple Silicon uses unified memory: the CPU and GPU address the same physical RAM. The practical consequence is that usable model size on a Mac is governed by total installed RAM rather than by a separate VRAM budget, which is why a 64GB Mac can run models that a discrete card with 16GB cannot. The trade is that the model competes for that memory with macOS and everything else you have open.

## Sizing by band

A quantized model needs a little more memory than its file size on disk, because the weights load and then context and working allocations sit on top. After that it is headroom: macOS with a browser, an editor and a video call already consumes a meaningful share of a 16GB machine before a model loads at all.

| Installed RAM | Model scale that fits | Realistic use |
|---|---|---|
| 16GB | Small models, 7-8B class, quantized | Drafting, summarizing, text cleanup. One model at a time with little else open. Works, and genuinely constrained. |
| 24-32GB | 7-8B comfortably, 13-14B class quantized | A daily driver alongside a browser and an editor. Longer conversations without hitting memory pressure. |
| 48-64GB | 30B+ class quantized | Better reasoning and code work, longer context, room to keep a model resident all day. |
| 96GB and up | 70B class quantized | The largest locally practical models, or several smaller ones loaded at once. |

The 16GB band deserves an honest note: it runs small models, it is genuinely useful, and it is also where the ceiling shows up first. A longer conversation, a second application, or a slightly larger model pushes the system into memory pressure, and performance falls off sharply rather than degrading gently.

## Bandwidth is a separate question from capacity

Capacity decides what fits. Memory bandwidth decides how quickly tokens come back, and it varies substantially across the chip tiers. The base M-series chips have considerably less bandwidth than the Pro, Max and Ultra parts, so two Macs with the same 64GB can load the same model and return answers at noticeably different speeds. If responsiveness matters more than running the largest possible model, the chip tier deserves as much attention as the RAM figure.

## If you only do one thing

Buy the memory rather than the storage. RAM is the one specification you cannot change after purchase on Apple Silicon, and it is the only one that decides which models you can run at all.
