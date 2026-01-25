# ourcommuniyinunity

Website for Our Community In Unity NPC. Built with Next.js and Tailwind CSS.

## Local development

```bash
pnpm install
pnpm dev
```

## Cloudflare deployment (OpenNext)

```bash
pnpm preview   # local Cloudflare preview
pnpm deploy    # deploy via Wrangler
```

## StudyBuddy AI (OpenAI)

Set `OPENAI_API_KEY` to enable live AI responses on `/studybuddy`. Optional:
`OPENAI_MODEL` (defaults to `gpt-4o-mini`).

Local dev (Next.js):

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

Cloudflare (Wrangler secrets):

```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put OPENAI_MODEL
```

## Structure
- `app/` Next.js App Router pages
- `components/` UI and page components
- `public/` static assets
