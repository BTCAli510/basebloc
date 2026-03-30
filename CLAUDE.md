# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Run production server
```

No test framework is configured — the project uses manual testing.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=   # CDP API key from portal.cdp.coinbase.com
NEXT_PUBLIC_PAYMASTER_URL=        # Coinbase Paymaster endpoint from CDP
```

Optional (orders API):
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Architecture

**BASE bloc** is a Next.js 16 (App Router) web3 event RSVP platform on the Base network. It converts IRL participation into gasless onchain attestations via EAS (Ethereum Attestation Service). The core value prop: attendees can RSVP and receive verifiable participation records without holding any ETH (Coinbase Paymaster sponsors gas).

### Key Data Flow

1. **RSVP:** User connects wallet via OnchainKit → server checks VIP tier (`/api/vip-check`) or magic link code (`/api/vip-magic`) → OnchainKit `<Transaction>` + `<TransactionSponsor>` sends gasless attest call to EAS contract on Base mainnet → attestation recorded onchain
2. **Records:** `/records` page queries EAS GraphQL at `https://base.easscan.org/graphql` directly — attestations are the source of truth, not a database
3. **Staff tool:** `/og-gate` is password-protected (`oakland2026`) — staff manually issue attestations at the event to walk-up attendees

### Smart Contract Constants

- **Active EAS Schema UID:** `0xb81941b702c7aacc8164f6fed9a3ff97bbf179131c9e4bedb040bd7d787da4f7`
- **Retired Schema UID (read-only):** `0xe75ec39ab8bfdd680f02b11817ed9e10556850278264c0917d645c73866784d9`
- **EAS Contract (Base mainnet):** `0x4200000000000000000000000000000000000021`
- **USDC Contract (Base mainnet):** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Attestation fields:** `eventName`, `eventDate`, `venue`, `ticketTier`, `displayName`, `isVip`, `dataSuffix`

### Pages & API Routes

| Route | Purpose |
|-------|---------|
| `/` | Home/landing with event info |
| `/tickets` | Main RSVP flow |
| `/records` | User's onchain participation history |
| `/og-gate` | Staff-only attestation issuance tool |
| `/mini` | Base Mini App UI (MiniKit) |
| `/events/my-city-our-music` | Event detail page |
| `GET /api/rsvp-count` | Live attendee count from EAS GraphQL |
| `GET/POST /api/orders` | Event info + order creation (Supabase) |
| `POST /api/vip-check` | VIP allowlist validation (hardcoded array) |
| `POST /api/vip-magic` | Magic link code validation |

### Tech Stack

- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS 4 + inline styles; fonts: Syne (display), DM Sans (body)
- **Web3:** OnchainKit (wallet/transaction UI), wagmi, viem, EAS SDK
- **Gasless:** Coinbase Paymaster via OnchainKit `<TransactionSponsor>`
- **Backend:** Next.js API routes + Supabase (event/order metadata)
- **Mobile:** MiniKit (Base Mini App integration)
- **Farcaster:** Frame config at `app/.well-known/farcaster.json`

### VIP Magic Links

Magic link codes (e.g., `BEASTMODE-VIP`) are validated server-side but stored in-memory — they reset on each deployment. VIP allowlist is a hardcoded array in `app/api/vip-check/route.ts`.
