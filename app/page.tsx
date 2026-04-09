export default function Page() {
  const styles = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --base-blue: #0052FF;
    --btc-orange: #F7931A;
    --black: #0A0A0A;
    --off-white: #F8F8F6;
    --mid-gray: #888;
    --border: #E8E8E8;
    --card-bg: #FAFAFA;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: var(--black);
    -webkit-font-smoothing: antialiased;
  }

  .tight { font-family: 'Inter Tight', sans-serif; }

  /* ── NAV ── */
  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    font-family: 'Inter Tight', sans-serif;
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.5px;
    color: var(--black);
    text-decoration: none;
  }

  .nav-logo span { color: var(--base-blue); }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    list-style: none;
  }

  .nav-links a {
    font-size: 13px;
    font-weight: 500;
    color: #555;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
    letter-spacing: 0.01em;
  }

  .nav-links a:hover { color: var(--black); background: var(--off-white); }

  .nav-cta {
    background: var(--btc-orange) !important;
    color: #fff !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    padding: 8px 16px !important;
  }

  .nav-cta:hover { background: #e8841a !important; }

  .nav-link-outline {
    background: #fff !important;
    color: var(--black) !important;
    border: 1.5px solid var(--black) !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    padding: 6px 14px !important;
  }

  .nav-link-outline:hover { background: var(--off-white) !important; }

  /* ── HERO ── */
  .hero {
    padding: 40px 32px 0;
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 0.72fr;
    gap: 32px;
    align-items: stretch;
  }

  .hero-left-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100%;
  }

  .hero-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--base-blue);
    margin-bottom: 20px;
  }

  .hero-headline {
    font-family: 'Inter Tight', sans-serif;
    font-size: clamp(36px, 5vw, 58px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -2px;
    color: var(--black);
    margin-bottom: 24px;
  }

  .hero-headline .accent { color: var(--base-blue); }
  .hero-headline .orange { color: var(--btc-orange); }

  .infra-wrap {
    position: relative;
    display: inline-block;
  }

  .infra-circle {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -44%);
    width: 115%;
    height: 220%;
    pointer-events: none;
    display: block;
  }

  .infra-circle svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .hero-sub {
    font-size: 17px;
    line-height: 1.7;
    color: #555;
    margin-bottom: 36px;
    max-width: 480px;
  }

  .hero-ctas {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn-primary {
    background: var(--btc-orange);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 14px 24px;
    font-family: 'Inter Tight', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    text-decoration: none;
    display: inline-block;
  }

  .btn-primary:hover { background: #e8841a; transform: translateY(-1px); }

  .btn-secondary {
    background: transparent;
    color: var(--black);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 14px 24px;
    font-family: 'Inter Tight', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    text-decoration: none;
    display: inline-block;
  }

  .btn-secondary:hover { border-color: #bbb; background: var(--off-white); }

  .hero-right {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* ── EVENTS PREVIEW (middle column) ── */
  .hero-events {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .events-block {
    border: 1.5px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    background: #fff;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .events-block-header {
    padding: 18px 20px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .events-block-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--base-blue);
  }

  .events-block-title {
    font-family: 'Inter Tight', sans-serif;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.3px;
    color: var(--black);
    margin-top: 4px;
  }

  .events-see-all {
    font-size: 12px;
    font-weight: 500;
    color: var(--mid-gray, #888);
    text-decoration: none;
    white-space: nowrap;
  }

  .events-see-all:hover { color: var(--black); }

  .events-cards-list {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .ev-card {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 16px;
    padding: 20px;
    border-bottom: 1px solid var(--border);
    align-items: start;
    flex: 1;
  }

  .ev-card:last-child { border-bottom: none; }

  .ev-thumb {
    width: 120px;
    height: 90px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
  }

  .ev-thumb-featured {
    background: linear-gradient(135deg, #0A1628 0%, #0052FF 60%, #1a1a2e 100%);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 2px;
  }

  .ev-thumb-featured-text {
    font-family: 'Inter Tight', sans-serif;
    font-size: 8px;
    font-weight: 900;
    color: #fff;
    text-align: center;
    line-height: 1.2;
    letter-spacing: 0.03em;
  }

  .ev-thumb-featured-sub {
    font-family: 'Inter Tight', sans-serif;
    font-size: 8px;
    font-weight: 900;
    color: var(--btc-orange);
    text-align: center;
    line-height: 1.2;
  }

  .ev-thumb-tba {
    background: #f2f2f2;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #ccc;
    text-transform: uppercase;
  }

  .ev-badge-featured {
    position: absolute;
    top: 5px;
    left: 5px;
    background: var(--base-blue);
    color: #fff;
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 5px;
    border-radius: 3px;
  }

  .ev-body {}

  .ev-coalition {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--base-blue);
    margin-bottom: 3px;
  }

  .ev-name {
    font-family: 'Inter Tight', sans-serif;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: -0.2px;
    color: var(--black);
    margin-bottom: 4px;
    line-height: 1.2;
  }

  .ev-date {
    font-size: 10px;
    color: #888;
    margin-bottom: 7px;
  }

  .ev-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }

  .ev-tag {
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 20px;
    border: 1px solid var(--border);
    color: #666;
    font-weight: 500;
  }

  .ev-actions {
    display: flex;
    gap: 5px;
  }

  .ev-btn-primary {
    background: var(--base-blue);
    color: #fff;
    font-family: 'Inter Tight', sans-serif;
    font-size: 9px;
    font-weight: 700;
    padding: 4px 9px;
    border-radius: 6px;
    text-decoration: none;
  }

  .ev-btn-secondary {
    background: transparent;
    color: var(--base-blue);
    border: 1.5px solid var(--base-blue);
    font-family: 'Inter Tight', sans-serif;
    font-size: 9px;
    font-weight: 700;
    padding: 4px 9px;
    border-radius: 6px;
    text-decoration: none;
  }

  .ev-tba-name {
    font-family: 'Inter Tight', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #ccc;
    margin-top: 6px;
  }

  .ev-tba-network {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ccc;
  }

  .ev-notify-btn {
    background: transparent;
    color: #aaa;
    border: 1px solid #e0e0e0;
    font-family: 'Inter Tight', sans-serif;
    font-size: 9px;
    font-weight: 500;
    padding: 4px 9px;
    border-radius: 6px;
    text-decoration: none;
    display: inline-block;
    margin-top: 8px;
  }

  .events-cta-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
    background: #fafafa;
  }

  .btn-ghost-outline {
    text-align: center;
    background: #fff;
    color: var(--black);
    font-family: 'Inter Tight', sans-serif;
    font-size: 11px;
    font-weight: 600;
    padding: 9px 10px;
    border-radius: 8px;
    border: 1.5px solid #D4D4D4;
    text-decoration: none;
    transition: border-color 0.15s, background 0.15s;
  }

  .btn-ghost-outline:hover { border-color: #999; background: var(--off-white); }

  .loop-card {
    background: #fff;
    border: 1.5px solid var(--black);
    border-radius: 20px;
    padding: 32px;
    color: var(--black);
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .loop-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 20px;
  }

  .loop-steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    flex: 1;
  }

  .loop-step {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
  }

  .loop-step:last-child { border-bottom: none; }

  .loop-num {
    font-family: 'Inter Tight', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: var(--base-blue);
    letter-spacing: 1px;
    min-width: 28px;
    padding-top: 2px;
  }

  .loop-step-content {}

  .loop-step-verb {
    font-family: 'Inter Tight', sans-serif;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--black);
    margin-bottom: 4px;
  }

  .loop-step-desc {
    font-size: 13px;
    color: #888;
    line-height: 1.5;
  }

  .loop-arrow {
    text-align: center;
    color: #333;
    font-size: 12px;
    padding: 2px 0;
    display: none;
  }

  .hero-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 16px;
  }

  .hero-stat {
    background: #fff;
    border: 1.5px solid var(--black);
    border-radius: 12px;
    padding: 16px 20px;
  }

  .hero-stat-num {
    font-family: 'Inter Tight', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: var(--black);
    letter-spacing: -1px;
  }

  .hero-stat-num.blue { color: var(--base-blue); }
  .hero-stat-num.orange { color: var(--btc-orange); }

  .hero-stat-label {
    font-size: 11px;
    color: #888;
    margin-top: 2px;
  }

  /* ── SECTION COMMON ── */
  section { padding: 80px 32px; }

  .section-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .section-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--base-blue);
    margin-bottom: 12px;
  }

  .section-headline {
    font-family: 'Inter Tight', sans-serif;
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 800;
    letter-spacing: -1.5px;
    line-height: 1.1;
    color: var(--black);
    margin-bottom: 16px;
  }

  .section-sub {
    font-size: 16px;
    color: #666;
    line-height: 1.7;
    max-width: 560px;
  }

  /* ── DIVIDER ── */
  .divider {
    max-width: 1100px;
    margin: 0 auto;
    height: 1px;
    background: var(--border);
  }

  /* ── THREE LANES ── */
  .lanes-section { background: var(--off-white); }

  .lanes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 48px;
  }

  .lane-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default;
  }

  .lane-card:hover {
    border-color: #bbb;
    transform: translateY(-2px);
  }

  .lane-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 20px;
  }

  .lane-icon.blue { background: #EEF3FF; }
  .lane-icon.orange { background: #FFF4E8; }
  .lane-icon.dark { background: #0A0A0A; }

  .lane-tag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--base-blue);
    margin-bottom: 8px;
  }

  .lane-title {
    font-family: 'Inter Tight', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--black);
    margin-bottom: 12px;
  }

  .lane-body {
    font-size: 14px;
    line-height: 1.7;
    color: #666;
    margin-bottom: 20px;
  }

  .lane-examples {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .lane-example {
    font-size: 12px;
    color: #888;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .lane-example::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--base-blue);
    flex-shrink: 0;
  }

  /* ── WHY IT MATTERS ── */
  .thesis-section {}

  .thesis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    margin-top: 60px;
    align-items: start;
  }

  .thesis-left {}

  .thesis-quote {
    font-family: 'Inter Tight', sans-serif;
    font-size: clamp(20px, 3vw, 28px);
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.3;
    color: var(--black);
    margin-bottom: 24px;
    border-left: 3px solid var(--btc-orange);
    padding-left: 20px;
  }

  .thesis-body {
    font-size: 15px;
    line-height: 1.8;
    color: #555;
    margin-bottom: 16px;
  }

  .thesis-right {}

  .contrast-table {
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  .contrast-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .contrast-col-header {
    padding: 16px 20px;
    font-family: 'Inter Tight', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .contrast-col-header.left {
    background: #f5f5f5;
    color: #888;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .contrast-col-header.right {
    background: var(--black);
    color: var(--base-blue);
    border-bottom: 1px solid #222;
  }

  .contrast-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid var(--border);
  }

  .contrast-row:last-child { border-bottom: none; }

  .contrast-cell {
    padding: 14px 20px;
    font-size: 13px;
    line-height: 1.5;
  }

  .contrast-cell.left {
    background: #fafafa;
    color: #888;
    border-right: 1px solid var(--border);
    text-decoration: line-through;
    text-decoration-color: #ccc;
  }

  .contrast-cell.right {
    background: var(--black);
    color: #ccc;
    border-bottom: 1px solid #1a1a1a;
  }

  .contrast-cell.right strong {
    color: #fff;
    font-weight: 600;
  }

  /* ── MERCHANT ── */
  .merchant-section { background: var(--black); color: #fff; }

  .merchant-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .merchant-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--btc-orange);
    margin-bottom: 16px;
  }

  .merchant-headline {
    font-family: 'Inter Tight', sans-serif;
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 800;
    letter-spacing: -1.5px;
    line-height: 1.1;
    color: #fff;
    margin-bottom: 20px;
  }

  .merchant-body {
    font-size: 15px;
    line-height: 1.8;
    color: #888;
    margin-bottom: 32px;
  }

  .merchant-benefits {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }

  .merchant-benefit {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .benefit-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--btc-orange);
    margin-top: 6px;
    flex-shrink: 0;
  }

  .benefit-text {}

  .benefit-title {
    font-family: 'Inter Tight', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }

  .benefit-desc {
    font-size: 13px;
    color: #666;
    line-height: 1.5;
  }

  .merchant-right {}

  .math-card {
    background: #111;
    border: 1px solid #222;
    border-radius: 16px;
    padding: 28px;
  }

  .math-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 20px;
  }

  .math-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid #1a1a1a;
  }

  .math-row:last-child { border-bottom: none; }

  .math-key {
    font-size: 13px;
    color: #666;
  }

  .math-val {
    font-family: 'Inter Tight', sans-serif;
    font-size: 16px;
    font-weight: 700;
  }

  .math-val.white { color: #fff; }
  .math-val.orange { color: var(--btc-orange); }
  .math-val.blue { color: var(--base-blue); }

  .math-pilot {
    margin-top: 20px;
    padding: 14px 16px;
    background: rgba(247,147,26,0.08);
    border: 1px solid rgba(247,147,26,0.2);
    border-radius: 10px;
    font-size: 13px;
    color: #888;
  }

  .math-pilot strong { color: var(--btc-orange); }

  .btn-orange-outline {
    border: 1.5px solid var(--btc-orange);
    color: var(--btc-orange);
    background: transparent;
    border-radius: 10px;
    padding: 12px 22px;
    font-family: 'Inter Tight', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    text-decoration: none;
    display: inline-block;
  }

  .btn-orange-outline:hover { background: rgba(247,147,26,0.08); }

  /* ── HOW IT WORKS ── */
  .how-section { background: var(--off-white); }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    margin-top: 56px;
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
  }

  .step {
    padding: 32px 28px;
    border-right: 1px solid var(--border);
    position: relative;
  }

  .step:last-child { border-right: none; }

  .step-num {
    font-family: 'Inter Tight', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--base-blue);
    margin-bottom: 16px;
  }

  .step-verb {
    font-family: 'Inter Tight', sans-serif;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--black);
    margin-bottom: 10px;
  }

  .step-desc {
    font-size: 13px;
    color: #777;
    line-height: 1.65;
    margin-bottom: 20px;
  }

  .step-proof {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #bbb;
  }

  /* ── RECORDS / BLOC STATUS ── */
  .status-section {}

  .status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    margin-top: 60px;
    align-items: start;
  }

  .status-left {}

  .status-body {
    font-size: 15px;
    line-height: 1.8;
    color: #555;
    margin-bottom: 32px;
  }

  .status-tiers {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
  }

  .tier-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }

  .tier-row:last-child { border-bottom: none; }
  .tier-row:hover { background: #fafafa; }

  .tier-left { display: flex; align-items: center; gap: 14px; }

  .tier-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .tier-name {
    font-family: 'Inter Tight', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--black);
  }

  .tier-desc {
    font-size: 12px;
    color: #888;
    margin-left: 24px;
    margin-top: 2px;
  }

  .tier-badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .status-right {}

  .record-mockup {
    background: var(--black);
    border-radius: 20px;
    padding: 28px;
    color: #fff;
  }

  .record-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #1f1f1f;
  }

  .record-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--base-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter Tight', sans-serif;
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }

  .record-name {
    font-family: 'Inter Tight', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }

  .record-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(247,147,26,0.12);
    border: 1px solid rgba(247,147,26,0.25);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--btc-orange);
    letter-spacing: 0.5px;
  }

  .record-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .record-stat {
    background: #111;
    border-radius: 10px;
    padding: 14px;
    text-align: center;
  }

  .record-stat-num {
    font-family: 'Inter Tight', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.5px;
    margin-bottom: 3px;
  }

  .record-stat-label {
    font-size: 10px;
    color: #555;
    letter-spacing: 0.5px;
  }

  .record-attestations {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .attestation-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #111;
    border-radius: 8px;
  }

  .att-event {
    font-size: 12px;
    color: #aaa;
  }

  .att-badge {
    font-size: 10px;
    font-weight: 600;
    color: var(--base-blue);
    letter-spacing: 0.5px;
    background: rgba(0,82,255,0.1);
    border-radius: 4px;
    padding: 3px 7px;
  }

  .att-badge.verified {
    color: #4ade80;
    background: rgba(74,222,128,0.1);
  }

  .record-anti-rentier {
    margin-top: 16px;
    padding: 12px 16px;
    background: rgba(0,82,255,0.06);
    border-left: 2px solid var(--base-blue);
    border-radius: 0 8px 8px 0;
    font-size: 12px;
    color: #666;
    font-style: italic;
  }

  .record-anti-rentier strong { color: var(--base-blue); font-style: normal; }

  /* ── EVENT ACTIVATION ── */
  .activation-section { background: var(--black); }

  .activation-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .activation-left {}

  .activation-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--btc-orange);
    margin-bottom: 16px;
  }

  .activation-headline {
    font-family: 'Inter Tight', sans-serif;
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 800;
    letter-spacing: -1.5px;
    line-height: 1.05;
    color: #fff;
    margin-bottom: 20px;
  }

  .activation-body {
    font-size: 15px;
    line-height: 1.8;
    color: #777;
    margin-bottom: 32px;
  }

  .activation-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 32px;
  }

  .act-detail {
    display: flex;
    gap: 12px;
    align-items: baseline;
  }

  .act-detail-key {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #444;
    min-width: 80px;
  }

  .act-detail-val {
    font-size: 14px;
    color: #ccc;
  }

  .activation-right {}

  .event-card {
    background: #111;
    border: 1px solid #222;
    border-radius: 20px;
    overflow: hidden;
  }

  .event-card-img {
    width: 100%;
    aspect-ratio: 16/9;
    background: linear-gradient(135deg, #0A1628 0%, #0052FF 50%, #1a1a2e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .event-flyer-text {
    text-align: center;
    z-index: 1;
  }

  .event-flyer-city {
    font-family: 'Inter Tight', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    margin-bottom: 8px;
  }

  .event-flyer-title {
    font-family: 'Inter Tight', sans-serif;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -1px;
    color: #fff;
    line-height: 1;
    margin-bottom: 4px;
  }

  .event-flyer-sub {
    font-family: 'Inter Tight', sans-serif;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -1px;
    color: var(--btc-orange);
    line-height: 1;
  }

  .event-card-body {
    padding: 24px;
  }

  .event-card-date {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--btc-orange);
    margin-bottom: 8px;
  }

  .event-card-title {
    font-family: 'Inter Tight', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 8px;
  }

  .event-card-venue {
    font-size: 13px;
    color: #666;
    margin-bottom: 16px;
  }

  .event-card-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .event-tag {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .event-tag.eas { background: rgba(0,82,255,0.15); color: var(--base-blue); }
  .event-tag.free { background: rgba(74,222,128,0.1); color: #4ade80; }
  .event-tag.vip { background: rgba(247,147,26,0.1); color: var(--btc-orange); }

  .event-cta {
    display: block;
    text-align: center;
    background: var(--btc-orange);
    color: #fff;
    border-radius: 10px;
    padding: 14px;
    font-family: 'Inter Tight', sans-serif;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: background 0.15s;
  }

  .event-cta:hover { background: #e8841a; }

  /* ── COALITION ── */
  .coalition-section { background: var(--off-white); }

  .coalition-body {
    font-size: 16px;
    line-height: 1.8;
    color: #555;
    margin-bottom: 48px;
    max-width: 640px;
  }

  .coalition-cities {
    display: flex;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 48px;
  }

  .coalition-city {
    flex: 1;
    padding: 20px 16px;
    text-align: center;
    border-right: 1px solid var(--border);
    transition: background 0.15s;
  }

  .coalition-city:last-child { border-right: none; }

  .coalition-city:hover { background: #fff; }

  .city-num {
    font-family: 'Inter Tight', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #bbb;
    margin-bottom: 6px;
  }

  .city-name {
    font-family: 'Inter Tight', sans-serif;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: -0.3px;
    color: var(--black);
  }

  .city-name.active { color: var(--base-blue); }

  .city-status {
    font-size: 10px;
    color: #bbb;
    margin-top: 4px;
  }

  .city-status.active { color: var(--btc-orange); font-weight: 600; }

  .closing-line {
    font-family: 'Inter Tight', sans-serif;
    font-size: clamp(18px, 2.5vw, 26px);
    font-weight: 700;
    letter-spacing: -0.5px;
    color: #333;
    line-height: 1.4;
  }

  .closing-line .highlight { color: var(--black); }

  /* ── FINAL CTA ── */
  .final-cta-section {
    background: var(--black);
    text-align: center;
  }

  .final-cta-headline {
    font-family: 'Inter Tight', sans-serif;
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 800;
    letter-spacing: -2px;
    color: #fff;
    line-height: 1.05;
    margin-bottom: 20px;
  }

  .final-cta-headline .orange { color: var(--btc-orange); }

  .final-cta-sub {
    font-size: 16px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 40px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .final-cta-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ── FOOTER ── */
  footer {
    background: var(--black);
    border-top: 1px solid #1a1a1a;
    padding: 40px 32px;
  }

  .footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .footer-left {}

  .footer-logo {
    font-family: 'Inter Tight', sans-serif;
    font-weight: 800;
    font-size: 16px;
    letter-spacing: -0.5px;
    color: #fff;
    margin-bottom: 6px;
  }

  .footer-logo span { color: var(--base-blue); }

  .footer-slogan {
    font-size: 13px;
    color: #555;
  }

  .footer-slogan .orange { color: var(--btc-orange); }

  .footer-right {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .footer-link {
    font-size: 12px;
    color: #555;
    text-decoration: none;
    transition: color 0.15s;
  }

  .footer-link:hover { color: #aaa; }

  .footer-credit {
    font-size: 11px;
    color: #333;
    margin-top: 20px;
    text-align: center;
  }

  .footer-credit a { color: #555; text-decoration: none; }
  .footer-credit a:hover { color: #888; }

  /* ── RESPONSIVE ── */
  @media (max-width: 1100px) {
    .hero { grid-template-columns: 1fr 0.8fr; }
  }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 28px; padding: 24px 24px 0; }
    .hero-left-stack { order: 1; }
    .hero-right { order: 2; }
    .featured-events-grid { grid-template-columns: 1fr !important; }
    .featured-events-grid > div { border-right: none !important; border-bottom: 1px solid var(--border); }
    .featured-events-grid > div:last-child { border-bottom: none; }
    .featured-events-section { padding: 0 24px 36px !important; }
    .lanes-grid { grid-template-columns: 1fr; }
    .thesis-grid { grid-template-columns: 1fr; gap: 40px; }
    .merchant-inner { grid-template-columns: 1fr; gap: 40px; }
    .steps-grid { grid-template-columns: 1fr 1fr; }
    .step:nth-child(2) { border-right: none; }
    .step:nth-child(3) { border-right: 1px solid var(--border); border-top: 1px solid var(--border); }
    .step:nth-child(4) { border-right: none; border-top: 1px solid var(--border); }
    .status-grid { grid-template-columns: 1fr; gap: 40px; }
    .activation-inner { grid-template-columns: 1fr; gap: 40px; }
    .coalition-cities { flex-wrap: wrap; }
    .coalition-city { min-width: 33%; border-bottom: 1px solid var(--border); }
    .nav-links { display: none; }
    section { padding: 60px 24px; }
  }

  @media (max-width: 600px) {
    .steps-grid { grid-template-columns: 1fr; }
    .step { border-right: none !important; border-top: 1px solid var(--border); }
    .step:first-child { border-top: none; }
    .record-stats { grid-template-columns: 1fr 1fr 1fr; }
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-eyebrow { animation: fadeUp 0.5s ease both; }
  .hero-headline { animation: fadeUp 0.5s 0.1s ease both; }
  .hero-sub { animation: fadeUp 0.5s 0.2s ease both; }
  .hero-ctas { animation: fadeUp 0.5s 0.3s ease both; }
  .hero-right { animation: fadeUp 0.5s 0.2s ease both; }`;

  const pageHtml = `<!-- NAV -->
<nav>
  <a href="/" class="nav-logo">BASE<span>bloc</span>.app</a>
  <ul class="nav-links">
    <li><a href="#services">Services</a></li>
    <li><a href="#events">Events</a></li>
    <li><a href="#records">Records</a></li>
    <li><a href="#merchants">Merchants</a></li>
    <li><a href="#records" class="nav-cta">My Records</a></li>
  </ul>
</nav>

<!-- HERO -->
<section style="padding-bottom: 40px; padding-top: 0;">
  <div class="hero">

    <!-- LEFT STACK: copy + events preview -->
    <div class="hero-left-stack">

      <!-- Copy -->
      <div class="hero-left">
        <div class="hero-eyebrow">Orangessance · BASE Oakland bloc · Coalition 001 Presents</div>
        <h1 class="hero-headline tight">
          Community<br>
          coordination<br>
          <span class="infra-wrap">infrastructure<span class="infra-circle" aria-hidden="true"><svg viewBox="0 0 340 70" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><defs><filter id="iglow" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#iglow)" opacity="0.9"><ellipse cx="170" cy="38" rx="158" ry="22" fill="none" stroke="#0052FF" stroke-width="2.2" stroke-linecap="round" transform="rotate(-2 170 38)"/><ellipse cx="170" cy="38" rx="154" ry="19" fill="none" stroke="#0052FF" stroke-width="1.6" stroke-linecap="round" transform="rotate(2.5 170 38)"/><ellipse cx="170" cy="38" rx="162" ry="25" fill="none" stroke="#0052FF" stroke-width="1.1" stroke-linecap="round" transform="rotate(-1 170 38)"/></g></svg></span></span>
        </h1>
        <p class="hero-sub">
          BASEbloc.app helps communities keep more of the value they create — and turn participation into belonging that compounds. Every recognized action builds over time.
        </p>
        <div class="hero-ctas">
          <a href="#events" class="btn-primary">Explore Events</a>
          <a href="#host" class="btn-secondary">Host an Event</a>
        </div>
      </div>

      <!-- Events Preview (sits below copy, same left column) -->
      <div class="hero-events">
        <div class="events-block">
          <div class="events-block-header">
            <div>
              <div class="events-block-eyebrow">Featured Events</div>
              <div class="events-block-title tight">Live Network Activations</div>
            </div>
            <a href="#events" class="events-see-all">See all events →</a>
          </div>
          <div class="events-cards-list">
            <!-- Card 1: Featured -->
            <div class="ev-card">
              <div class="ev-thumb" style="position:relative; flex-shrink:0; overflow:hidden;">
                <img src="/flyer.png" alt="MY CITY OUR MUSIC" style="width:100%; height:100%; object-fit:cover; display:block;" />
                <div class="ev-badge-featured">FEATURED</div>
              </div>
              <div class="ev-body">
                <div class="ev-coalition">HipHopTV + Oakland XChange + CitiesABC · Coalition 001</div>
                <div class="ev-name tight">MY CITY OUR MUSIC</div>
                <div class="ev-date">May 23, 2026 · Henry J. Kaiser Center, Oakland</div>
                <div class="ev-tags">
                  <span class="ev-tag">Music</span>
                  <span class="ev-tag">Creative Industries</span>
                  <span class="ev-tag">AI Summit</span>
                </div>
                <div class="ev-actions">
                  <a href="#tickets" class="ev-btn-primary">Get Tickets</a>
                  <a href="#rsvp" class="ev-btn-secondary">RSVP on Base</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /hero-left-stack -->

    <!-- RIGHT: Participation Loop -->
    <div class="hero-right">
      <div class="loop-card">
        <div class="loop-label">The Participation Loop</div>
        <div class="loop-steps">
          <div class="loop-step">
            <div class="loop-num">01</div>
            <div class="loop-step-content">
              <div class="loop-step-verb">Join</div>
              <div class="loop-step-desc">Scan a QR, open your Coinbase Smart Wallet, execute your first gasless action. 60 seconds. No crypto experience needed.</div>
            </div>
          </div>
          <div class="loop-step">
            <div class="loop-num">02</div>
            <div class="loop-step-content">
              <div class="loop-step-verb">Act</div>
              <div class="loop-step-desc">Attend coalition events, support local merchants, contribute to the community. Every action is a signal.</div>
            </div>
          </div>
          <div class="loop-step">
            <div class="loop-num">03</div>
            <div class="loop-step-content">
              <div class="loop-step-verb">Own</div>
              <div class="loop-step-desc">Your participation is recorded onchain via EAS attestation. A permanent, portable credential no one can take from you.</div>
            </div>
          </div>
          <div class="loop-step">
            <div class="loop-num">04</div>
            <div class="loop-step-content">
              <div class="loop-step-verb">Return</div>
              <div class="loop-step-desc">Your record builds Bloc Status. Status unlocks access, opportunity, and recognition that compounds with every activation.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-num blue">&lt;60s</div>
          <div class="hero-stat-label">Gasless onboarding</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-num white">EAS</div>
          <div class="hero-stat-label">Schema #1354 · Base mainnet</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-num orange">$0</div>
          <div class="hero-stat-label">Gas fees for users</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-num">TBA</div>
          <div class="hero-stat-label">Cities in coalition network</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- THREE LANES -->
<section class="lanes-section" id="services">
  <div class="section-inner">
    <div class="section-eyebrow">What BASEbloc.app coordinates</div>
    <h2 class="section-headline">Three entry points.<br>One compounding record.</h2>
    <p class="section-sub">Events are where most people start. Services and commerce deepen the loop. Records make everything stick.</p>
    <div class="lanes-grid">
      <div class="lane-card">
        <div class="lane-icon blue">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052FF" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="lane-tag">Events</div>
        <div class="lane-title tight">Attendance becomes identity.</div>
        <p class="lane-body">Scan the QR at the door — your attestation flips to Verified. Not a ticket stub — a permanent EAS credential tied to your wallet address, recorded onchain the moment you walk in.</p>
        <div class="lane-examples">
          <span class="lane-example">Cultural summits and music events</span>
          <span class="lane-example">Workshops and masterclasses</span>
          <span class="lane-example">Coalition activations city-wide</span>
          <span class="lane-example">Virtual IRL crossover events</span>
        </div>
      </div>
      <div class="lane-card">
        <div class="lane-icon orange">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F7931A" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
        </div>
        <div class="lane-tag">Services</div>
        <div class="lane-title tight">Commerce builds your record.</div>
        <p class="lane-body">Zero BASEbloc platform fees for eligible community businesses. Fast USDC settlement on Base. Every transaction with a coalition merchant turns commerce into verified belonging — automatically.</p>
        <div class="lane-examples">
          <span class="lane-example">Barbershops and salons</span>
          <span class="lane-example">Community businesses and vendors</span>
          <span class="lane-example">Coalition merchant partners</span>
          <span class="lane-example">Recurring service providers</span>
        </div>
      </div>
      <div class="lane-card">
        <div class="lane-icon dark">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <div class="lane-tag">Records</div>
        <div class="lane-title tight">Proof that compounds.</div>
        <p class="lane-body">Your events and daily commerce feed the exact same shared community record. Every recognized participation signal — from door scans to merchant transactions — builds a single permanent, portable record that powers Bloc Status and unlocks access. Every recognized action adds to the ledger.</p>
        <div class="lane-examples">
          <span class="lane-example">EAS attestations per activation</span>
          <span class="lane-example">Bloc Status: Visitor → OG → Bloc Builder</span>
          <span class="lane-example">Portable identity across coalitions</span>
          <span class="lane-example">Access and opportunity unlocks</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- THESIS / WHY IT MATTERS -->
<section class="thesis-section">
  <div class="section-inner">
    <div class="section-eyebrow">Why this exists</div>
    <h2 class="section-headline">The extraction problem is real.<br>The fix is onchain.</h2>
    <div class="thesis-grid">
      <div class="thesis-left">
        <div class="thesis-quote">
          "Communities have always created value they couldn't keep. Platforms captured it. Institutions controlled it."
        </div>
        <p class="thesis-body" style="font-family:'Inter Tight',sans-serif; font-size:17px; font-weight:700; color:#0A0A0A; letter-spacing:-0.3px; line-height:1.5;">
          Bitcoin is a vault for those already positioned. BASEbloc is building a launchpad for everyone.
        </p>
        <p class="thesis-body">
          BASEbloc.app is built on a single premise: participation should compound for the people doing the participating. Not the platform. Not the landlord. Not the aggregator. And not anyone trying to hold standing they are no longer earning.
        </p>
        <p class="thesis-body">
          Onchain infrastructure makes contribution legible, verifiable, and ownable. It turns showing up into leverage. Reputation into portable capital. Community into durable infrastructure.
        </p>
        <p class="thesis-body">
          Your BASEbloc efforts (EAS attestations) on Base are forever.
        </p>
      </div>
      <div class="thesis-right">
        <div class="contrast-table">
          <div class="contrast-header">
            <div class="contrast-col-header left">Old model</div>
            <div class="contrast-col-header right">BASEbloc model</div>
          </div>
          <div class="contrast-row">
            <div class="contrast-cell left">Platform owns the record</div>
            <div class="contrast-cell right"><strong>You own the attestation</strong></div>
          </div>
          <div class="contrast-row">
            <div class="contrast-cell left">Data disappears when you leave</div>
            <div class="contrast-cell right"><strong>Immutable. Portable. Permanent.</strong></div>
          </div>
          <div class="contrast-row">
            <div class="contrast-cell left">Attendance = a receipt</div>
            <div class="contrast-cell right"><strong>Attendance = onchain identity</strong></div>
          </div>
          <div class="contrast-row">
            <div class="contrast-cell left">Status is purchased</div>
            <div class="contrast-cell right"><strong>Status is earned. Always.</strong></div>
          </div>
          <div class="contrast-row">
            <div class="contrast-cell left">Processing fees extracted</div>
            <div class="contrast-cell right"><strong>Keep what you earn. Base rails.</strong></div>
          </div>
          <div class="contrast-row">
            <div class="contrast-cell left">Community has no leverage</div>
            <div class="contrast-cell right"><strong>Participation is the leverage</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- MERCHANT WEDGE -->
<section class="merchant-section" id="merchants">
  <div class="section-inner">
    <div class="merchant-inner">
      <div class="merchant-left">
        <div class="merchant-eyebrow">Community Commerce</div>
        <h2 class="merchant-headline tight">Zero BASEbloc platform fees for eligible community businesses.</h2>
        <p class="merchant-body">
          Local businesses should not lose 3.0–3.5% of every sale to outside platforms when that value could stay in the neighborhood. BASEbloc.app helps eligible community merchants accept USDC on Base with fast settlement, lower costs, and a path to stronger customer return loops. No crypto experience required.
        </p>
        <div class="merchant-benefits">
          <div class="merchant-benefit">
            <div class="benefit-dot"></div>
            <div class="benefit-text">
              <div class="benefit-title">Keep more of what you earn</div>
              <div class="benefit-desc">A business doing $30K/month can preserve roughly $900–$1,050/month that would otherwise leave the neighborhood. The math closes itself.</div>
            </div>
          </div>
          <div class="merchant-benefit">
            <div class="benefit-dot"></div>
            <div class="benefit-text">
              <div class="benefit-title">Turn transactions into return behavior</div>
              <div class="benefit-desc">Each purchase can strengthen a customer's verified community record, making it easier to recognize regulars and reward real participation over time.</div>
            </div>
          </div>
          <div class="merchant-benefit">
            <div class="benefit-dot"></div>
            <div class="benefit-text">
              <div class="benefit-title">Belonging that compounds</div>
              <div class="benefit-desc">Customers and event attendees become recognized community members. Revenue, retention, and belonging start reinforcing each other.</div>
            </div>
          </div>
        </div>
        <a href="#" class="btn-orange-outline">Join the Merchant Pilot →</a>
      </div>
      <div class="merchant-right">
        <div class="math-card">
          <div class="math-label">The Math · Beast Mode Barbershop Pilot</div>
          <div class="math-row">
            <div class="math-key">Monthly card revenue</div>
            <div class="math-val white">$30,000</div>
          </div>
          <div class="math-row">
            <div class="math-key">Typical processor fees (3.0–3.5%)</div>
            <div class="math-val" style="color:#ef4444;">−$900 to −$1,050</div>
          </div>
          <div class="math-row">
            <div class="math-key">BASEbloc platform fee (eligible merchants)</div>
            <div class="math-val blue">$0</div>
          </div>
          <div class="math-row">
            <div class="math-key">Potential monthly recovery</div>
            <div class="math-val orange">+$900 to +$1,050</div>
          </div>
          <div class="math-row">
            <div class="math-key">Potential annual recovery</div>
            <div class="math-val orange">+$10,800 to +$12,600</div>
          </div>
          <div class="math-pilot">
            <strong>Active pilot:</strong> TBA · Oakland, CA · USDC settlement via Base
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="how-section">
  <div class="section-inner">
    <div class="section-eyebrow">How it works</div>
    <h2 class="section-headline">Join → Act → Own → Return.</h2>
    <p class="section-sub">Four steps. One loop. A record that compounds over every coalition, every city, every activation.</p>
    <div class="steps-grid">
      <div class="step">
        <div class="step-num">01 · JOIN</div>
        <div class="step-verb tight">Gasless onboarding.</div>
        <p class="step-desc">Walk up to the door. Scan the QR. Open your Coinbase Smart Wallet and your attestation flips to Verified — gasless, covered by Coinbase Paymaster. No app download. No crypto experience needed. Under 60 seconds from door to credential.</p>
        <div class="step-proof">Coinbase Smart Wallet · Paymaster</div>
      </div>
      <div class="step">
        <div class="step-num">02 · ACT</div>
        <div class="step-verb tight">Participate in your city.</div>
        <p class="step-desc">RSVP to events. Check in at the door. Transact with coalition merchants in USDC. Volunteer. Refer members. Perform or speak. Every action generates a signal. Every recognized signal can be recorded onchain.</p>
        <div class="step-proof">IRL + Online signals · Verified by coalition</div>
      </div>
      <div class="step">
        <div class="step-num">03 · OWN</div>
        <div class="step-verb tight">Earn verifiable identity.</div>
        <p class="step-desc">Participation is recorded onchain via EAS Schema #1354 on Base mainnet. You receive a permanent, portable credential tied to your wallet address. Immutable. Not transferable. Not purchasable. Yours.</p>
        <div class="step-proof">EAS Schema #1354 · Base mainnet</div>
      </div>
      <div class="step">
        <div class="step-num">04 · RETURN</div>
        <div class="step-verb tight">Build your Bloc Status.</div>
        <p class="step-desc">Your record accumulates Bloc Parti points. Points determine Bloc Status — Visitor, Participant, Contributor, OG, Bloc Builder. Status unlocks access, recognition, and opportunity. You can only earn it. Never buy it.</p>
        <div class="step-proof">Bloc Status · Anti-rentier by design</div>
      </div>
    </div>
  </div>
</section>

<!-- RECORDS / BLOC STATUS -->
<section class="status-section" id="records">
  <div class="section-inner">
    <div class="section-eyebrow">Your Bloc Status</div>
    <h2 class="section-headline">Reputation earned,<br>never purchased.</h2>
    <div class="status-grid">
      <div class="status-left">
        <p class="status-body">
          Bloc Status is a five-tier reputation system built on your verified participation record. Every IRL event, every coalition merchant transaction, every referral, every online contribution adds to your Bloc Parti points. Your status grows. It is additive and permanent. Nothing can be revoked.
        </p>
        <div class="status-tiers">
          <div class="tier-row">
            <div>
              <div class="tier-left">
                <div class="tier-dot" style="background:#888;"></div>
                <div class="tier-name tight">Visitor</div>
              </div>
              <div class="tier-desc">Any first verified touchpoint — You found us.</div>
            </div>
            <span class="tier-badge" style="background:#f5f5f5; color:#888;">Entry</span>
          </div>
          <div class="tier-row">
            <div>
              <div class="tier-left">
                <div class="tier-dot" style="background:#0052FF;"></div>
                <div class="tier-name tight">Participant</div>
              </div>
              <div class="tier-desc">Verified IRL attendance + basic online presence.</div>
            </div>
            <span class="tier-badge" style="background:#EEF3FF; color:#0052FF;">Active</span>
          </div>
          <div class="tier-row">
            <div>
              <div class="tier-left">
                <div class="tier-dot" style="background:#F7931A;"></div>
                <div class="tier-name tight">Contributor</div>
              </div>
              <div class="tier-desc">Multiple events + online contribution + referral activity.</div>
            </div>
            <span class="tier-badge" style="background:#FFF4E8; color:#F7931A;">Building</span>
          </div>
          <div class="tier-row">
            <div>
              <div class="tier-left">
                <div class="tier-dot" style="background:#FFD700;"></div>
                <div class="tier-name tight">OG</div>
              </div>
              <div class="tier-desc">Sustained IRL + online + hold duration + community roles.</div>
            </div>
            <span class="tier-badge" style="background:#FFFBE6; color:#b8860b;">You were here.</span>
          </div>
          <div class="tier-row">
            <div>
              <div class="tier-left">
                <div class="tier-dot" style="background:#0A0A0A;"></div>
                <div class="tier-name tight">Bloc Builder</div>
              </div>
              <div class="tier-desc">Hosted or co-organized a coalition activation. You are infrastructure.</div>
            </div>
            <span class="tier-badge" style="background:#0A0A0A; color:#fff;">Infrastructure</span>
          </div>
        </div>
      </div>
      <div class="status-right">
        <div class="record-mockup">
          <div class="record-header">
            <div class="record-avatar">JB</div>
            <div>
              <div class="record-name">Oakland Member</div>
              <div class="record-status-badge">OG · BASE Oakland bloc</div>
            </div>
          </div>
          <div class="record-stats">
            <div class="record-stat">
              <div class="record-stat-num">7</div>
              <div class="record-stat-label">Activations</div>
            </div>
            <div class="record-stat">
              <div class="record-stat-num" style="color: var(--base-blue);">340</div>
              <div class="record-stat-label">Bloc Parti Pts</div>
            </div>
            <div class="record-stat">
              <div class="record-stat-num" style="color: var(--btc-orange);">12</div>
              <div class="record-stat-label">Referrals</div>
            </div>
          </div>
          <div class="record-attestations">
            <div class="attestation-row">
              <div class="att-event">MY CITY OUR MUSIC · May 23, 2026</div>
              <div class="att-badge verified">Verified ✓</div>
            </div>
            <div class="attestation-row">
              <div class="att-event">Coalition 001 Pre-summit Masterclass</div>
              <div class="att-badge verified">Verified ✓</div>
            </div>
            <div class="attestation-row">
              <div class="att-event">Oakland Barbershop · USDC tx</div>
              <div class="att-badge">EAS #1354</div>
            </div>
            <div class="attestation-row">
              <div class="att-event">Base is for everyone · X community</div>
              <div class="att-badge">Online signal</div>
            </div>
          </div>
          <div class="record-anti-rentier">
            <strong>Bloc Status is earned, never purchased.</strong> Permanent and additive. Your record follows you across every coalition and every city.
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- COALITION 001 ACTIVATION -->
<section class="activation-section" id="activation">
  <div class="section-inner">
    <div class="activation-inner">
      <div class="activation-left">
        <div class="activation-eyebrow">Coalition 001 Activation</div>
        <h2 class="activation-headline tight">The proof moment<br>is May 23.</h2>
        <p class="activation-body">
          MY CITY OUR MUSIC is the first large-scale proof of the BASEbloc.app coordination model. 1,000–1,500 attendees. Every one gets a gasless onchain credential. Every check-in flips a verified EAS attestation. The receipts come from Oakland.
        </p>
        <div class="activation-details">
          <div class="act-detail">
            <div class="act-detail-key">Date</div>
            <div class="act-detail-val">May 23, 2026</div>
          </div>
          <div class="act-detail">
            <div class="act-detail-key">Venue</div>
            <div class="act-detail-val">Henry J. Kaiser Center for the Arts, Oakland</div>
          </div>
          <div class="act-detail">
            <div class="act-detail-key">Produced</div>
            <div class="act-detail-val">HipHopTV × CitiesABC</div>
          </div>
          <div class="act-detail">
            <div class="act-detail-key">Speakers</div>
            <div class="act-detail-val">TBA</div>
          </div>
          <div class="act-detail">
            <div class="act-detail-key">Credential</div>
            <div class="act-detail-val">EAS Schema #1354 · gasless · every attendee</div>
          </div>
        </div>
        <a href="https://basebloc.app/events" class="btn-primary">Get Tickets</a>
      </div>
      <div class="activation-right">
        <div class="event-card">
          <!-- Real flyer image -->
          <img src="/flyer.png" alt="MY CITY OUR MUSIC — May 23, 2026" style="width:100%; display:block; border-radius:16px 16px 0 0; object-fit:cover; aspect-ratio:16/9;" />
          <div class="event-card-body">
            <div class="event-card-date">May 23, 2026</div>
            <div class="event-card-title tight">MY CITY OUR MUSIC</div>
            <div class="event-card-venue">Henry J. Kaiser Center for the Arts · Oakland, CA</div>
            <div class="event-card-tags">
              <span class="event-tag eas">EAS Credential</span>
              <span class="event-tag vip">VIP Available</span>
            </div>
            <a href="https://basebloc.app/events" class="event-cta">RSVP — Secure Your Spot</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- LIVE NETWORK ACTIVATIONS -->
<section id="events" style="padding: 80px 0; background: #fff; border-top: 1px solid var(--border);">
  <div style="max-width: 1280px; margin: 0 auto; padding: 0 32px;">

    <!-- Header row -->
    <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-bottom: 48px; flex-wrap:wrap; gap:16px;">
      <div>
        <div style="font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--base-blue); margin-bottom:10px;">Featured Events</div>
        <h2 style="font-family:'Inter Tight',sans-serif; font-size:clamp(32px,4vw,56px); font-weight:800; letter-spacing:-2px; line-height:1.05; color:var(--black); margin-bottom:10px;">Live Network Activations</h2>
        <p style="font-size:15px; color:#666; line-height:1.6; max-width:520px;">Coalition-led activations powered by BASEbloc.app across the BASEbloc.org network.</p>
      </div>
      <a href="https://basebloc.app/events" style="display:inline-flex; align-items:center; gap:8px; font-family:'Inter Tight',sans-serif; font-size:13px; font-weight:600; color:var(--black); text-decoration:none; border:1.5px solid var(--border); border-radius:10px; padding:10px 18px; white-space:nowrap; flex-shrink:0;">See all events →</a>
    </div>

    <!-- 3-card grid -->
    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">

      <!-- Card 1: Coming Soon -->
      <div style="border:1px solid var(--border); border-radius:20px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">
        <div style="aspect-ratio:4/3; background:#f2f2f2; display:flex; align-items:center; justify-content:center;">
          <span style="font-family:'Inter Tight',sans-serif; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#ccc;">COMING SOON</span>
        </div>
        <div style="padding:22px; flex:1; display:flex; flex-direction:column; gap:8px;">
          <div style="font-family:'Inter Tight',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#ccc;">BASEbloc.org Network</div>
          <div style="font-family:'Inter Tight',sans-serif; font-size:24px; font-weight:800; letter-spacing:-0.5px; color:#ccc;">TBA</div>
          <div style="margin-top:auto; padding-top:16px;">
            <a href="https://basebloc.app/events" style="display:inline-block; background:transparent; color:#aaa; border:1px solid #e0e0e0; font-family:'Inter Tight',sans-serif; font-size:12px; font-weight:500; padding:8px 16px; border-radius:8px; text-decoration:none;">Notify Me</a>
          </div>
        </div>
      </div>

      <!-- Card 2: Coming Soon -->
      <div style="border:1px solid var(--border); border-radius:20px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">
        <div style="aspect-ratio:4/3; background:#f2f2f2; display:flex; align-items:center; justify-content:center;">
          <span style="font-family:'Inter Tight',sans-serif; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#ccc;">COMING SOON</span>
        </div>
        <div style="padding:22px; flex:1; display:flex; flex-direction:column; gap:8px;">
          <div style="font-family:'Inter Tight',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#ccc;">BASEbloc.org Network</div>
          <div style="font-family:'Inter Tight',sans-serif; font-size:24px; font-weight:800; letter-spacing:-0.5px; color:#ccc;">TBA</div>
          <div style="margin-top:auto; padding-top:16px;">
            <a href="https://basebloc.app/events" style="display:inline-block; background:transparent; color:#aaa; border:1px solid #e0e0e0; font-family:'Inter Tight',sans-serif; font-size:12px; font-weight:500; padding:8px 16px; border-radius:8px; text-decoration:none;">Notify Me</a>
          </div>
        </div>
      </div>

      <!-- Card 3: Coming Soon -->
      <div style="border:1px solid var(--border); border-radius:20px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">
        <div style="aspect-ratio:4/3; background:#f2f2f2; display:flex; align-items:center; justify-content:center;">
          <span style="font-family:'Inter Tight',sans-serif; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#ccc;">COMING SOON</span>
        </div>
        <div style="padding:22px; flex:1; display:flex; flex-direction:column; gap:8px;">
          <div style="font-family:'Inter Tight',sans-serif; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#ccc;">BASEbloc.org Network</div>
          <div style="font-family:'Inter Tight',sans-serif; font-size:24px; font-weight:800; letter-spacing:-0.5px; color:#ccc;">TBA</div>
          <div style="margin-top:auto; padding-top:16px;">
            <a href="https://basebloc.app/events" style="display:inline-block; background:transparent; color:#aaa; border:1px solid #e0e0e0; font-family:'Inter Tight',sans-serif; font-size:12px; font-weight:500; padding:8px 16px; border-radius:8px; text-decoration:none;">Notify Me</a>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- COALITION -->
<section class="coalition-section">
  <div class="section-inner">
    <div class="section-eyebrow">The network</div>
    <h2 class="section-headline">Oakland is Coalition 001.<br>This is just the start.</h2>
    <p class="coalition-body">
      The BASE Oakland bloc playbook — cultural trust, gasless onboarding, EAS attestations, Bloc Status — is designed to replicate city by city. Same infrastructure. Same loop. Different trusted operators, different communities.
    </p>
    <div class="coalition-cities">
      <div class="coalition-city">
        <div class="city-num">001</div>
        <div class="city-name active tight">Oakland</div>
        <div class="city-status active">Live · BASEoak.org</div>
      </div>
      <div class="coalition-city">
        <div class="city-num">002</div>
        <div class="city-name tight">Boston</div>
        <div class="city-status">BASEbos.org · Coming</div>
      </div>
      <div class="coalition-city">
        <div class="city-num">003</div>
        <div class="city-name tight">Los Angeles</div>
        <div class="city-status">BASElabloc.org · Coming</div>
      </div>
      <div class="coalition-city">
        <div class="city-num">004</div>
        <div class="city-name tight">Houston</div>
        <div class="city-status">BASEhtx.org · Coming</div>
      </div>
      <div class="coalition-city">
        <div class="city-num">005</div>
        <div class="city-name tight">Atlanta</div>
        <div class="city-status">BASEatl.org · Coming</div>
      </div>
      <div class="coalition-city">
        <div class="city-num">006</div>
        <div class="city-name tight">New York</div>
        <div class="city-status">BASEnycbloc.org · Coming</div>
      </div>
    </div>
    <div class="closing-line tight">
      BASE Oakland bloc <span class="highlight">gets bigger with every coalition, every city, every activation.</span>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="final-cta-section">
  <div class="section-inner" style="text-align: center;">
    <h2 class="final-cta-headline tight">Power to the People.<br><span class="orange">Onchain.</span></h2>
    <p class="final-cta-sub">
      Your participation builds something that lasts. Start your record, earn your Bloc Status, and bring BASEbloc.app to your coalition, event, or business.
    </p>
    <div class="final-cta-buttons">
      <a href="#" class="btn-primary">Connect Wallet — Start Your Record</a>
      <a href="#" class="btn-orange-outline" style="color: var(--btc-orange);">Bring BASEbloc to Your City →</a>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-left">
      <div class="footer-logo">BASE<span>bloc</span>.app</div>
      <div class="footer-slogan">Power to the People. <span class="orange">Onchain.</span></div>
    </div>
    <div class="footer-right">
      <a href="https://baseiq.app" class="footer-link">baseiq.app</a>
      <a href="https://baseoak.org" class="footer-link">BASEoak.org</a>
      <a href="https://basebloc.org" class="footer-link">BASEbloc.org</a>
      <a href="/cdn-cgi/l/email-protection#127e77737652707361777d73793c7d6075" class="footer-link">Contact</a>
    </div>
  </div>
  <div class="footer-credit">
    Courtesy of <a href="https://orangessance.com">Orangessance</a>
  </div>
</footer>`;

  return (
    <>
      <style jsx global>{styles}</style>
      <main dangerouslySetInnerHTML={{ __html: pageHtml }} />
    </>
  );
}
