# Contributing to BASE bloc

Thank you for your interest in contributing to BASE bloc! This document provides guidelines and instructions for contributing to our onchain event onboarding platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [EAS Integration](#eas-integration)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project is built on the principle that **culture without tech can't scale, and tech without culture can't onboard everyone**. We expect all contributors to:

- Be respectful and inclusive in all interactions
- Focus on real-world community impact
- Prioritize accessibility for first-time crypto users
- Respect privacy and data sovereignty
- Help lower barriers to onchain participation

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0 (we use Next.js 16)
- **npm** >= 10.0.0
- **Git**
- A **Coinbase Developer Platform (CDP)** account for API keys
- Basic understanding of:
  - React and Next.js App Router
  - Ethereum Attestation Service (EAS)
  - Base blockchain
  - Account Abstraction (ERC-4337)

### Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/basebloc.git
   cd basebloc
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Development Setup

### Required Environment Variables

Create a `.env.local` file with:

```env
# Required: Coinbase Developer Platform API key
# Get yours at: https://portal.cdp.coinbase.com
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_api_key_here

# Required: Coinbase Paymaster endpoint for gasless transactions
# Available in CDP portal under Paymaster
NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/...

# Optional: Supabase for orders API (if working on ticketing features)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
```

### Getting CDP API Keys

1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com)
2. Create a new project
3. Generate an API key for OnchainKit
4. Set up a Paymaster for gasless transactions on Base mainnet
5. Copy both values to your `.env.local`

## Project Structure

```
basebloc/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── vip-check/     # VIP tier verification
│   │   └── vip-magic/     # Magic link validation
│   ├── event/             # Event pages
│   ├── og-gate/           # Staff attestation tool
│   ├── records/           # User participation records
│   └── page.tsx           # Landing page
├── public/                # Static assets
├── CLAUDE.md              # Claude Code context
├── minikit.config.ts      # MiniKit configuration
└── next.config.ts         # Next.js configuration
```

### Key Technologies

- **Next.js 16** with App Router
- **OnchainKit** for wallet connection and transactions
- **MiniKit** for mobile-optimized experiences
- **EAS SDK** for attestations
- **Wagmi/Viem** for blockchain interactions
- **Tailwind CSS v4** for styling
- **Supabase** (optional) for order management

## How to Contribute

### Types of Contributions

We welcome contributions in these areas:

#### 1. Event Features
- New RSVP flow variations
- Check-in mechanisms
- Attendee management tools
- Event analytics dashboards

#### 2. Onchain Integrations
- Additional EAS schema types
- New attestation use cases
- Integration with other Base protocols
- Cross-chain credential portability

#### 3. UX Improvements
- First-time user onboarding flows
- Mobile experience enhancements
- Accessibility improvements
- Localization (i18n)

#### 4. Documentation
- Code documentation
- API documentation
- User guides for organizers
- Tutorial content

#### 5. Bug Fixes
- Gasless transaction issues
- Wallet connection problems
- EAS query optimizations
- UI/UX bugs

### Finding Issues

Check our [GitHub Issues](https://github.com/BTCAli510/basebloc/issues) for:
- `good first issue` - beginner-friendly tasks
- `help wanted` - community requested features
- `bug` - confirmed bugs needing fixes
- `enhancement` - feature requests

## Coding Standards

### TypeScript

- Use strict TypeScript (`strict: true` in tsconfig.json)
- Define interfaces for all props and API responses
- Avoid `any` types - use `unknown` with type guards when necessary

```typescript
// Good
interface AttestationData {
  recipient: string;
  ticketTier: string;
  displayName: string;
}

// Avoid
const data: any = fetchAttestation();
```

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Use Next.js server components where possible
- Client components only when necessary (interactivity, wallet connection)

```typescript
// Server component (default)
export default async function EventPage() {
  const events = await fetchEvents();
  return <EventList events={events} />;
}

// Client component (when needed)
'use client';
export function WalletButton() {
  const { connect } = useConnect();
  return <button onClick={connect}>Connect</button>;
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing using Tailwind's scale
- Use CSS variables for theme colors

### EAS (Ethereum Attestation Service)

When working with attestations:

1. **Always use the correct schema UID**:
   - Active: `0xb81941b702c7aacc8164f6fed9a3ff97bbf179131c9e4bedb040bd7d787da4f7`
   - Read-only legacy: `0xe75ec39ab8bfdd680f02b11817ed9e10556850278264c0917d645c73866784d9`

2. **Include builder code in dataSuffix**:
   ```typescript
   dataSuffix: '0x62635f3773647474733531' // bc_7sdtts51
   ```

3. **Validate attestation data** before submission:
   ```typescript
   const isValid = await eas.verifyAttestation(attestation);
   ```

## Testing

### Current Testing Approach

BASE bloc currently uses **manual testing** for onchain interactions. This is intentional because:
- EAS attestations cost gas (even with paymaster, testing on mainnet has real costs)
- Wallet interactions require real browser environments
- Smart contract state changes are persistent

### Manual Testing Checklist

Before submitting changes, test:

- [ ] **Local dev server starts** without errors (`npm run dev`)
- [ ] **Build succeeds** (`npm run build`)
- [ ] **No lint errors** (`npm run lint`)
- [ ] **Wallet connection** works with Coinbase Smart Wallet
- [ ] **Gasless RSVP** completes successfully on Base mainnet
- [ ] **Attestation appears** on EAS Explorer within 30 seconds
- [ ] **Records page** displays attestations correctly
- [ ] **Mobile experience** is functional (test on actual device)

### Testing on Base Mainnet

Since we use mainnet for attestations:

1. **Use small test events** for development
2. **Create a test event** with minimal attendees
3. **Verify attestations** on [Base EAS Explorer](https://base.easscan.org)
4. **Check paymaster sponsorship** in CDP dashboard

### EAS Explorer URLs

- **Mainnet**: https://base.easscan.org
- **Query attestations**: Use the GraphQL endpoint at `https://base.easscan.org/graphql`

## EAS Integration

### Understanding the Attestation Flow

1. **User connects wallet** (OnchainKit handles this)
2. **VIP check** (`/api/vip-check` or `/api/vip-magic`)
3. **Transaction preparation** (OnchainKit `<Transaction>` component)
4. **Gasless execution** (Paymaster sponsors the gas)
5. **Attestation recorded** on Base mainnet
6. **Confirmation** shown to user

### Adding New Attestation Types

To add a new type of attestation:

1. **Create a new EAS schema** on [Base EAS](https://base.easscan.org)
2. **Document the schema UID** in CLAUDE.md and code comments
3. **Update the attestation flow** in the relevant component
4. **Add GraphQL queries** for reading the new attestation type
5. **Test on mainnet** with a small group

### Schema Field Guidelines

When defining attestation schemas:

- Use `address` for wallet addresses
- Use `string` for names and identifiers
- Use `bytes32` for compact data
- Include `timestamp` for temporal data
- Consider future interoperability

## Pull Request Process

### Before Submitting

1. **Sync with main branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run quality checks**:
   ```bash
   npm run lint
   npm run build
   ```

3. **Test your changes** manually (see Testing section)

4. **Update documentation** if needed (README, CLAUDE.md, this file)

### PR Requirements

Your pull request should:

- [ ] Have a clear, descriptive title
- [ ] Reference any related issues (`Fixes #123`)
- [ ] Include a description of what changed and why
- [ ] Include screenshots for UI changes
- [ ] Include test results for onchain changes
- [ ] Not break existing functionality

### PR Title Format

Use conventional commits format:

- `feat: add magic link RSVP flow`
- `fix: resolve wallet connection timeout`
- `docs: update EAS schema documentation`
- `refactor: simplify attestation query logic`

### Review Process

1. **Automated checks** must pass (lint, build)
2. **Maintainer review** for code quality and architecture
3. **Manual testing** for onchain functionality
4. **Approval and merge** by project maintainer

### After Merge

- Changes deploy automatically via Vercel
- Monitor the [live app](https://basebloc.app) for issues
- Update any related documentation

## Questions?

- **Technical questions**: Open a [GitHub Discussion](https://github.com/BTCAli510/basebloc/discussions)
- **Bug reports**: [Open an issue](https://github.com/BTCAli510/basebloc/issues/new)
- **Security concerns**: Email security@basebloc.app (do not open public issues)

## Resources

- [Base Documentation](https://docs.base.org)
- [EAS Documentation](https://docs.attest.sh)
- [OnchainKit Docs](https://onchainkit.xyz)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com)
- [Base EAS Explorer](https://base.easscan.org)

---

Thank you for helping make onchain onboarding accessible to everyone! 🎉