---
title: I Turned My Claude Code History Into an SAO-Style Floating Castle
date: '2026-05-24'
excerpt: >-
  A fun project where I built a custom Claude Code skill that transforms my chat
  sessions into a floating castle inspired by Sword Art Online's Aincrad. Each
  session becomes a unique floor based on the type of work I did, creating a
  visual and immersive way to revisit past projects.
tags:
  - personal project
  - AI workspace
  - Claude Code
  - SAO
tldr:
  - You can turn Claude Code session history into a visual, floor-by-floor map inspired by SAO's Aincrad castle
  - Each floor is themed after the type of work done in that session - code, docs, slides, etc.
  - The skill reads recent session transcripts and renders a full castle with boss floors for the most recent sessions
  - It's a creative way to navigate and rediscover past projects without digging through raw chat logs
---

A few weeks ago, I was trying to find an old Claude Code session where I had built a small automation script.

I remembered the idea. I remembered the project.
I even remembered the vibe of that late-night debugging session.

But finding it? Impossible. It was just endless chat history and that’s when I had a stupid but fun idea:

> "What if my chats looked like Sword Art Online’s AINCARD instead of a sidebar?"

And somehow… that turned into a real thing.

## So What Is This?

I built a custom Claude Code skill that converts my latest 20 sessions into a floating anime-style castle. Every session becomes a floor. The newest chat becomes the top “boss floor.” Older conversations sit lower in the tower like the earlier levels of Aincrad. But the best part is this:

- The floors don’t look random. They change depending on what I created during that session.

  - If I worked mostly on Python scripts, the floor becomes this darker tech-dungeon style area.

  - If I created presentations, the floor feels more like a glowing crystal hall.

Documentation-heavy sessions become giant archive-style floors filled with “scroll” vibes. It honestly started feeling less like chat history and more like walking through old projects.

## The Moment It Started Feeling Cool

The first time I opened the tower, I clicked one of the upper floors and immediately recognized the session. Not because of the title. Because of the atmosphere. That floor had:

* database migration scripts
* markdown docs
* pipeline files

and the whole thing looked like some underground engineering archive.
Another floor had slide decks and diagrams, so it looked brighter and more polished. Without even reading much, I already knew what kind of work I had done there. That’s when I realized this was actually useful.

## How It Works?

The whole thing runs from a single Python script. The script scans Claude Code session files stored locally:

```bash
~/.claude/projects/*/*.jsonl
```

Those files already contain everything:

* prompts
* messages
* tool calls
* edited files
* generated resources

So instead of using AI guesses, the script reads actual session activity. It checks for tools like:

* `Write`
* `Edit`
* `MultiEdit`
* `NotebookEdit`

and collects the files created during the conversation. 

That’s how it figures out the “theme” of each floor. A session with lots of `.py` files feels different from one full of `.pptx` or `.md` files.

## The Castle UI Was the Hardest Part

At first, the output looked boring. Just stacked cards. It worked, but it didn’t feel like Aincrad. So I rebuilt the entire UI around a floating castle image.

Now the castle sits in the center of the screen with glowing floor markers connected by animated paths. Clicking a floor opens a smooth SAO-style side panel with:

* session details
* created files
* project info
* animations
* floor transitions

Even keyboard navigation works. Arrow keys move between floors like climbing the tower. That small detail made it feel surprisingly immersive.

## One Unexpected Thing I Loved

Some sessions had no files at all.Just thinking, planning, or debugging discussions. 
Instead of forcing themes onto them, I turned those into peaceful “safe-zone” floors. Almost like rest areas inside the castle. That tiny design choice ended up making the whole thing feel more human. Not every session needs to be productive chaos. Some are just thinking spaces.

## The Funniest Part

The current conversation became the newest boss floor automatically. So while building the system… the system was already adding itself into the castle. That felt very SAO somehow.

## Performance Was Wild

I also tested what happens without the custom skill. Claude could still build a tower from scratch… but it took several minutes and massive token usage. With the skill, the whole thing builds almost instantly because the logic is already structured.

The difference was huge. It went from:
“generate everything manually”
to:
“load my world.”

## Why I Think This Matters

This project made me realize something important. AI chats are slowly becoming our real creative workspace.

We:

* write code there
* design systems there
* build presentations there
* brainstorm products there
* debug production issues there

But the interfaces still treat everything like disposable messages. That feels wrong.

I think AI workspaces should feel alive.

- More visual.
- More personal.
- More memorable.

This project was my weird anime-inspired attempt at that idea.

## Final Thoughts

I originally built this just because I thought it would look cool. But now I genuinely use it. Sometimes I open the tower just to remember what I worked on during the week.

And honestly? Seeing your projects as floors inside a floating castle is way more fun than scrolling through old chat tabs. If you use Claude Code a lot, try building weird personal tools like this. Those are usually the projects that end up teaching you the most.
