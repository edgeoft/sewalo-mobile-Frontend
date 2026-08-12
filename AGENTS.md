# Sewalo Mobile Frontend — Agent Guidelines (pointer)

**You MUST read `.agents/AGENTS.md` before writing or reviewing any code in this repo.** It contains the strict, enforceable coding rules (TypeScript/enums, state management, useState/useEffect/useRef, forms & validation, components, design, file structure, design patterns, security, performance, and the anti-pattern appendix).

The bundled skills live in `.agents/skills/` and are installed to `~/.agents/skills/`. Load them with the `skill` tool per `.agents/AGENTS.md` §0.

Quick-start (non-negotiable):
1. NEVER rewrite a file wholesale — smallest diff that satisfies the task.
2. NEVER use `any`, `as` casts (unless required at a boundary), or RHF internals (`control._formValues`).
3. Enums/constants/query keys/types live in exactly ONE place — import, never redeclare.
4. Server state → TanStack Query; cross-screen UI → zustand; forms → react-hook-form; ephemeral → local `useState`.
5. `useEffect` is for syncing with the outside world — never to derive state from props.
6. No per-frame `setState`, no `Math.random()` in render, no WebView `html` rebuilt per render.
7. `npx tsc --noEmit` and `npx expo lint` MUST pass before a task is done.

Full details: `.agents/AGENTS.md`
