# Sylvenarr: Origins (веб-клиент)

Sylvenarr — текстовая онлайн соревновательная игра в жанре тёмного технофэнтези, вдохновлённая Disciples II, Heroes of Might and Magic III и Darkest Dungeon. Игроки набирают отряд из 4–6 героев с уникальными способностями и сражаются с оппонентом в пошаговом PvP.

Этот пакет — веб-клиент онлайн-арены (порт оригинального VK-бота).

## Происхождение и авторы

- **Веб-версия:** Wormgod — [github.com/afragXD](https://github.com/afragXD)
- **Оригинал:** PvP-бот для ВК [arenamsterbot](https://github.com/enlacroix/arenamsterbot) ([enlacroix](https://github.com/enlacroix))

## Оглавление

1. [Об игре](#об-игре)
2. [Стек](#стек)
3. [Development](#development)
4. [Production](#production)
5. [Linting & Formatting](#linting--formatting)
6. [Routing](#routing)

## Об игре

На сайте доступны:

- **Реестр героев** — характеристики и способности классов
- **Лобби** — создание и поиск матчей
- **Драфт** — набор отряда перед боем
- **Бой** — пошаговое сражение
- **Рейтинг** — таблица побед и поражений
- **Вход** — OAuth (Яндекс ID)

## Стек

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
