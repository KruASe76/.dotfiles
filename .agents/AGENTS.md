# Global settings

> **IMPORTANT:**
> - **use context7 for docs/code generation**

## Cavekit

Use Cavekit planning when task warrants plan.

Root `SPEC.md`: durable implementation state + source of truth for active Cavekit task. No second competing plan or duplicate tracker.

Right-size process. No planning ceremony for trivial changes.

When a planning/research phase has enough durable `SPEC.md` state: start implementation clean context; do not retain big obsolete exploration history.

## General instructions
- Plan: ask user if unsure. No assumptions.
- Follow code style/logic. Match empty lines. Standard patterns.
- Follow project structure.
- Use newest language/library features.
- Comments: only if asked or non-obvious. No chitchat. Follow existing frequency.
- No new deps unless needed. State why.
- Use `util`/`utils` packages if relevant.
- Keep logic simple.
- Use "guard clauses". Avoid nesting.
- Check `README.md` for project commands.

Established repository architecture and local precedent override Ponytail minimalism. Use Ponytail to choose the smallest solution within repo constraints, not to replace established abstractions with theoretically simpler alternatives.

## Per-language instructions

### Python

Repo conventions override defaults.

No stronger precedent:
- simple explicit logic over needless abstractions;
- guard clauses over deep nesting;
- internal-only symbols private where appropriate;
- reuse `util` / `utils`; no duplicate;
- preserve type info; no unjustified `Any`;
- no comments restating code.

#### Semantic code tools

Serena, mcpls, and DAP are optional accelerators. Tool failure must not block the task.

- Serena: primary semantic navigation + symbol-aware edits.
- mcpls: use when LSP-specific data helps: inferred types, definitions, call hierarchy, diagnostics, code actions. Do not duplicate successful Serena work without reason.
- DAP: use only when runtime state/control flow matters and static inspection + tests are insufficient. Prefer current project Python environment (`uv` / `.venv`).
  - Ensure `.dap-mcp.json` file exists in repo root. If absent, stop and report to user.
  - Ensure `debugpy` installed in project venv: `uv pip install debugpy` if project uses `uv`, else `pip install debugpy` with `.venv` active. Avoid adding `debugpy` as project dependency, local use only.
- Failure fallback: remaining semantic tools → repo search/read/edit → type checker/compiler → tests/logs.
- Never require the Serena JetBrains plugin. Its absence is expected.


### Kotlin
- Collections: use `.forEach`, `.forEachIndexed`, etc. No for-loops (except in-place ranges: `..`, `..<`, etc.).
- Use `when` for >2 branches. `if` for simple checks/guards.
- Use scope functions/idioms.
- Use `..<` not `until`.
- Explicit type if not obvious. Prefer `val list: List<T> = listOf()` over `val list = listOf<T>()`.


### Dockerfiles
- `COPY . .` disallowed. No `.dockerignore`.
- Order: dependencies first, source last. Use cache.

### Docker compose
- Logical property order. Match existing files.


## Agent documentation

Improve agent-friendliness as work reveals stable repo knowledge.

Record only durable high-confidence knowledge learned during actual task. Do not scan unrelated repo only to populate docs.

Use artifact:
- repo-wide stable facts + invariants → `AGENTS.md` / `AGENTS.local.md`;
- path- or component-specific conventions → `.agents/rules/`;
- reusable multi-step procedures → `.agents/skills/`;
- active implementation state → `SPEC.md`.

Do not modify tracked team agent docs as background side effect unless explicit. Prefer local untracked artifacts for provisional knowledge.

Promote repeated discoveries into rules or skills only genuinely reusable. Avoid facts obvious nearby or cheap to rediscover.

## Communication and reasoning

Routine work concise. Surface decisions, uncertainty, trade-offs, failures, deviations from repo precedent.

Do not narrate every obvious tool action.

Finish: state:
- changed;
- verified;
- unresolved or intentionally skipped.

