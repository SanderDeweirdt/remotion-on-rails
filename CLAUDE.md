# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a Remotion video-rendering service deployed on Railway ("Remotion on Rails"). It combines a Remotion project (React-based video compositions in `src/`) with an Express server that exposes an HTTP API to queue and render those compositions as MP4s via BullMQ/Redis, backed by Postgres (Prisma) for render status tracking.

There are two distinct runtime modes that share the same `src/` code:
- **Remotion Studio** (`npm run dev`) — interactive preview/editor for compositions defined in `src/Root.tsx`.
- **Render server** (`src/render-server.ts`) — a production Express server that serves the Remotion bundle and accepts render jobs over HTTP.

## Commands

```console
npm i                       # install dependencies
npm run dev                 # launch Remotion Studio (remotion studio)
npm run build                # bundle the Remotion project to ./build (remotion bundle)
npm run lint                  # eslint src && tsc (type-checks with noEmit, no separate test runner)
npx remotion render <entry-file> <CompositionId> out/video.mp4   # render a composition to a file from the CLI
npx remotion upgrade          # upgrade Remotion packages
npx prisma generate            # regenerate the Prisma client into src/generated/prisma (needed after schema changes, and after fresh install)
npx prisma migrate dev --name <name>   # create/apply a new migration locally
npx prisma migrate deploy      # apply pending migrations (used in Docker CMD at container start)
```

There is no dedicated test suite in this repo — `npm run lint` (ESLint + `tsc --noEmit`) is the only CI-equivalent check.

To run the render server locally, you need `PORT`, `REDIS_URL`, `DATABASE_URL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` set (e.g. via `.env`, loaded through `dotenv`), a built bundle at `./build` (`npm run build`), and a running Redis + Postgres instance. The server refuses to start if `./build` doesn't exist.

## Architecture

### Remotion compositions (`src/Root.tsx`, entry `src/index.ts`)
`src/index.ts` calls `registerRoot(RemotionRoot)`; `RemotionRoot` in `src/Root.tsx` registers all `<Composition>`s. Currently two:
- `HelloWorld` (`src/HelloWorld.tsx` + `src/HelloWorld/*`) — the Remotion starter template, prop-validated with a `zod` schema (`myCompSchema`) using `zColor` for color props. Composition components read animation values via `useCurrentFrame()` / `useVideoConfig()` and use `spring`/`interpolate` for motion, with `<Sequence>` to time child components.
- `GentVibesReel` (`src/GentVibesReel.tsx`) — a vertical (1080x1920) social-style video reel that renders an intro slide, one `EventSlide` per item in `events: GentEvent[]`, and an outro slide. Uses `calculateMetadata` in `Root.tsx` to compute `durationInFrames` dynamically from `props.events.length` (see `SLIDE_DURATION`/`INTRO`/`OUTRO` constants, which are duplicated between `Root.tsx` and `GentVibesReel.tsx` — keep them in sync when changing timing).

When adding a new composition: create the component, register it in `src/Root.tsx` with a unique `id`, and (if it takes external input) define a `zod` schema for its props like `HelloWorld` does.

### Render pipeline (queue-based, not synchronous)
1. `POST /render` (`src/render-server.ts`) validates `compositionId`/`inputProps`, generates a `renderId` (uuid) and output path under `/tmp/out`, enqueues a BullMQ job via `addToRenderMediaQueue` (`src/queues/workers/renderMedia.ts`), and immediately creates a `Renders` row in Postgres with status `QUEUED` (see `RenderStatus` in `src/types.ts`).
2. The BullMQ worker (`src/queues/workers/renderMedia.ts`) picks up the job, calls `@remotion/renderer`'s `selectComposition` + `renderMedia` against the locally-served bundle (`http://localhost:${PORT}`), and on completion updates the `Renders` row to `COMPLETED`.
3. `GET /download/:filename` streams the finished file back from `/tmp/out`.

Queues/workers are created through `src/queues/factory.ts` (`createQueue`/`createWorker`), which centralizes the Redis connection (`REDIS_URL`, `family=0` for Railway's dual-stack networking) and logs job success/failure. Add new queues/workers by following the pattern in `src/queues/workers/renderMedia.ts`.

### Bull Board admin dashboard
`src/queues/dashboard.ts` mounts a Bull Board UI at `/admin/queues` for inspecting queue/job state, gated by a hardcoded `passport-local` username/password check against `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars, with an EJS login view at `src/web/views/login.ejs`. Session secret is currently hardcoded (`"keyboard cat"`) — be aware of this if touching auth/session code.

### Persistence (Prisma)
`prisma/schema.prisma` defines a single `Renders` model (`uuid`, `status`, `output_location`, `created_at`) against Postgres (`DATABASE_URL`). The generated client is emitted to `src/generated/prisma` (gitignored — run `npx prisma generate` after cloning or changing the schema). `src/state.ts` exports a singleton `state.prisma` client with query/info/warn/error logging wired to `console.log`; import `state` rather than instantiating `PrismaClient` directly elsewhere.

### Deployment (Dockerfile)
Single-stage Docker build (Node 22 bookworm-slim) that installs Chromium's system deps for Remotion's headless rendering, installs npm deps, runs `remotion browser ensure`, installs `tsx` globally, and generates the Prisma client at build time. At container start it re-bundles fresh (`rm -rf build && npx remotion bundle`), applies pending migrations (`npx prisma migrate deploy`), and starts the render server directly with `tsx` (no separate compile step — TypeScript runs directly via `tsx`).

## Conventions

- TypeScript strict mode is on (`tsconfig.json`); `noUnusedLocals` is enabled, so remove dead locals/imports rather than leaving them.
- Formatting is enforced by Prettier (`.prettierrc`: 2-space indent, spaces not tabs, bracket spacing) and linting via `@remotion/eslint-config-flat` (`eslint.config.mjs`) — run `npm run lint` before considering a change done.
- Give components/props external validation via `zod` schemas (`z.object`, `zColor` for color props) when a composition accepts external `inputProps`, matching the `HelloWorld`/`myCompSchema` pattern.
