# CLAUDE.md — AI Assistant Guide for Neagle-

> This file provides context and conventions for AI assistants (Claude, Copilot, etc.) working in this repository.

## Project Overview

**Repository:** `contatoneoxreal-eng/Neagle-`
**Status:** Newly initialized — this is the foundational commit.

Neagle- is a project under active development. This document will be updated as the codebase evolves. AI assistants should re-read this file at the start of every session.

## Repository Structure

```
Neagle-/
├── CLAUDE.md          # This file — AI assistant instructions
└── (project files)    # To be added as development progresses
```

> **Update this section** as new directories and files are added.

## Development Workflow

### Branching

- **`main`** — stable, production-ready code. Do not push directly.
- **Feature branches** — use descriptive names (e.g., `feature/add-auth`, `fix/login-bug`).
- AI-generated branches follow the pattern `claude/<description>-<id>`.

### Commits

- Write clear, concise commit messages describing *why* the change was made.
- Keep commits focused — one logical change per commit.
- Do not amend published commits.

### Pull Requests

- PRs should include a summary and test plan.
- Do not create PRs unless explicitly requested.

## Build & Run

> **TODO:** Document build commands, dependencies, and how to run the project once the tech stack is established.

## Testing

> **TODO:** Document test framework, how to run tests, and testing conventions once tests are added.

## Linting & Formatting

> **TODO:** Document linting/formatting tools and commands once configured.

## Key Conventions

1. **Read before editing** — Always read a file before modifying it.
2. **Minimal changes** — Only change what is requested. Do not refactor surrounding code or add unrequested features.
3. **No secrets** — Never commit `.env` files, API keys, credentials, or tokens.
4. **Security first** — Avoid introducing OWASP top 10 vulnerabilities (XSS, SQL injection, command injection, etc.).
5. **No speculative abstractions** — Do not create helpers or utilities for one-time operations.
6. **Preserve existing patterns** — Follow the style and conventions already present in the codebase.

## Dependencies & Tools

> **TODO:** List key dependencies, package manager, and required tooling once the project stack is defined.

## Architecture Notes

> **TODO:** Document high-level architecture, key modules, data flow, and design decisions as the project takes shape.

## CI/CD

> **TODO:** Document CI/CD pipelines, deployment process, and environment details once configured.

## Useful Commands

> **TODO:** Add commonly used commands (build, test, lint, deploy, etc.) as the project develops.

---

*This file should be kept up to date as the project evolves. When adding new frameworks, tools, or architectural patterns, update the relevant sections above.*
