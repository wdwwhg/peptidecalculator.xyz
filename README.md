# Peptide Calculator

Static Astro website for [peptidecalculator.xyz](https://peptidecalculator.xyz).

## Local development

```powershell
npm.cmd install
npm.cmd run dev
```

## Verification

```powershell
npm.cmd run verify
```

This runs Astro/TypeScript checks, Vitest, and the production build.

## Optional environment variables

Copy `.env.example` to `.env` and configure only the values that are available:

- `PUBLIC_CF_WEB_ANALYTICS_TOKEN`
- `PUBLIC_GOOGLE_SITE_VERIFICATION`
- `PUBLIC_FEEDBACK_URL`

Calculator input is processed entirely in the browser. The share-link feature places
numeric inputs in the URL.

## Cloudflare Pages

- Production branch: the branch selected in Cloudflare
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 22 or newer

Connect `peptidecalculator.xyz` as the custom domain, enable HTTPS, and add the optional
public environment variables in the Pages project settings. The generated `_headers`
and `_redirects` files are copied into `dist` by Astro.
