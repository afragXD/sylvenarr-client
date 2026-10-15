# Sylvenarr design (pen.dev)

Source of truth for visual tokens and screen frames: [`sylvenarr.pen`](./sylvenarr.pen).

## Sync with code

| pen.dev variable | Code |
|------------------|------|
| `color.brass` | Mantine `brand` / `#C4A35A` in `src/app/providers/theme.ts` |
| `color.oxide` | Mantine `accent` / `#C45C48` (ember) |
| `color.bg` / `surface` / `mist` / `ash` / `border` | `theme.other` → `--app-*` CSS vars (void / panel / ink / parchment) |
| `font.headings` | Cinzel |
| `font.body` | Source Sans 3 |
| `font.mono` | JetBrains Mono |

Dark-first CRPG (Neverwinter / BG3): default scheme dark; light is parchment/ink secondary.

## Landing frames

Expanded landing (account funnel): `Landing`, `Landing / Path`, `Landing / Roster`, `Landing / Account`, `Landing / Close`, plus `Sign up` / `Sign in` stubs.

## Workflow

1. Open `sylvenarr.pen` in pen.dev (Cursor extension or desktop).
2. Edit frames / variables.
3. Ask the agent to sync tokens back into `theme.ts` and pages.
4. Keep this folder next to `src/` so Design ↔ Code stays in one workspace.
