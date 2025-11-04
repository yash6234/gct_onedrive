This is a Next.js app with an email OTP sign‑in flow wired to your external NestJS authentication service at `/Users/yashpatel/authentication`.

## Getting Started

Setup and run:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

1) Copy `.env.local.example` to `.env.local` and adjust `NEXT_PUBLIC_AUTH_API` if needed.

2) Start the Next app first so the Nest server falls back to 3001.

```bash
npm run dev
```

3) In another terminal, start the NestJS service in `/Users/yashpatel/authentication`:

```bash
cd /Users/yashpatel/authentication
npm run start:dev
```

Open http://localhost:3000 to see the app.

Auth flow:

- Sign In → `/sign-in`
- Get a code → `/get-code?email=...`
- Enter your code → `/verify?email=...`
- We’re updating our terms → `/terms-update`
- Home → `/`

Key folders:

- `src/app/(auth)` – auth pages
- `src/app/(legal)` – terms update page
- `src/app/api` – server-side proxy to Nest endpoints
- `src/components` – shared UI and forms
- `src/lib` – helpers (`api`, `session`)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
