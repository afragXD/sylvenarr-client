# sylvenarr-client

Базовый шаблон клиента на TanStack Start + Mantine + FSD.

### Stack
- React 19, TypeScript, Vite, TanStack Start / Router
- UI — [Mantine](https://mantine.dev/)
- Lint/format — [Biome](https://biomejs.dev/)
- Архитектура — Feature-Sliced Design

## Development

Скопируйте `.env.example` в `.env` и при необходимости поправьте значения.

```bash
bun install
bun run generate-routes
bun run dev
```

Приложение: http://localhost:3000

## Production

```bash
bun run build
bun run start
```

## Linting & Formatting

```bash
bun run lint
bun run format
bun run check
```

## Routing

Маршруты — файлы в `src/routes`. После добавления маршрута:

```bash
bun run generate-routes
```
