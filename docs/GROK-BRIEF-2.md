# Task: ship the architecture diagram as a real page

Repo: `/Users/dewa/Documents/Claude/projects/straits-x-hackathon/morrow-agent-commerce`

`main` is now `7a3d989`. It carries the merged rail and is what judges browse and
what Vercel deploys. Pull first. Read `CLAUDE.md`, `docs/SESSION-CONTEXT.md` and
`docs/CORRECTIONS.md` before touching anything.

Deadline Sunday 16 August, 11:00 SGT.

## Goal

The submission needs an architecture diagram **at a URL**. Right now
`docs/architecture/morrow-architecture.html` is not served by Next.js and GitHub
renders `.html` as source, so there is no URL to submit. Fix that, and make the
diagram good enough to win the AWS Best Architected prize, which is judged by an
AWS Solutions Architect and has no other surface to be judged on.

## Success criteria

1. `/architecture` is a real route, linked from the home page, and it renders on
   Vercel with no external requests of any kind.
2. **The whole system is understandable without clicking anything.** A judge who
   never interacts must still get it in thirty seconds. Interactivity reveals
   extra detail on top of a complete picture. It never hides the picture.
3. Clicking a node reveals its detail: what it does, what protocol it speaks,
   what is real today.
4. A download button gives the **SVG**, the same vector diagram, not a
   screenshot. PNG export only if everything else is finished.
5. Legible in light and dark, and usable on a phone.
6. `corepack pnpm test`, `typecheck`, `lint`, `build` all pass.
7. Work on a branch. Do not push to `main`. Say what the branch is called.

## Guardrails

- **Accuracy beats beauty.** The diagram must match what the code actually does.
  Label plainly what runs today versus what is a production mapping. Front-end
  is on Vercel. Settlement is proven on a local Anvil mainnet fork. AWS is
  **not** running. No real mainnet settlement has been sent. If the diagram
  implies otherwise it is worse than no diagram, because the judges include the
  CTO of StraitsX and Ava Labs' head of Hong Kong.
- Do not break the demo. `/api/demo`, the live-first fallback, and the mode
  labels all keep working exactly as they are.
- No external URLs, no CDN, no web fonts, no remote images. It must render
  offline and inside a strict CSP.
- No emojis in code. No em dashes in prose.
- If you cannot verify something, say so rather than claiming it works.

## Skills

Use `impeccable` for the page design and `artifact-diagramming` for the diagram
itself. Also `superpowers:verification-before-completion` before you report.

## Report back

Half a page. The branch name, the route, what a judge sees without clicking,
what clicking adds, and the command that proves the build passes.
