# Tech Briefing Source Strategy

## Primary Search Queries

Run these searches in parallel. Always append a time qualifier based on the current date (e.g., "March 2026", "this week").

### Core queries (always run)

1. `JavaScript TypeScript React new release update [date]`
2. `Vite Next.js Remix Astro TanStack release update [date]`
3. `CSS new feature browser support web standards [date]`
4. `web platform new API Chrome Firefox Safari [date]`
5. `frontend developer tools new release [date]`

### On the Horizon queries (always run — find what's coming)

6. `JavaScript TC39 proposal stage 4 [date]`
7. `React TypeScript RFC beta release candidate [date]`
8. `CSS working group new feature proposal [date]`
9. `web framework new announcement experimental [date]`

### Deeper focused queries (run when user wants more detail)

10. `npm Bun Deno package manager update [date]` (runtime/toolchain)
11. `Vercel Netlify Cloudflare Pages edge deployment [date]` (hosting platform)
12. `Tailwind CSS PostCSS styling update [date]` (CSS tooling)

## Key Players to Track

### JS/TS Core
- TypeScript — devblogs.microsoft.com/typescript
- Node.js — nodejs.org/en/blog
- Bun — bun.sh/blog
- Deno — deno.com/blog
- TC39 proposals — github.com/tc39/proposals

### Frontend Frameworks
- React — react.dev/blog
- Next.js — nextjs.org/blog
- Remix / React Router — remix.run/blog
- Astro — astro.build/blog
- Svelte / SvelteKit — svelte.dev/blog
- Solid.js — solidjs.com

### Tooling & Build
- Vite — vite.dev/blog
- Rolldown — rolldown.rs
- TanStack — tanstack.com
- Tailwind CSS — tailwindcss.com/blog
- Biome (ESLint/Prettier replacement) — biomejs.dev/blog

### Web Standards
- CSS Working Group — webkit.org/blog, chromestatus.com, caniuse.com
- W3C / WHATWG — w3.org, html.spec.whatwg.org
- MDN blog — developer.mozilla.org/en-US/blog

### Hosting & Edge
- Vercel — vercel.com/blog
- Netlify — netlify.com/blog
- Cloudflare — blog.cloudflare.com

### Community Signal
- This Week in React (thisweekinreact.com)
- Bytes (bytes.dev)
- Frontend Focus (frontendfoc.us)
- CSS-Tricks (css-tricks.com)
- Smashing Magazine (smashingmagazine.com)

## Evaluation Criteria

- **Relevance**: Must be web/frontend-relevant. Skip general-purpose language news unless it directly ships into the web ecosystem.
- **Recency**: Focus on last 2-4 weeks unless user specifies otherwise
- **Upcoming weight**: Give equal weight to "what's coming" — betas, RCs, proposals at stage 3/4, newly announced tools with real momentum
- **Verification**: Cross-reference version numbers and release dates against official sources
- **AI boundary**: AI-specific tools belong in ai-briefing, not here. Exception: AI-powered DX tools (e.g., new ESLint AI rule, Biome AI mode) are fair game.
