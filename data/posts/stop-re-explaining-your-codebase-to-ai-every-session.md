---
title: Stop Re-Explaining Your Codebase to AI Every Session
date: '2026-07-17'
excerpt: >-
  Tired of explaining your project to Cursor, Claude Code, or Copilot every new
  session? Here's why AGENTS.md is becoming the standard way to give coding
  agents repository context.
tags:
  - AGENTS.md guide
  - AI coding assistants
  - Claude Code AGENTS.md
  - Cursor AGENTS.md
  - GitHub Copilot AGENTS.md
  - Codex CLI AGENTS.md
  - AI developer workflow
  - repository context for AI
  - AI coding best practices
  - developer productivity
  - coding agent configuration
  - AI code generation
  - monorepo AI workflow
  - Claude Code
  - Cursor IDE
  - GitHub Copilot
  - Codex CLI
---
Every new session with a coding agent starts the same way. You open Claude Code or Cursor, and before you ask for anything useful, you type the ritual:
"This is a TypeScript monorepo. We use pnpm, not npm. Build with pnpm build. Tests live next to the source files. Never touch the generated client in `/src/api/gen`, Migrations go through the CLI, not raw SQL."

You had typed this yesterday. *You will be typing it tomorrow. Why?* Most coding agents don't remember how your repository works between sessions, so every new chat starts with you explaining the same things again.

For a week i kept observing this pattern within my work itself, across two projects, I pasted some version of "here's how our project works" more than 8 times. That is not a workflow just a copy-paste job i was doing with extra steps.
And while looking for better way to handle this, i came across a best fix i would say and it is single Markdown file called "AGENTS.md."

## What AGENTS.md is?
AGENTS.md is a plain Markdown file at the root of your repo. It holds the context a coding agent needs before it writes a line: build commands, test procedure, key modules, code patterns, and hard boundaries. The agent reads it automatically at session start. No prompt needed.

Think of it this way: README.md is for humans, "**AGENTS.md**" is for agents.

It started with Codex CLI, but it has since moved under the Linux Foundation's Agentic AI Foundation alongside MCP. More and more open source repositories are shipping one, which is why so many coding tools now understand it out of the box. Over 60,000 open source repos already ship one. 

It started as something tied to Codex, but today it's supported by enough tools that it feels more like shared infrastructure than a vendor-specific feature.  It is the closest thing right now this space has to a standard or convention. The format has no schema, no YAML frontmatter, no required fields. Headings and bullet points. That is the whole spec, and it is the reason adoption moved so fast.

## Who reads it
Support isn't identical across every coding agent, so here's what the current landscape looks like.

| Tool | Reads AGENTS.md? | Notes |
|---|---|---|
| Codex CLI | Yes, natively | Its primary config file |
| Cursor | Yes, natively | Alongside `.cursor/rules/` |
| GitHub Copilot | Yes, natively | No separate file needed |
| Windsurf, Amp, Devin, Aider, Zed | Yes, natively | |
| Claude Code | Partial | Native file is `CLAUDE.md`. Recent versions fall back to `AGENTS.md`; otherwise import it (below) |
| Gemini CLI | Config change | Default is `GEMINI.md`; point `context.fileName` at `AGENTS.md` |

For Claude Code, The setup I like is a two-line `CLAUDE.md`:

```markdown
# CLAUDE.md
@AGENTS.md
```
The @ import pulls AGENTS.md into context at launch. Your team maintains one file, every tool reads it, and anything Claude-specific goes below the import line. A symlink (ln -s AGENTS.md CLAUDE.md) works too, but the import survives Windows without admin rights.



## What goes in the file?
When I'm editing AGENTS.md, I use one simple rule: if the agent could figure something out on its own, it probably doesn't belong in the file.
In practice, most of my files end up covering the same things:
- "how to build, test and lint the project"
- "where the important modules live"
- "project-specific conventions that aren't obvious"
- "things the agent should never edit"

Here is a real-shaped example:
```markdown
# AGENTS.md

## Project
Go API server + React dashboard. Postgres 16, migrations via Liquibase.

## Commands
- Build: `make build` (never `go build` directly, it skips codegen)
- Test: `make test` (unit) / `make test-integration` (needs Docker up)
- Lint: `make lint` before every commit

## Key modules
- `/internal/store` - all DB access. Nothing else touches the DB.
- `/internal/api` - HTTP handlers. Thin. Logic lives in `/internal/service`.
- `/migrations` - Liquibase changelogs. Append only, never edit old files.
- `/web` - React dashboard. Separate pnpm workspace.

## Patterns
- Errors wrap with `fmt.Errorf("context: %w", err)`. No naked returns of `err`.
- New endpoints need a handler test AND a service test.
- Feature flags via `flags.IsEnabled()`, never env vars in business logic.

## Never touch
- `/internal/api/gen` (generated from OpenAPI spec, run `make gen` instead)
- Old files in `/migrations` (append a new changelog)
- `go.sum`, `pnpm-lock.yaml` (let the tools manage them)
```

This simple file replaces every "here's how our project works" paste you will ever write for this repo.

## Do not write it by hand. Generate it, then edit it.
The part most posts skip: the agent can write the first draft itself. It has repo access. Use it.

Open your agent at the repo root and give it this once:
```prompt
Scan this repository and generate an AGENTS.md at the root.
Include: exact build/test/lint commands from the actual config
files (Makefile, package.json, CI workflows), the key modules
and what each owns, code patterns you can verify from the code
itself, and files that look generated or should never be hand
edited. Keep it under 60 lines. Only include facts you verified
in the repo. Flag anything you are unsure about with a TODO.
```
In Claude Code, `/init` does a version of this, and if an `AGENTS.md` already exists it folds the content in rather than starting cold.
Then edit. This step is not optional. Generated drafts state the obvious ("this is a TypeScript project") and miss the tribal knowledge (the integration tests need the Docker network up first). Delete the obvious, add the scars. The best additions to my AGENTS.md didn't come from sitting down to design it. They came from watching an agent make the same mistake twice.
If I find myself correcting the same thing in multiple sessions, that's usually a sign the instruction belongs in the file instead of the chat.
Monorepos: nearest file wins
Drop an AGENTS.md in each package, and the agent reads the one closest to the file it is editing. Root file holds the shared rules, each package file holds its own.
```markdown
repo/
├── AGENTS.md            <- shared: commands, boundaries
├── services/api/
│   └── AGENTS.md        <- Go patterns, store rules
└── web/
    └── AGENTS.md        <- React conventions
```
## What kills the file
FailureWhy it hurtsThe 500-line dumpModels follow a limited number of instructions reliably. Every filler line dilutes the ones that matter.Linter rules in prose"Use 2-space indent" is Prettier's job. Wasted budget.Stale commandsA wrong instruction is worse than none. The agent trusts the file over its own guess.One copy per toolThree near-identical files drift apart within a month. One AGENTS.md, thin tool files that import it.
Treat the file like code. It lives in the repo, it goes through review, and when the stack changes, it changes in the same PR.

## The habit that makes it compound
That's the habit that's worked best for me. Every time an agent repeats a mistake, I ask myself whether the fix belongs in the conversation or in AGENTS.md. If it's something I'd end up explaining again next week, it goes into the file. Over time, the file gets better, the prompts get shorter, and new sessions stop feeling like you're starting from scratch.
Repo with the example files from this post: https://github.com/Sonichigo/claude-skills/blob/main/Agents.md.example
