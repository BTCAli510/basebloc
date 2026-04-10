import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Events — BASEbloc.app",
  description: "Coalition-led activations powered by BASEbloc.app across the BASEbloc.org network.",
};

export default function EventsPage() {
  return (
    <main style={{ background: "#fff", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E8E8E8",
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Link href="/" style={{
          fontFamily: "'Inter Tight', sans-serif", fontWeight: 800,
          fontSize: 18, letterSpacing: "-0.5px", color: "#0A0A0A", textDecoration: "none"
        }}>
          BASE<span style={{ color: "#0052FF" }}>bloc</span>.app
        </Link>
        <ul style={{ display: "flex", alignItems: "center", gap: 4, listStyle: "none", margin: 0, padding: 0 }}>
          {[
            { label: "Services", href: "/#services" },
            { label: "Events", href: "/events", active: true },
            { label: "Records", href: "/#records" },
            { label: "Merchants", href: "/#merchants" },
          ].map(({ label, href, active }) => (
            <li key={label}>
              <Link href={href} style={{
                fontSize: 13, fontWeight: 500, padding: "6px 12px",
                borderRadius: 6, textDecoration: "none",
                color: active ? "#0052FF" : "#555",
                background: active ? "rgba(0,82,255,0.06)" : "transparent",
              }}>
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/#records" style={{
              background: "#F7931A", color: "#fff",
              fontFamily: "'Inter Tight', sans-serif", fontWeight: 600,
              fontSize: 13, padding: "8px 16px", borderRadius: 8, textDecoration: "none",
              marginLeft: 8, display: "inline-block"
            }}>
              My Records
            </Link>
          </li>
        </ul>
      </nav>

      {/* ── PAGE HEADER ── */}
      <section style={{ padding: "80px 32px 64px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "3px",
            textTransform: "uppercase", color: "#0052FF", marginBottom: 12
          }}>
            Featured Events
          </div>
          <h1 style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 800, letterSpacing: "-2.5px",
            lineHeight: 1.02, color: "#0A0A0A", marginBottom: 16
          }}>
            Live Network Activations
          </h1>
          <p style={{ fontSize: 16, color: "#666", lineHeight: 1.7, maxWidth: 520 }}>
            Coalition-led activations powered by BASEbloc.app across the BASEbloc.org network.
          </p>
        </div>

        {/* ── 3-CARD GRID ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 24
        }}>

          {/* ── CARD 1: MY CITY OUR MUSIC ── */}
          <div style={{
            border: "2px solid #0052FF", borderRadius: 20,
            overflow: "hidden", background: "#fff",
            display: "flex", flexDirection: "column"
          }}>
            {/* Flyer image */}
            <div style={{ position: "relative", aspectRatio: "16/9" }}>
              <Image
                src="/flyer.png"
                alt="MY CITY OUR MUSIC — May 23, 2026"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              {/* Featured badge */}
              <div style={{
                position: "absolute", top: 14, left: 14,
                background: "#0052FF", color: "#fff",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 10, fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", padding: "5px 10px", borderRadius: 6
              }}>
                FEATURED
              </div>
              {/* Date stamp */}
              <div style={{
                position: "absolute", bottom: 14, right: 14,
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.9)",
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 10, fontWeight: 600, letterSpacing: "1px",
                padding: "4px 10px", borderRadius: 6
              }}>
                MAY 23, 2026
              </div>
            </div>
            {/* Card body */}
            <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{
                fontFamily: "'Inter Tight', sans-serif", fontSize: 10,
                fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", color: "#0052FF"
              }}>
                HipHopTV + Oakland XChange + CitiesABC · Coalition 001
              </div>
              <div style={{
                fontFamily: "'Inter Tight', sans-serif", fontSize: 22,
                fontWeight: 800, letterSpacing: "-0.5px", color: "#0A0A0A", lineHeight: 1.1
              }}>
                MY CITY OUR MUSIC
              </div>
              <div style={{ fontSize: 13, color: "#888" }}>
                May 23, 2026 · Henry J. Kaiser Center for the Arts, Oakland CA
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {["Music", "Creative Industries", "AI Summit"].map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20,
                    border: "1px solid #E8E8E8", color: "#555"
                  }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#aaa" }}>
                <span style={{ color: "#ddd" }}>—</span> verified RSVPs
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 12 }}>
                <a href="https://basebloc.app/rsvp" style={{
                  flex: 1, textAlign: "center" as const,
                  background: "#0052FF", color: "#fff",
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 14, fontWeight: 700,
                  padding: "12px 16px", borderRadius: 8, textDecoration: "none"
                }}>
                  Get Tickets
                </a>
                <a href="https://basebloc.app/rsvp" style={{
                  flex: 1, textAlign: "center" as const,
                  background: "transparent", color: "#0052FF",
                  border: "1.5px solid #0052FF",
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 14, fontWeight: 700,
                  padding: "12px 16px", borderRadius: 8, textDecoration: "none"
                }}>
                  RSVP on Base
                </a>
              </div>
            </div>
          </div>

          {/* ── CARD 2: COMING SOON ── */}
          <ComingSoonCard />

          {/* ── CARD 3: COMING SOON ── */}
          <ComingSoonCard />

        </div>
      </section>

      {/* ── HOST CTA BAND ── */}
      <section style={{
        background: "#F8F8F6", borderTop: "1px solid #E8E8E8",
        padding: "56px 32px"
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap" as const, gap: 24
        }}>
          <div>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif", fontSize: 11,
              fontWeight: 700, letterSpacing: "3px",
              textTransform: "uppercase", color: "#0052FF", marginBottom: 10
            }}>
              For Coalition Organizers
            </div>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif", fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 800, letterSpacing: "-1px", color: "#0A0A0A", marginBottom: 8
            }}>
              Bring BASEbloc to your activation.
            </h2>
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7 }}>
              EAS credentials, gasless onboarding, and Bloc Status — for any coalition, city, or event.
            </p>
          </div>
          <a href="mailto:lead@baseoak.org" style={{
            background: "#0052FF", color: "#fff",
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 700, fontSize: 14,
            padding: "14px 28px", borderRadius: 10, textDecoration: "none",
            whiteSpace: "nowrap" as const, flexShrink: 0
          }}>
            Host an Event →
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid #E8E8E8",
        padding: "40px 32px",
        maxWidth: 1280, margin: "0 auto"
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap" as const, gap: 20, marginBottom: 24
        }}>
          <div>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif", fontWeight: 800,
              fontSize: 18, letterSpacing: "-0.5px", color: "#0A0A0A"
            }}>
              BASE<span style={{ color: "#0052FF" }}>bloc</span>.app
            </div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
              Power to the People.{" "}
              <span style={{ color: "#F7931A", fontWeight: 600 }}>Onchain.</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "BASEoak.org", href: "https://baseoak.org" },
              { label: "BASEbloc.org", href: "https://basebloc.org" },
              { label: "Contact", href: "mailto:lead@baseoak.org" },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{
                fontSize: 13, color: "#888", textDecoration: "none"
              }}>{label}</a>
            ))}
          </div>
        </div>
        <div style={{
          fontSize: 12, color: "#bbb",
          borderTop: "1px solid #E8E8E8", paddingTop: 20
        }}>
          Courtesy of{" "}
          <a href="https://orangessance.com" style={{ color: "#bbb", textDecoration: "none" }}>
            Orangessance
          </a>.
        </div>
      </footer>

    </main>
  );
}

function ComingSoonCard() {
  return (
    <div style={{
      border: "1px solid #E8E8E8", borderRadius: 20,
      overflow: "hidden", background: "#fff",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{
        aspectRatio: "16/9", background: "#f2f2f2",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{
          fontFamily: "'Inter Tight', sans-serif", fontSize: 11,
          fontWeight: 700, letterSpacing: "3px",
          textTransform: "uppercase" as const, color: "#ccc"
        }}>
          COMING SOON
        </span>
      </div>
      <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          fontFamily: "'Inter Tight', sans-serif", fontSize: 10,
          fontWeight: 700, letterSpacing: "1.5px",
          textTransform: "uppercase" as const, color: "#ccc"
        }}>
          BASEbloc.org Network
        </div>
        <div style={{
          fontFamily: "'Inter Tight', sans-serif", fontSize: 24,
          fontWeight: 800, letterSpacing: "-0.5px", color: "#ccc"
        }}>
          TBA
        </div>
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <a href="mailto:lead@baseoak.org" style={{
            display: "inline-block", background: "transparent",
            color: "#aaa", border: "1px solid #e0e0e0",
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 12, fontWeight: 500,
            padding: "8px 16px", borderRadius: 8, textDecoration: "none"
          }}>
            Notify Me
          </a>
        </div>
      </div>
    </div>
  );
}
