# gethomeostat.com

Marketing site for **Homeostat**, a self-hosted, local-first personal health data vault made by PetFactory LLC.

Hand-written HTML and CSS in the "Shore" design. No framework, no analytics, no third-party requests; the only JavaScript is a few inline lines for the copy-address button. The fonts (Fraunces, Albert Sans, IBM Plex Mono; all SIL Open Font License) are served from `/fonts/`. App screenshots show synthetic sample data only.

## Layout

```
src/                 the site; copied verbatim to dist/
  index.html         landing page
  privacy/index.html /privacy
  styles.css         one stylesheet for both pages
  favicon.svg        logo mark (light/dark aware)
  og.png             Open Graph image, rendered from scripts/og.html
  fonts/             self-hosted woff2 subsets
  app-shots/         app screenshots on synthetic data (light/dark, desktop/mobile) + manifest.json
  img/               crops cut from app-shots/ by scripts/crops.mjs, and the sand/night backgrounds
  llms.txt, robots.txt, sitemap.xml, releases.xml
  CNAME              gethomeostat.com (GitHub Pages custom domain)
scripts/
  build.mjs          src/ -> dist/, then runs check.mjs on dist/
  check.mjs          fails if any local src/href/srcset/url() in the HTML or CSS is missing
  preview.mjs        static server on http://127.0.0.1:4321
  og.mjs             renders src/og.png (needs a local Chromium)
  crops.mjs          recuts src/img/ crops from src/app-shots/ (needs ImageMagick 7)
  shots.mjs          full-page screenshots at 375/768/1440, light and dark
screenshots/         latest screenshots
.github/workflows/   pages.yml: build and deploy to GitHub Pages on push to main
```

## Build and preview

```sh
npm install            # only playwright-core, used by og.mjs and shots.mjs; the build needs nothing
npm run build          # writes dist/ and checks every local reference
npm run preview        # serves dist/ on http://127.0.0.1:4321
npm run shots          # screenshots into screenshots/ (preview must be running)
npm run og             # re-render src/og.png after editing scripts/og.html
```

`og.mjs` and `shots.mjs` look for the Chromium that Playwright caches under `~/Library/Caches/ms-playwright`, then `/Applications/Google Chrome.app`. Set `CHROME_PATH` to use another binary.

## Deploy

The output is a plain `dist/` folder. Either host works.

### GitHub Pages

1. Push this repo to GitHub.
2. `.github/workflows/pages.yml` runs `npm run build` on every push to `main` (no install step: the build has no dependencies, and `og.png` is committed) and deploys `dist/` with `actions/upload-pages-artifact` and `actions/deploy-pages`.
3. Repository Settings → Pages → Source: GitHub Actions.
4. Settings → Pages → Custom domain: `gethomeostat.com`. The `CNAME` file in `dist/` keeps this set across deploys. Tick "Enforce HTTPS" once the certificate is issued.

### Cloudflare Pages

1. Workers & Pages → Create → Pages → Connect to Git, pick the repo.
2. Build command `npm run build`, output directory `dist`.
3. Custom domains → add `gethomeostat.com` and `www.gethomeostat.com`. If the DNS zone is already on Cloudflare the records are added for you.

## DNS for gethomeostat.com

**GitHub Pages**

| Type  | Name | Value |
|-------|------|-------|
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| AAAA  | @    | 2606:50c0:8000::153 |
| AAAA  | @    | 2606:50c0:8001::153 |
| AAAA  | @    | 2606:50c0:8002::153 |
| AAAA  | @    | 2606:50c0:8003::153 |
| CNAME | www  | `<github-user>.github.io` |

Verify the domain under GitHub Settings → Pages → Verified domains (a `_github-pages-challenge-<user>` TXT record) so nobody else can claim it.

**Cloudflare Pages**

| Type  | Name | Value |
|-------|------|-------|
| CNAME | @    | `<project>.pages.dev` (CNAME flattening at the apex is handled by Cloudflare) |
| CNAME | www  | `<project>.pages.dev` |

## Email: hello@gethomeostat.com on Fastmail

1. Fastmail → Settings → Domains → Add domain → `gethomeostat.com`.
2. Fastmail shows the records to add at the DNS host. At minimum:
   - MX `@` → `in1-smtp.messagingengine.com` (priority 10) and `in2-smtp.messagingengine.com` (priority 20)
   - CNAME `fm1._domainkey`, `fm2._domainkey`, `fm3._domainkey` → the `*.dkim.fmhosted.com` targets Fastmail lists (DKIM)
   - TXT `@` → `v=spf1 include:spf.messagingengine.com ?all` (SPF)
   - TXT `_dmarc` → `v=DMARC1; p=none; rua=mailto:hello@gethomeostat.com` to start; tighten to `p=quarantine` later
   - optional CNAME `mail` → `mail.fastmail.com` for a webmail shortcut
   Use the exact values from the Fastmail page; they are authoritative.
3. Back in Fastmail, wait for the domain status to show verified, then Settings → Users or Aliases → create `hello@gethomeostat.com` (an alias that delivers to the main mailbox is enough). Add it as a sending identity so replies go out from the same address.
4. Send a test to and from the address; check that the inbound test does not land in spam, and that DKIM shows "pass" in the headers of the outbound one.

Both DNS tables above coexist with the mail records; the web records are only `A`/`AAAA`/`CNAME` on `@` and `www`.

Note: an apex `CNAME` (Cloudflare table) is only valid where the DNS host flattens it. With a host that does not, use the GitHub-style `A`/`AAAA` records, otherwise the `MX` records on the apex will break.

## Content rules

Everything on the page must be true. No invented users, testimonials, logos, metrics, pricing or "trusted by". The source repository is private at the time of writing; the page says "source release coming" rather than linking to it.
