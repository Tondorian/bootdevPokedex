# AGENTS.md

Small TypeScript CLI Pokedex (boot.dev guided project): a readline REPL that queries PokeAPI v2 through a TTL cache. No framework, no lint/format config, no CI.

## Commands

- `nvm use` — Node is pinned to 22.15.0 via `.nvmrc`.
- `npm run build` — `tsc` typecheck + emit to `dist/`. This is the only typecheck; test files are not typechecked.
- `npm run dev` — build, then run the CLI. `npm start` runs the existing `dist/main.js` without rebuilding.
- `npm test` — full vitest run (script already passes `--run` and excludes `dist/`).
- Single file: `npx vitest --run tests/pokeapi.test.ts`
- Single test: `npx vitest --run -t "serves a repeated call from the cache"`

## Architecture

- Entrypoint is `src/main.ts` → `dist/main.js`. The `main` field in `package.json` (`dist/index.js`) is stale; trust the scripts.
- `src/state.ts` builds the `State`, owns the command registry (`getCommands()`), and dispatches input lines. `src/repl.ts` starts the readline loop.
- Every `command_*.ts` exports `(state: State, ...args: string[]) => Promise<void>` and prints to the console. Adding a command means a new file, registration in `getCommands()`, and a test in `tests/`.
- Success paths must call `state.interface.prompt()` themselves; the dispatcher only re-prompts on thrown errors and unknown commands.
- `src/pokeapi.ts` wraps `https://pokeapi.co/api/v2`; `src/pokecache.ts` is a generic in-memory cache with a time-based reap loop.

## Gotchas

- ESM + `moduleResolution: nodenext`: relative imports must end in `.js` in TS source (`./state.js`), including tests.
- Tests live in `tests/`, import `../src/*.js`, and run against `src` directly. Reuse `createState()` and `loggedLines()` from `tests/helpers.ts`; stub HTTP with `vi.stubGlobal('fetch', ...)` and clean up with `vi.unstubAllGlobals()`.
- `Cache` starts a `setInterval` reap loop in its constructor. Any test constructing one must call `stopReapLoop()` in `finally` (or use fake timers), otherwise vitest hangs.
- PokeAPI tests assert exact URLs and cache behavior: the location list URL keeps its trailing slash, the detail URL (`/location-area/{name}`) has none, and list cache keys are normalized (offset/limit/trailing slash). Preserve these when editing `pokeapi.ts`.
- `dist/` and `node_modules/` are gitignored and `dist/` can be stale; rebuild before running.
- The vitest suite is the spec for behavior; change implementation to satisfy tests rather than rewriting tests.
- `repl.log` is committed sample CLI output, not runtime state.
