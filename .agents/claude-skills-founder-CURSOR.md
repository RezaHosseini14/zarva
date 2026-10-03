# claude-skills-founder in Cursor (ZARVA)

Upstream pack (full repo): [`.agents/claude-skills-founder/`](./claude-skills-founder/) — [emotixco/claude-skills-founder](https://github.com/emotixco/claude-skills-founder).

Pinned commit: see [`.agents/claude-skills-founder.UPSTREAM_COMMIT`](./claude-skills-founder.UPSTREAM_COMMIT).

## After clone or submodule update

From repo root:

```powershell
git submodule update --init .agents/claude-skills-founder
powershell -File scripts/sync-founder-skills.ps1
```

The script applies the only Cursor-specific edit (conventions path in 13 `SKILL.md` files) and recreates directory junctions under `.agents/skills/`.

## Skill junctions (Cursor discovery)

Each name below is a junction to the same folder inside the submodule:

- validate-idea, product-brief, competitor-matrix, persona-gen, user-interviews
- mvp-scope, pricing-strategy, go-to-market, landing-page, email-sequence
- pitch-deck, fundraise-prep, metrics-dashboard

Invoke in chat: follow the skill by name (e.g. **validate-idea**) and pass your context in the message (replaces Claude Code `$ARGUMENTS`).

## Runtime outputs

Skills write to `founder/` at the ZARVA repo root (`founder/facts.md`, `founder/validate-idea.md`, …). See upstream [README](./claude-skills-founder/README.md).

## Web research

Skills such as `competitor-matrix` and `go-to-market` expect live web search; use WebSearch/WebFetch when running them in Cursor.

## Claude Code

Plugin install (`/plugin install founder@emotix`) is documented in the upstream README; ZARVA uses the vendored submodule + junctions instead.
