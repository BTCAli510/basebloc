'use client';

import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";

export default function Home() {
  return (
    <>
      {/* ── NAV ── */}
      <nav className="v4-nav">
        <a href="/" className="v4-nav-logo">
          BASE<span>bloc</span>.app
        </a>
        <ul className="v4-nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#events">Events</a></li>
          <li><a href="#records">Records</a></li>
          <li><a href="#merchants">Merchants</a></li>
          <li>
            <div className="v4-nav-cta-wrap">
              <Wallet>
                <ConnectWallet>Connect Wallet</ConnectWallet>
              </Wallet>
            </div>
          </li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="v4-hero-section" style={{ paddingBottom: 0 }}>
        <div className="v4-hero">
          <div className="hero-left">
            <div className="hero-eyebrow">BASE Oakland bloc · Coalition 001</div>
            <h1 className="hero-headline tight">
              Community<br />
              coordination<br />
              <span className="infra-wrap">
                infrastructure
                <span className="infra-circle" aria-hidden="true">
                  <svg viewBox="0 0 340 70" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <defs>
                      <filter id="iglow" x="-30%" y="-80%" width="160%" height="260%">
                        <feGaussianBlur stdDeviation="3" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    <g filter="url(#iglow)" opacity="0.9">
                      <ellipse cx="170" cy="38" rx="158" ry="22" fill="none" stroke="#0052FF" strokeWidth="2.2" strokeLinecap="round" transform="rotate(-2 170 38)"/>
                      <ellipse cx="170" cy="38" rx="154" ry="19" fill="none" stroke="#0052FF" strokeWidth="1.6" strokeLinecap="round" transform="rotate(2.5 170 38)"/>
                      <ellipse cx="170" cy="38" rx="162" ry="25" fill="none" stroke="#0052FF" strokeWidth="1.1" strokeLinecap="round" transform="rotate(-1 170 38)"/>
                    </g>
                  </svg>
                </span>
              </span>
            </h1>
            <p className="hero-sub">
              BASEbloc.app helps communities keep more of the value they create — and turn participation into belonging that compounds. Every recognized action builds over time.
            </p>
            <div className="hero-ctas">
              <div className="v4-btn-primary-wrap">
                <Wallet>
                  <ConnectWallet>Connect Wallet — Start Your Record</ConnectWallet>
                </Wallet>
              </div>
              <a href="#events" className="btn-secondary">Explore Events →</a>
            </div>
          </div>
          <div className="v4-hero-right">
            <div className="loop-card">
              <div className="loop-label">The Participation Loop</div>
              <div className="loop-steps">
                <div className="loop-step">
                  <div className="loop-num">01</div>
                  <div>
                    <div className="loop-step-verb">Join</div>
                    <div className="loop-step-desc">Scan a QR, open your Coinbase Smart Wallet, execute your first gasless action. 60 seconds. No crypto experience needed.</div>
                  </div>
                </div>
                <div className="loop-step">
                  <div className="loop-num">02</div>
                  <div>
                    <div className="loop-step-verb">Act</div>
                    <div className="loop-step-desc">Attend coalition events, support local merchants, contribute to the community. Every action is a signal.</div>
                  </div>
                </div>
                <div className="loop-step">
                  <div className="loop-num">03</div>
                  <div>
                    <div className="loop-step-verb">Own</div>
                    <div className="loop-step-desc">Your participation is recorded onchain via EAS attestation. A permanent, portable credential no one can take from you.</div>
                  </div>
                </div>
                <div className="loop-step">
                  <div className="loop-num">04</div>
                  <div>
                    <div className="loop-step-verb">Return</div>
                    <div className="loop-step-desc">Your record builds Bloc Status. Status unlocks access, opportunity, and recognition that compounds with every activation.</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num blue">&lt;60s</div>
                <div className="hero-stat-label">Gasless onboarding</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">EAS</div>
                <div className="hero-stat-label">Schema #1354 · Base mainnet</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num orange">$0</div>
                <div className="hero-stat-label">Gas fees for users</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">TBA</div>
                <div className="hero-stat-label">Cities in coalition network</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE LANES ── */}
      <section className="v4-section lanes-section" id="services">
        <div className="section-inner">
          <div className="section-eyebrow">What BASEbloc.app coordinates</div>
          <h2 className="section-headline">Three entry points.<br />One compounding record.</h2>
          <p className="section-sub">Events are where most people start. Services and commerce deepen the loop. Records make everything stick.</p>
          <div className="lanes-grid">
            <div className="lane-card">
              <div className="lane-icon blue">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="lane-tag">Events</div>
              <div className="lane-title tight">Attendance becomes identity.</div>
              <p className="lane-body">Scan the QR at the door — your attestation flips to Verified. Not a ticket stub — a permanent EAS credential tied to your wallet address, recorded onchain the moment you walk in.</p>
              <div className="lane-examples">
                <span className="lane-example">Cultural summits and music events</span>
                <span className="lane-example">Workshops and masterclasses</span>
                <span className="lane-example">Coalition activations city-wide</span>
                <span className="lane-example">Virtual IRL crossover events</span>
              </div>
            </div>
            <div className="lane-card">
              <div className="lane-icon orange">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F7931A" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className="lane-tag">Services</div>
              <div className="lane-title tight">Commerce builds your record.</div>
              <p className="lane-body">Eligible community businesses on Base rails. Zero BASEbloc platform fees. Fast USDC settlement. Every transaction with a coalition merchant can add to your verified community record — automatically.</p>
              <div className="lane-examples">
                <span className="lane-example">Barbershops and salons</span>
                <span className="lane-example">Community businesses and vendors</span>
                <span className="lane-example">Coalition merchant partners</span>
                <span className="lane-example">Recurring service providers</span>
              </div>
            </div>
            <div className="lane-card">
              <div className="lane-icon dark">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="lane-tag">Records</div>
              <div className="lane-title tight">Proof that compounds.</div>
              <p className="lane-body">Your events and daily commerce feed the exact same shared community record. Every recognized participation signal — from door scans to merchant transactions — builds a single permanent, portable record that powers Bloc Status and unlocks access. Every recognized action adds to the ledger.</p>
              <div className="lane-examples">
                <span className="lane-example">EAS attestations per activation</span>
                <span className="lane-example">Bloc Status: Visitor → OG → Bloc Builder</span>
                <span className="lane-example">Portable identity across coalitions</span>
                <span className="lane-example">Access and opportunity unlocks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THESIS / WHY IT EXISTS ── */}
      <section className="v4-section">
        <div className="section-inner">
          <div className="section-eyebrow">Why this exists</div>
          <h2 className="section-headline">The extraction problem is real.<br />The fix is onchain.</h2>
          <div className="thesis-grid">
            <div>
              <div className="thesis-quote">
                &ldquo;Communities have always created value they couldn&apos;t keep. Platforms captured it. Institutions controlled it.&rdquo;
              </div>
              <p className="thesis-bold">
                Bitcoin became a vault for those already positioned. BASE Oakland bloc is building a launchpad for those who are not.
              </p>
              <p className="thesis-body">
                BASEbloc.app is built on a single premise: participation should compound for the people doing the participating. Not the platform. Not the landlord. Not the aggregator.
              </p>
              <p className="thesis-body">
                Onchain infrastructure makes contribution legible, verifiable, and ownable. It turns showing up into leverage. Reputation into portable capital. Community into durable infrastructure.
              </p>
              <p className="thesis-body">
                Physical wealth can be burned down. An EAS attestation on Base mainnet cannot.
              </p>
            </div>
            <div>
              <div className="contrast-table">
                <div className="contrast-header">
                  <div className="contrast-col-header left">Old model</div>
                  <div className="contrast-col-header right">BASEbloc model</div>
                </div>
                <div className="contrast-row">
                  <div className="contrast-cell left">Platform owns the record</div>
                  <div className="contrast-cell right"><strong>You own the attestation</strong></div>
                </div>
                <div className="contrast-row">
                  <div className="contrast-cell left">Data disappears when you leave</div>
                  <div className="contrast-cell right"><strong>Immutable. Portable. Permanent.</strong></div>
                </div>
                <div className="contrast-row">
                  <div className="contrast-cell left">Attendance = a receipt</div>
                  <div className="contrast-cell right"><strong>Attendance = onchain identity</strong></div>
                </div>
                <div className="contrast-row">
                  <div className="contrast-cell left">Status is purchased</div>
                  <div className="contrast-cell right"><strong>Status is earned. Always.</strong></div>
                </div>
                <div className="contrast-row">
                  <div className="contrast-cell left">Processing fees extracted</div>
                  <div className="contrast-cell right"><strong>Keep what you earn. Base rails.</strong></div>
                </div>
                <div className="contrast-row">
                  <div className="contrast-cell left">Community has no leverage</div>
                  <div className="contrast-cell right"><strong>Participation is the leverage</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MERCHANT ── */}
      <section className="v4-section merchant-section" id="merchants">
        <div className="section-inner">
          <div className="merchant-inner">
            <div>
              <div className="merchant-eyebrow">Community Commerce</div>
              <h2 className="merchant-headline tight">Zero BASEbloc platform fees for eligible community businesses.</h2>
              <p className="merchant-body">
                Local businesses should not lose 3.0–3.5% of every sale to outside platforms when that value could stay in the neighborhood. BASEbloc.app helps eligible community merchants accept USDC on Base with fast settlement, lower costs, and a path to stronger customer return loops. No crypto experience required.
              </p>
              <div className="merchant-benefits">
                <div className="merchant-benefit">
                  <div className="benefit-dot" />
                  <div>
                    <div className="benefit-title">Keep more of what you earn</div>
                    <div className="benefit-desc">A business doing $30K/month can preserve roughly $900–$1,050/month that would otherwise leave the neighborhood. The math closes itself.</div>
                  </div>
                </div>
                <div className="merchant-benefit">
                  <div className="benefit-dot" />
                  <div>
                    <div className="benefit-title">Turn transactions into return behavior</div>
                    <div className="benefit-desc">Each purchase can strengthen a customer&apos;s verified community record, making it easier to recognize regulars and reward real participation over time.</div>
                  </div>
                </div>
                <div className="merchant-benefit">
                  <div className="benefit-dot" />
                  <div>
                    <div className="benefit-title">Belonging that compounds</div>
                    <div className="benefit-desc">Customers and event attendees become recognized community members. Revenue, retention, and belonging start reinforcing each other.</div>
                  </div>
                </div>
              </div>
              <a href="mailto:lead@baseoak.org" className="btn-orange-outline">Join the Merchant Pilot →</a>
            </div>
            <div>
              <div className="math-card">
                <div className="math-label">The Math · Community Merchant Model</div>
                <div className="math-row">
                  <div className="math-key">Monthly card revenue</div>
                  <div className="math-val white">$30,000</div>
                </div>
                <div className="math-row">
                  <div className="math-key">Typical processor fees (3.0–3.5%)</div>
                  <div className="math-val red">−$900 to −$1,050</div>
                </div>
                <div className="math-row">
                  <div className="math-key">BASEbloc platform fee (eligible merchants)</div>
                  <div className="math-val blue">$0</div>
                </div>
                <div className="math-row">
                  <div className="math-key">Potential monthly recovery</div>
                  <div className="math-val orange">+$900 to +$1,050</div>
                </div>
                <div className="math-row">
                  <div className="math-key">Potential annual recovery</div>
                  <div className="math-val orange">+$10,800 to +$12,600</div>
                </div>
                <div className="math-pilot">
                  <strong>Active pilot:</strong> TBA · Oakland, CA · USDC settlement via Base
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="v4-section how-section">
        <div className="section-inner">
          <div className="section-eyebrow">How it works</div>
          <h2 className="section-headline">Join → Act → Own → Return.</h2>
          <p className="section-sub">Four steps. One loop. A record that compounds over every coalition, every city, every activation.</p>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">01 · JOIN</div>
              <div className="step-verb tight">Gasless onboarding.</div>
              <p className="step-desc">Walk up to the door. Scan the QR. Open your Coinbase Smart Wallet and your attestation flips to Verified — gasless, covered by Coinbase Paymaster. No app download. No crypto experience needed. Under 60 seconds from door to credential.</p>
              <div className="step-proof">Coinbase Smart Wallet · Paymaster</div>
            </div>
            <div className="step">
              <div className="step-num">02 · ACT</div>
              <div className="step-verb tight">Participate in your city.</div>
              <p className="step-desc">RSVP to events. Check in at the door. Transact with coalition merchants in USDC. Volunteer. Refer members. Perform or speak. Every action generates a signal. Every recognized signal can be recorded onchain.</p>
              <div className="step-proof">IRL + Online signals · Verified by coalition</div>
            </div>
            <div className="step">
              <div className="step-num">03 · OWN</div>
              <div className="step-verb tight">Earn verifiable identity.</div>
              <p className="step-desc">Participation is recorded onchain via EAS Schema #1354 on Base mainnet. You receive a permanent, portable credential tied to your wallet address. Immutable. Not transferable. Not purchasable. Yours.</p>
              <div className="step-proof">EAS Schema #1354 · Base mainnet</div>
            </div>
            <div className="step">
              <div className="step-num">04 · RETURN</div>
              <div className="step-verb tight">Build your Bloc Status.</div>
              <p className="step-desc">Your record accumulates Bloc Parti points. Points determine Bloc Status — Visitor, Participant, Contributor, OG, Bloc Builder. Status unlocks access, recognition, and opportunity. You can only earn it. Never buy it.</p>
              <div className="step-proof">Bloc Status · Anti-rentier by design</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOC STATUS / RECORDS ── */}
      <section className="v4-section" id="records">
        <div className="section-inner">
          <div className="section-eyebrow">Your Bloc Status</div>
          <h2 className="section-headline">Reputation earned,<br />never purchased.</h2>
          <div className="status-grid">
            <div>
              <p className="status-body">
                Bloc Status is a five-tier reputation system built on your verified participation record. Every IRL event, every coalition merchant transaction, every referral, every online contribution adds to your Bloc Parti points. Your status grows. It is additive and permanent. Nothing can be revoked.
              </p>
              <div className="status-tiers">
                <div className="tier-row">
                  <div>
                    <div className="tier-left">
                      <div className="tier-dot" style={{ background: '#888' }} />
                      <div className="tier-name tight">Visitor</div>
                    </div>
                    <div className="tier-desc">Any first verified touchpoint — You found us.</div>
                  </div>
                  <span className="tier-badge" style={{ background: '#f5f5f5', color: '#888' }}>Entry</span>
                </div>
                <div className="tier-row">
                  <div>
                    <div className="tier-left">
                      <div className="tier-dot" style={{ background: '#0052FF' }} />
                      <div className="tier-name tight">Participant</div>
                    </div>
                    <div className="tier-desc">Verified IRL attendance + basic online presence.</div>
                  </div>
                  <span className="tier-badge" style={{ background: '#EEF3FF', color: '#0052FF' }}>Active</span>
                </div>
                <div className="tier-row">
                  <div>
                    <div className="tier-left">
                      <div className="tier-dot" style={{ background: '#F7931A' }} />
                      <div className="tier-name tight">Contributor</div>
                    </div>
                    <div className="tier-desc">Multiple events + online contribution + referral activity.</div>
                  </div>
                  <span className="tier-badge" style={{ background: '#FFF4E8', color: '#F7931A' }}>Building</span>
                </div>
                <div className="tier-row">
                  <div>
                    <div className="tier-left">
                      <div className="tier-dot" style={{ background: '#FFD700' }} />
                      <div className="tier-name tight">OG</div>
                    </div>
                    <div className="tier-desc">Sustained IRL + online + hold duration + community roles.</div>
                  </div>
                  <span className="tier-badge" style={{ background: '#FFFBE6', color: '#b8860b' }}>You were here.</span>
                </div>
                <div className="tier-row">
                  <div>
                    <div className="tier-left">
                      <div className="tier-dot" style={{ background: '#0A0A0A' }} />
                      <div className="tier-name tight">Bloc Builder</div>
                    </div>
                    <div className="tier-desc">Hosted or co-organized a coalition activation. You are infrastructure.</div>
                  </div>
                  <span className="tier-badge" style={{ background: '#0A0A0A', color: '#fff' }}>Infrastructure</span>
                </div>
              </div>
            </div>
            <div>
              <div className="record-mockup">
                <div className="record-header">
                  <div className="record-avatar">JB</div>
                  <div>
                    <div className="record-name">Oakland Member</div>
                    <div className="record-status-badge">OG · BASE Oakland bloc</div>
                  </div>
                </div>
                <div className="record-stats">
                  <div className="record-stat">
                    <div className="record-stat-num">7</div>
                    <div className="record-stat-label">Activations</div>
                  </div>
                  <div className="record-stat">
                    <div className="record-stat-num" style={{ color: 'var(--base-blue)' }}>340</div>
                    <div className="record-stat-label">Bloc Parti Pts</div>
                  </div>
                  <div className="record-stat">
                    <div className="record-stat-num" style={{ color: 'var(--btc-orange)' }}>12</div>
                    <div className="record-stat-label">Referrals</div>
                  </div>
                </div>
                <div className="record-attestations">
                  <div className="attestation-row">
                    <div className="att-event">MY CITY OUR MUSIC · May 23, 2026</div>
                    <div className="att-badge verified">Verified ✓</div>
                  </div>
                  <div className="attestation-row">
                    <div className="att-event">Coalition 001 Pre-summit Masterclass</div>
                    <div className="att-badge verified">Verified ✓</div>
                  </div>
                  <div className="attestation-row">
                    <div className="att-event">Oakland Barbershop · USDC tx</div>
                    <div className="att-badge">EAS #1354</div>
                  </div>
                  <div className="attestation-row">
                    <div className="att-event">Base is for everyone · X community</div>
                    <div className="att-badge">Online signal</div>
                  </div>
                </div>
                <div className="record-anti-rentier">
                  <strong>Bloc Status is earned, never purchased.</strong> Permanent and additive. Your record follows you across every coalition and every city.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MY CITY OUR MUSIC ACTIVATION ── */}
      <section className="v4-section activation-section" id="events">
        <div className="section-inner">
          <div className="activation-inner">
            <div>
              <div className="activation-eyebrow">Coalition 001 Activation</div>
              <h2 className="activation-headline tight">The proof moment<br />is May 23.</h2>
              <p className="activation-body">
                MY CITY OUR MUSIC is the first large-scale proof of the BASEbloc.app coordination model. 1,000–1,500 attendees. Every one gets a gasless onchain credential. Every check-in flips a verified EAS attestation. The receipts come from Oakland.
              </p>
              <div className="activation-details">
                <div className="act-detail">
                  <div className="act-detail-key">Date</div>
                  <div className="act-detail-val">May 23, 2026</div>
                </div>
                <div className="act-detail">
                  <div className="act-detail-key">Venue</div>
                  <div className="act-detail-val">Henry J. Kaiser Center for the Arts, Oakland</div>
                </div>
                <div className="act-detail">
                  <div className="act-detail-key">Produced</div>
                  <div className="act-detail-val">HipHopTV × CitiesABC</div>
                </div>
                <div className="act-detail">
                  <div className="act-detail-key">Speakers</div>
                  <div className="act-detail-val">TBA</div>
                </div>
                <div className="act-detail">
                  <div className="act-detail-key">Credential</div>
                  <div className="act-detail-val">EAS Schema #1354 · gasless · every attendee</div>
                </div>
              </div>
              <a href="/tickets" className="btn-primary">RSVP</a>
            </div>
            <div>
              <div className="event-card">
                <div className="event-card-img">
                  <div className="event-flyer-text">
                    <div className="event-flyer-city">Oakland, CA · Coalition 001</div>
                    <div className="event-flyer-title">MY CITY</div>
                    <div className="event-flyer-sub">OUR MUSIC</div>
                  </div>
                </div>
                <div className="event-card-body">
                  <div className="event-card-date">May 23, 2026</div>
                  <div className="event-card-title tight">MY CITY OUR MUSIC</div>
                  <div className="event-card-venue">Henry J. Kaiser Center for the Arts · Oakland, CA</div>
                  <div className="event-card-tags">
                    <span className="event-tag eas">EAS Credential</span>
                    <span className="event-tag vip">VIP Available</span>
                  </div>
                  <a href="/tickets" className="event-cta">RSVP — Secure Your Spot</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COALITION CITIES ── */}
      <section className="v4-section coalition-section">
        <div className="section-inner">
          <div className="section-eyebrow">The network</div>
          <h2 className="section-headline">Oakland is Coalition 001.<br />This is just the start.</h2>
          <p className="coalition-body">
            The BASE Oakland bloc playbook — cultural trust, gasless onboarding, EAS attestations, Bloc Status — is designed to replicate city by city. Same infrastructure. Same loop. Different trusted operators, different communities.
          </p>
          <div className="coalition-cities">
            <div className="coalition-city">
              <div className="city-num">001</div>
              <div className="city-name active tight">Oakland</div>
              <div className="city-status active">Live · BASEoak.org</div>
            </div>
            <div className="coalition-city">
              <div className="city-num">002</div>
              <div className="city-name tight">Boston</div>
              <div className="city-status">BASEbos.org · Coming</div>
            </div>
            <div className="coalition-city">
              <div className="city-num">003</div>
              <div className="city-name tight">Los Angeles</div>
              <div className="city-status">BASElabloc.org · Coming</div>
            </div>
            <div className="coalition-city">
              <div className="city-num">004</div>
              <div className="city-name tight">Houston</div>
              <div className="city-status">BASEhtx.org · Coming</div>
            </div>
            <div className="coalition-city">
              <div className="city-num">005</div>
              <div className="city-name tight">Atlanta</div>
              <div className="city-status">BASEatl.org · Coming</div>
            </div>
            <div className="coalition-city">
              <div className="city-num">006</div>
              <div className="city-name tight">Chicago</div>
              <div className="city-status">Coming</div>
            </div>
          </div>
          <div className="closing-line tight">
            BASE Oakland bloc <span className="highlight">gets bigger with every coalition, every city, every activation.</span>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="v4-section final-cta-section">
        <div className="section-inner">
          <h2 className="final-cta-headline tight">Power to the People.<br /><span className="orange">Onchain.</span></h2>
          <p className="final-cta-sub">
            Your participation builds something that lasts. Start your record, earn your Bloc Status, and bring BASEbloc.app to your coalition, event, or business.
          </p>
          <div className="final-cta-buttons">
            <div className="v4-btn-primary-wrap">
              <Wallet>
                <ConnectWallet>Connect Wallet — Start Your Record</ConnectWallet>
              </Wallet>
            </div>
            <a href="mailto:lead@baseoak.org" className="btn-orange-outline" style={{ color: 'var(--btc-orange)' }}>Bring BASEbloc to Your City →</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="v4-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">BASE<span>bloc</span>.app</div>
            <div className="footer-slogan">Power to the People. <span className="orange">Onchain.</span></div>
          </div>
          <div className="footer-right">
            <a href="https://baseiq.app" className="footer-link" target="_blank" rel="noopener noreferrer">baseiq.app</a>
            <a href="https://baseoak.org" className="footer-link" target="_blank" rel="noopener noreferrer">BASEoak.org</a>
            <a href="https://basebloc.org" className="footer-link" target="_blank" rel="noopener noreferrer">BASEbloc.org</a>
            <a href="mailto:lead@baseoak.org" className="footer-link">Contact</a>
          </div>
        </div>
        <div className="footer-credit">
          Courtesy of <a href="https://orangessance.com" target="_blank" rel="noopener noreferrer">Orangessance.</a>
        </div>
      </footer>
    </>
  );
}
