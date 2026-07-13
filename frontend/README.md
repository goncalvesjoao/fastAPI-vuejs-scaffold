# Your_Project_Name Frontend

This template should help get you started developing with Vue 3 in Vite.

## Tech Stack

- **Runtime:** Node.js 22.18+ or 24.12+
- **Build tool:** Vite
- **Framework:** Vue 3
- **Authentication UI/session:** Clerk Vue SDK
- **UI framework:** NuxtUI with TailwindCSS
- **Monitoring:** Optional Sentry Vue SDK

### Quality and Testing

- **Linting and formatting:** ESLint, Oxlint, prettier
- **Type checking:** vue-tsc
- **Tests:** Vitest

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Prerequisites

- **Node.js** 22.18+ or 24.12+ (includes `npm`)

## Setup

```sh
npm install
```

### Development

The projects uses [vite](https://vite.dev/) for development and build, (see [Vite Configuration Reference](https://vite.dev/config/)), [Vitest](https://vitest.dev/) for unit tests, and [NuxtUI](https://ui.nuxt.com/) for UI components.

```bash
npm run dev
```

### Type-Check, Compile and Minify for Production

```bash
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```bash
npm run test:unit
```

To debug a specific test, add `.only` to the test definition or add
`debugger` statements, then run:

```bash
npm run test:unit -- --inspect-brk --no-file-parallelism
```

### Sentry

Set `VITE_SENTRY_DSN` to enable browser error reporting. To upload source maps
during production builds, also set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and
`SENTRY_PROJECT`.

### Lint with [ESLint](https://eslint.org/)

```bash
npm run lint
```
