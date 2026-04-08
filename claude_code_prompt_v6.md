# BASEbloc.app Homepage Redesign — Claude Code Implementation Prompt (v6)

Paste this entire prompt into Claude Code at the repo root.
The design spec file is: basebloc_v6.html
Drop basebloc_v6.html into the repo root before running this.

---

## Context

You are implementing a full homepage redesign for BASEbloc.app — a Next.js 14 app on Vercel (repo: BTCAli510/basebloc). The design spec `basebloc_v6.html` is the single source of truth for all copy, layout, styles, and structure. Translate it into the actual Next.js source files.

Stack: Next.js 14 App Router · TypeScript · OnchainKit / wagmi for wallet connection.

---

## Step 1 — Read the spec first

Open and read `basebloc_v6.html` completely before touching any source files.

---

## Step 2 — Find existing files

Locate and read before changing anything:
- Homepage: `app/page.tsx` or `app/(home)/page.tsx` or `src/app/page.tsx`
- Global stylesheet: `app/globals.css` or similar
- Root layout: `app/layout.tsx`

---

## Step 3 — Fonts

Add to `app/layout.tsx` using `next/font/google` if that pattern exists, otherwise via `<link>` tags:
- **Inter Tight**: weights 300 400 500 600 700 800 900, italic 400
- **DM Sans**: weights 300 400 500

Do not remove existing fonts.

---

## Step 4 — CSS variables

Add to global stylesheet `:root`:

```css
--base-blue: #0052FF;
--btc-orange: #F7931A;
--black: #0A0A0A;
--off-white: #F8F8F6;
--border: #E8E8E8;
--card-bg: #FAFAFA;
```

Body: `font-family: 'DM Sans', sans-serif; background: #fff; color: #0A0A0A; -webkit-font-smoothing: antialiased;`
Html: `scroll-behavior: smooth;`

---

## Step 5 — Homepage sections (in order)

Implement all sections from `basebloc_v6.html`:

### 1. Nav
Sticky, white bg with blur. Logo left: `BASEbloc.app` with `.app` in `#0052FF`. Links: Services · Events · Records · Merchants. CTA: `Connect Wallet` in Bitcoin orange `#F7931A`. **baseiq.app does NOT appear in the nav** — footer only.

### 2. Hero
Two-column grid.
- Left: eyebrow, headline ("Community coordination infrastructure."), subhead, two CTAs — `Connect Wallet — Start Your Record` (primary, orange) and `Explore Events →` (secondary, outline).
- Right: Participation Loop card + 4 stat chips. **Both the loop card and all 4 stat chips have white background with 1.5px solid #0A0A0A border.** Not dark. Loop steps: 01 Join / 02 Act / 03 Own / 04 Return. Stat chips: <60s / EAS / $0 / 6.

### 3. Three Lanes (off-white bg)
Events / Services / Records.
- Events lane: opens with door scan as magic moment — "Scan the QR at the door — your attestation flips to Verified."
- Services lane: "Eligible community businesses on Base rails. Zero BASEbloc platform fees. Fast USDC settlement. Every transaction with a coalition merchant can add to your verified community record — automatically."
- Records lane: "Your events and daily commerce feed the exact same identity graph. Every recognized participation signal — from door scans to merchant transactions — builds a single permanent, portable record that powers Bloc Status and unlocks access. Every recognized action adds to the ledger."

### 4. Thesis / Why It Exists
Pull quote → bold Vault/Launchpad line: "Bitcoin became a vault for those already positioned. BASE Oakland bloc is building a launchpad for those who are not." → body copy → contrast table.

### 5. Merchant Section (dark bg #0A0A0A)
- Headline: "Zero BASEbloc platform fees for eligible community businesses."
- Body: "Local businesses should not lose 3.0–3.5% of every sale to outside platforms when that value could stay in the neighborhood. BASEbloc.app helps eligible community merchants accept USDC on Base with fast settlement, lower costs, and a path to stronger customer return loops. No crypto experience required."
- Three benefits:
  1. Keep more of what you earn — "$900–$1,050/month that would otherwise leave the neighborhood."
  2. Turn transactions into return behavior — "verified community record"
  3. Belonging that compounds — "Customers and event attendees become recognized community members. Revenue, retention, and belonging start reinforcing each other."
- Math card rows:
  - Monthly card revenue: $30,000
  - Typical processor fees (3.0–3.5%): −$900 to −$1,050
  - BASEbloc platform fee (eligible merchants): $0
  - Potential monthly recovery: +$900 to +$1,050
  - Potential annual recovery: +$10,800 to +$12,600
  - Pilot status line: "Active pilot: TBA · Oakland, CA · USDC settlement via Base"

### 6. How It Works (off-white bg)
Four steps: 01 JOIN / 02 ACT / 03 OWN / 04 RETURN.
Step 01: "Walk up to the door. Scan the QR. Open your Coinbase Smart Wallet and your attestation flips to Verified — gasless, covered by Coinbase Paymaster. No app download. No crypto experience needed. Under 60 seconds from door to credential."

### 7. Bloc Status / Records
Five-tier table left (Visitor → Participant → Contributor → OG → Bloc Builder). Member record mockup right (dark card). Attestation rows in mockup:
- MY CITY OUR MUSIC · May 23, 2026 → Verified ✓
- Coalition 001 Pre-summit Masterclass → Verified ✓
- Oakland Barbershop · USDC tx → EAS #1354
- Base is for everyone · X community → Online signal

### 8. MY CITY OUR MUSIC Activation (dark bg)
Details:
- Date: May 23, 2026
- Venue: Henry J. Kaiser Center for the Arts, Oakland
- Produced: HipHopTV × CitiesABC
- Speakers: **TBA** (not Jesse Pollak — do not name any speaker)
- Credential: EAS Schema #1354 · gasless · every attendee

Event card tags: EAS Credential · VIP Available (no "Free RSVP" tag).
RSVP button in activation section: **"RSVP"** only — no "Free Entry" language.
Event card CTA: "RSVP — Secure Your Spot".

### 9. Coalition Cities (off-white bg)
Six cities: Oakland 001 (active · BASEoak.org) · Boston 002 · Los Angeles 003 · Houston 004 · Atlanta 005 · Chicago 006.
Closing line: "BASE Oakland bloc gets bigger with every coalition, every city, every activation."

### 10. Final CTA (dark bg, centered)
Headline: "Power to the People. Onchain." — "Onchain." in #F7931A.
Buttons: "Connect Wallet — Start Your Record" (primary) + "Bring BASEbloc to Your City →" (orange outline).

### 11. Footer (dark bg)
Logo · slogan ("Power to the People. Onchain." with "Onchain." in orange) · links: baseiq.app · BASEoak.org · BASEbloc.org · lead@baseoak.org.
Bottom: "Courtesy of Orangessance." linking to https://orangessance.com.

---

## Step 6 — Wallet connection

Wire Connect Wallet buttons to the existing wallet connection logic already in the codebase. Find and reuse what's there. Do not introduce a new pattern.

---

## Step 7 — Styles

Use whichever CSS pattern is dominant in the project (CSS Modules, global stylesheet, or Tailwind). Implement all styles from `basebloc_v6.html` exactly — do not approximate or simplify. Full responsive breakpoints at 900px and 600px are in the spec — implement all of them.

---

## Step 8 — Assets

Nav logo: check `/public` for `BASEbloc-logo-lockup.svg`. If present use it. If not, render text logo.
Event card image: CSS gradient placeholder — no image file needed.

---

## Step 9 — Verify

1. `npm run build` — fix all TypeScript errors
2. `npm run dev` — compare visually against `basebloc_v6.html` section by section
3. Wallet connect works
4. Anchor links (#services #events #records #merchants) scroll correctly
5. No TODO or placeholder comments in final code

---

## Do NOT touch

- `/api/*` routes
- EAS attestation logic
- `/og-gate` or any non-homepage pages
- `.env` or config files
- Existing wallet provider / ConnectWallet setup

---

## Design constants

- Heading font: Inter Tight · 800 weight · letter-spacing -1.5px to -2px
- Body font: DM Sans · 400 weight
- Base blue: `#0052FF`
- Bitcoin orange: `#F7931A`
- White: `#ffffff` (universal page bg)
- Off-white sections: `#F8F8F6`
- Dark sections: `#0A0A0A`
- Loop card + stat chips: white bg, 1.5px solid #0A0A0A border
- Slogan: "Power to the People. Onchain."
- Footer: "Courtesy of Orangessance." → https://orangessance.com
- Contact: lead@baseoak.org
- EAS Schema #1354 · address: 0x2b35516fd072b1da5045ec23a4279f4c25eb864384b222f3553f15e2d5a64553
- Builder Code: bc_7sdtts51
- Event ID: MCOM-2026-05-23
- Treasury: 0x2E057B00Cbeccf3FF6b410daa2CC1F99DFF94E2d

---

Start with Step 1. Read the full spec. Then read existing source files. Then implement.
