# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/decisions/`** — read ADRs that touch the area you're about to work in. This repo names them `ADR-NNN-slug.md` (e.g. `ADR-001-integracao-bioculttermos.md`), not `NNNN-slug.md`.
- **`Arquitetura-BioCultural/docs/architecture-decisions/`** — the sibling repo holding ecosystem-wide ADRs that govern this one. Decisions here must not contradict those without superseding them explicitly.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single context, ADRs under `docs/decisions/`:

```
/
├── CONTEXT.md
├── docs/decisions/
│   ├── ADR-001-integracao-bioculttermos.md
│   └── ADR-002-extracao-por-ia.md
├── backend/src/
└── frontend/src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-005 DA6 (BioCultPapers entrega por arquivo) — but worth reopening because…_
