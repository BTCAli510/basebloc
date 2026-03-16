# BASE bloc

> *"Culture without tech can't scale. Tech without culture can't onboard everyone."*

BASE bloc turns real-world community participation into verified onchain records.
Built on Base using EAS, Coinbase Paymaster, OnchainKit, and MiniKit —
the app gives organizers a gasless, wallet-native flow for onboarding first-time
users and issuing portable participation credentials.

Most crypto onboarding is abstract and disconnected from real trust networks.
BASE bloc starts with real community participation, then turns that activity
into simple onchain actions on Base. The goal is not just acquisition —
it's repeat participation and long-term empowerment.

Live app: [basebloc.app](https://basebloc.app)

---

## What it does

BASE bloc helps organizers and communities:

- Convert IRL participation into **verified onchain attestations**
- Guide first-time users through gasless, wallet-connected onboarding
- Issue **community credentials** via EAS — not NFTs, not collectibles
- Create repeatable participation loops tied to real cultural activity
- Power coordination at scale across events, cities, and communities

---

## How it works

1. User opens event page or scans QR at activation
2. Connects or creates a Coinbase Smart Wallet
3. Completes a gasless RSVP — zero ETH required
4. Receives an EAS attestation on Base mainnet
5. Participation record is queryable onchain and visible in-app

---

## Architecture

BASE bloc is built EAS-first. Attestations are the source of truth.

- **No NFTs.** Participation is tied to identity, not tradable.
- **Account Abstraction & Gasless RSVPs** via Coinbase Paymaster (ERC-4337) —
  zero ETH required to participate
- **Builder Code attribution** (`bc_7sdtts51`) embedded in every attestation
  via `dataSuffix`
- EAS attestations include `ticketTier`, `displayName`, and `recipient` fields —
  enabling future token/NFT distribution without architectural changes

**EAS Schema:** `0xe75ec39ab8bfdd680f02b11817ed9e10556850278264c0917d645c73866784d9`  
**Network:** Base Mainnet  
**EAS Explorer:** [base.easscan.org](https://base.easscan.org)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Language | TypeScript |
| Onchain UI | OnchainKit, MiniKit |
| Wallet | wagmi, viem, Coinbase Smart Wallet |
| Attestations | EAS SDK |
| Account Abstraction | Coinbase Paymaster (ERC-4337) |
| Deployment | Vercel |

---

## Current Status

MVP / pilot-ready. Live and deployed at [basebloc.app](https://basebloc.app).

**Completed:**
- Gasless RSVP flow via Coinbase Paymaster (live-tested, confirmed gasless)
- EAS schema #1179 registered on Base mainnet
- RSVP activation counter pulling live from EAS GraphQL API
- Builder Code `dataSuffix` embedded in every attestation
- MiniKit integration initiated (Phase 1 complete)
- OnchainKit identity card integrated into onboarding flow

**In progress:**
- MiniKit manifest signing + full Mini App UI (targeting Base App launch)
- Native Mini App: Discover · Saved · Records · Wallet
- Records screen pulling EAS attestations via GraphQL
- End-to-end mobile test with zero-ETH wallets

---

## Pilot Activation

**MY CITY OUR MUSIC** — a music, creative industries, and AI summit  
Produced by Hip Hop TV & Citiesabc · Powered onchain by BASE bloc  
📍 Henry J. Kaiser Center for the Arts, Oakland · May 23, 2026

---

## Community Collaborators

- **Beast Mode / Fam 1st**
- **Oakland XChange**
- **Hip Hop TV**
- **Citiesabc**

---

## Local Development
```bash
git clone https://github.com/BTCAli510/basebloc.git
cd basebloc
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_api_key
NEXT_PUBLIC_PAYMASTER_URL=your_coinbase_paymaster_url
```

Get your API key at [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com).  
Get your Paymaster URL from CDP under Gas Policies.

---

## Contributing

This project is in active development. If you're building in the Base ecosystem
and want to collaborate, open an issue or reach out directly.

---

## License

MIT

---

*Built on Base. Rooted in Oakland.*
