# AI Agent Coding Instructions (Short)

## 1) Understand the task first
- Restate the goal in 1–2 lines and confirm assumptions.
- Identify inputs/outputs, constraints, edge cases, and success criteria.
- If requirements are unclear, ask targeted questions before coding.

## 2) Keep changes minimal and safe
- Prefer the smallest change that solves the problem.
- Avoid unrelated refactors, formatting-only changes, or drive-by renames.
- Preserve backward compatibility unless explicitly allowed.

## 3) Follow project conventions
- Match existing patterns (architecture, folder structure, naming, style).
- Reuse existing utilities/libraries instead of adding new ones.
- Keep functions small, cohesive, and readable.

## 4) Code quality essentials
- Write clear names; avoid magic numbers/strings (use constants).
- Validate inputs; handle nulls/empty values; fail fast with helpful errors.
- Avoid duplication (DRY) but don’t over-abstract.
- Prefer deterministic, side-effect-minimizing code.

## 5) Security & privacy
- Never log secrets or sensitive data.
- Use parameterized queries; avoid injection risks.
- Apply least-privilege access patterns.
- Treat external input as untrusted; sanitize/validate.

## 6) Performance & reliability
- Avoid N+1 queries and unnecessary loops/allocations.
- Use timeouts/retries appropriately for network calls.
- Keep operations idempotent where possible.
- Add guards for large data (paging/batching).

## 7) Testing & verification
- Add/modify tests for new behavior and bug fixes.
- Cover: happy path, edge cases, and failure cases.
- Ensure tests are deterministic and fast.
- Run/verify locally (or describe the exact commands to run).

## 8) Documentation
- Update README / inline docs only where behavior changes.
- Add brief comments only for non-obvious logic (why, not what).

## 9) Commits & PR hygiene (if applicable)
- Make atomic commits with clear messages.
- Include summary, rationale, and testing evidence in the PR description.
- Link relevant issues and note breaking changes/migrations.

## 10) Output expectations
- Provide the final diff/patch or file list changed.
- Mention any assumptions, limitations, and follow-up suggestions.