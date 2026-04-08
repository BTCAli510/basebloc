# BASEbloc.app Homepage Redesign — Claude Code Implementation Prompt (v4)

Paste this entire prompt into Claude Code in your terminal at the repo root.
The design spec file is: basebloc_v4.html

---

## Context

You are implementing a full homepage redesign for BASEbloc.app — a Next.js 14 app deployed on Vercel (repo: BTCAli510/basebloc). The design spec is a standalone HTML file (`basebloc_v4.html`) that contains all layout, copy, styles, and structure. Your job is to translate it into the actual Next.js source files.

The app uses:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (if present) — but this redesign uses custom CSS, so use CSS Modules or a global stylesheet as appropriate
- OnchainKit / wagmi for wallet connection

---

## Step 1 — Read the design spec first

Open and read `basebloc_v4.html` in full before touching any source files. That file is the single source of truth for all copy, styles, section structure, layout, color values, and font stacks.

---

## Step 2 — Identify the current homepage and key files

Find:
- Homepage: `app/page.tsx` or `app/(home)/page.tsx` or `src/app/page.tsx`
- Global stylesheet: `app/globals.css` or similar
- Root layout: `app/layout.tsx`

Read each of these before making any changes.

---

## Step 3 — Add fonts to the layout

In `app/layout.tsx`, add Inter Tight and DM Sans from Google Fonts:

```
Inter Tight: weights 300, 400, 500, 600, 700, 800, 900 (including italic 400)
DM Sans: weights 300, 400, 500
```

Use Next.js `next/font/google` if that pattern already exists in the project, otherwise add `<link>` preconnect and stylesheet tags in the `<head>`. Do not remove existing fonts.

---

## Step 4 — Add CSS custom properties and global styles

In the global stylesheet, add to `:root`:

```css
--base-blue: #0052FF;
--btc-orange: #F7931A;
--black: #0A0A0A;
--off-white: #F8F8F6;
--border: #E8E8E8;
--card-bg: #FAFAFA;
```

Set `body`:
```css
font-family: 'DM Sans', sans-serif;
background: #fff;
color: #0A0A0A;
-webkit-font-smoothing: antialiased;
```

Add `html { scroll-behavior: smooth; }`.

Do not remove existing global styles other pages depend on.

---

## Step 5 — Replace the homepage component

Replace the homepage file content with a new React component implementing all sections from `basebloc_v4.html` in this exact order:

1. **Nav** — sticky, white bg, logo left ("BASEbloc.app" with blue ".app"), links right (Services · Events · Records · Merchants), Connect Wallet CTA in Bitcoin orange. baseiq.app does NOT appear in the nav — footer only.

2. **Hero** — Two-column grid. Left: eyebrow ("BASE Oakland bloc · Coalition 001"), headline ("Community coordination infrastructure."), subhead, two CTAs ("Connect Wallet — Start Your Record" as primary orange button, "Explore Events →" as secondary outline button). Right: The Participation Loop card (white bg, 1.5px black border, black outline on each of the 4 loop step cards) + 4 stat chips below (also white bg, 1.5px black border).

3. **Three Lanes** — off-white section background. Three cards: Events / Services / Records. Records lane body copy reads: "Your events and daily commerce feed the exact same identity graph. Every recognized participation signal — from door scans to merchant transactions — builds a single permanent, portable record that powers Bloc Status and unlocks access. Every recognized action adds to the ledger." Events lane opens with door scan as the magic moment: "Scan the QR at the door — your attestation flips to Verified."

4. **Thesis / Why It Exists** — Pull quote, then bold launchpad thesis line: "Bitcoin became a vault for those already positioned. BASE Oakland bloc is building a launchpad for those who are not." Then body copy. Then contrast table (old model vs BASEbloc model).

5. **Merchant Section** — dark (#0A0A0A) background. Copy left, Beast Mode math card right.

6. **How It Works** — off-white bg. Four-step grid: 01 JOIN / 02 ACT / 03 OWN / 04 RETURN. Step 01 copy: "Walk up to the door. Scan the QR. Open your Coinbase Smart Wallet and your attestation flips to Verified — gasless, covered by Coinbase Paymaster. No app download. No crypto experience needed. Under 60 seconds from door to credential."

7. **Bloc Status / Records** — Five-tier table (Visitor → Participant → Contributor → OG → Bloc Builder) left, member record mockup right (dark bg card).

8. **MY CITY OUR MUSIC Activation** — dark bg. Details left, event card right. Date: May 23, 2026. Venue: Henry J. Kaiser Center for the Arts, Oakland. Jesse Pollak confirmed speaker.

9. **Coalition Cities** — off-white bg. Six cities: Oakland (001, active/live), Boston (002), Los Angeles (003), Houston (004), Atlanta (005), Chicago (006).

10. **Final CTA** — dark bg, centered. "Power to the People. Onchain." headline. Two buttons: "Connect Wallet — Start Your Record" and "Bring BASEbloc to Your City →".

11. **Footer** — dark bg. Logo left, slogan ("Power to the People. Onchain." with "Onchain." in Bitcoin orange), nav links right (baseiq.app, BASEoak.org, BASEbloc.org, Contact → lead@baseoak.org). Bottom credit: "Courtesy of Orangessance." linking to https://orangessance.com.

For wallet Connect buttons: wire to the existing wallet connection logic already in the codebase. Find and reuse what's there — do not introduce a new wallet connection pattern.

---

## Step 6 — Handle styles

Use whichever CSS pattern is dominant in the codebase:
- CSS Modules → `app/page.module.css`
- Global stylesheet → add classes there
- Tailwind only → translate spec CSS to utility classes, preserving all visual output exactly

The CSS from `basebloc_v4.html` is complete and precise. Do not approximate or simplify it.

Key style notes:
- The Participation Loop card and all 4 stat chips below it: white background, 1.5px solid #0A0A0A border. These were previously dark/black — they are now white with black outlines.
- All section backgrounds: white (#fff) by default, off-white (#F8F8F6) for alternating sections, dark (#0A0A0A) for Merchant, Activation, Final CTA, and Footer.
- Never use dark backgrounds on the loop card or stat chips.

---

## Step 7 — Assets

Nav logo: check `/public` for `BASEbloc-logo-lockup.svg`. If present, use it. If not, render text: `BASE<span style="color:#0052FF">bloc</span>.app`.

MY CITY OUR MUSIC event card image: CSS gradient placeholder — no image file needed.

---

## Step 8 — Responsive

Implement all responsive breakpoints from the spec:
- Below 900px: hero, lanes, thesis, merchant collapse to single column; nav links hidden
- Below 600px: steps grid collapses to single column

---

## Step 9 — Verify

1. `npm run build` — fix any TypeScript errors
2. `npm run dev` — visually compare against `basebloc_v4.html` section by section
3. Wallet connect button works
4. Anchor links (#services, #events, #records, #merchants) scroll correctly
5. No placeholder or TODO comments in final code

---

## Do NOT touch

- Any API routes (`/api/*`)
- EAS attestation logic
- `/og-gate` or any non-homepage pages
- Environment variables or config files
- Existing wallet provider / ConnectWallet setup

---

## Design constants

- Heading font: Inter Tight, 800 weight, letter-spacing: -1.5px to -2px
- Body font: DM Sans, 400 weight
- Base blue: `#0052FF`
- Bitcoin orange: `#F7931A` — nav CTA, accents, merchant eyebrow, "Onchain." in footer slogan
- White: `#ffffff` — universal page background
- Off-white sections: `#F8F8F6`
- Dark sections: `#0A0A0A`
- Slogan: "Power to the People. Onchain."
- Footer: "Courtesy of Orangessance." → https://orangessance.com
- Contact: lead@baseoak.org
- EAS Schema: #1354 on Base mainnet
- Schema address: 0x2b35516fd072b1da5045ec23a4279f4c25eb864384b222f3553f15e2d5a64553
- Builder Code: bc_7sdtts51
- Treasury: 0x2E057B00Cbeccf3FF6b410daa2CC1F99DFF94E2d
- Event ID: MCOM-2026-05-23

---

Start with Step 1. Read `basebloc_v4.html` completely. Then read existing source files. Then implement.
