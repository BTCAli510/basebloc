'use client';

import { useState, useEffect } from "react";

export default function Home() {
  const [countdown, setCountdown] = useState({ days: '00', hrs: '00', min: '00', sec: '00' });
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [hostForm, setHostForm] = useState({ name: '', email: '', event: '', size: '' });

  useEffect(() => {
    const target = new Date('2026-05-23T10:00:00-07:00');
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({
        days: String(d).padStart(2, '0'),
        hrs: String(h).padStart(2, '0'),
        min: String(m).padStart(2, '0'),
        sec: String(s).padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleHostSubmit = () => {
    if (!hostForm.name || !hostForm.email || !hostForm.event) {
      showToast('Please fill in all fields first.');
      return;
    }
    showToast(`Thanks ${hostForm.name}! We'll be in touch within 48 hours.`);
    setHostForm({ name: '', email: '', event: '', size: '' });
  };

  const scrollToHost = () => {
    setTimeout(() => {
      document.getElementById('host')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{--blue:#0052FF;--blue-dim:#0040CC;--black:#0A0A0A;--white:#FFFFFF;--gray-50:#F7F7F7;--gray-100:#EFEFEF;--gray-300:#CCCCCC;--gray-500:#888888;--gray-700:#444444;}
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;background:#fff;color:#0A0A0A;overflow-x:hidden;}
        .syne{font-family:'Syne',sans-serif;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        .dot-pulse{animation:pulse 2s infinite;}
        .carousel::-webkit-scrollbar{height:4px;}
        .carousel::-webkit-scrollbar-track{background:#EFEFEF;border-radius:4px;}
        .carousel::-webkit-scrollbar-thumb{background:#0052FF;border-radius:4px;}
        .event-card-clickable:hover{transform:translateY(-4px);border-color:rgba(0,82,255,0.2)!important;box-shadow:0 20px 40px rgba(0,82,255,0.08);}
        .eco-card:hover{border-color:#0052FF!important;transform:translateY(-2px);}
        .host-input:focus{border-color:#0052FF!important;outline:none;}
        .btn-ghost-nav:hover{border-color:#0052FF!important;color:#0052FF!important;}
        .btn-lg-secondary:hover{border-color:#0052FF!important;color:#0052FF!important;}
        .back-btn:hover{color:#0052FF!important;}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(255,255,255,0.97)',backdropFilter:'blur(10px)',borderBottom:'1px solid #EFEFEF',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div
          className="syne"
          style={{fontWeight:800,fontSize:18,color:'#0A0A0A',letterSpacing:'-0.5px',cursor:'pointer'}}
          onClick={() => window.scrollTo(0,0)}
        >
          BASE <span style={{color:'#0052FF'}}>bloc</span>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <button
            className="btn-ghost-nav"
            style={{background:'none',border:'1px solid #CCCCCC',color:'#0A0A0A',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:500,padding:'8px 16px',borderRadius:8,cursor:'pointer',transition:'all 0.2s'}}
            onClick={() => showToast('Records coming soon — building now!')}
          >My Records</button>
          <button
            style={{background:'#0052FF',border:'none',color:'#fff',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:500,padding:'8px 18px',borderRadius:8,cursor:'pointer',transition:'all 0.2s'}}
            onClick={scrollToHost}
          >Host an Event</button>
        </div>
      </nav>

      {/* HOME PAGE */}
      <div>

        {/* HERO */}
        <section style={{padding:'72px 24px 48px',textAlign:'center',maxWidth:760,margin:'0 auto'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#F7F7F7',border:'1px solid #EFEFEF',borderRadius:100,padding:'6px 14px',fontSize:12,fontWeight:500,color:'#444444',marginBottom:24}}>
            <span className="dot-pulse" style={{width:6,height:6,background:'#0052FF',borderRadius:'50%',display:'inline-block'}}></span>
            Built on Base · Powered by EAS
          </div>
          <h1 className="syne" style={{fontSize:'clamp(36px,6vw,62px)',fontWeight:800,lineHeight:1.05,letterSpacing:'-2px',marginBottom:20}}>
            Where showing up <span style={{color:'#0052FF'}}>goes onchain.</span>
          </h1>
          <p style={{fontSize:17,lineHeight:1.65,color:'#888888',maxWidth:520,margin:'0 auto 36px'}}>
            BASE bloc converts real-world cultural participation into verified onchain records — turning every check-in, RSVP, and action into a permanent piece of your identity.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button
              style={{padding:'14px 28px',borderRadius:10,fontSize:15,fontWeight:500,fontFamily:'DM Sans,sans-serif',cursor:'pointer',background:'#0052FF',color:'#fff',border:'none',transition:'all 0.2s'}}
              onClick={() => document.getElementById('events')?.scrollIntoView({behavior:'smooth'})}
            >Explore Events</button>
            <button
              className="btn-lg-secondary"
              style={{padding:'14px 28px',borderRadius:10,fontSize:15,fontWeight:500,fontFamily:'DM Sans,sans-serif',cursor:'pointer',background:'#fff',color:'#0A0A0A',border:'1.5px solid #CCCCCC',transition:'all 0.2s'}}
              onClick={scrollToHost}
            >Host an Event</button>
          </div>
          <div style={{marginTop:32,fontSize:12,color:'#888888',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <strong style={{color:'#0A0A0A'}}>3</strong> verified RSVPs onchain ·&nbsp;<strong style={{color:'#0A0A0A'}}>May 23</strong>&nbsp;· Oakland · More cities coming
          </div>
        </section>

        {/* EVENTS */}
        <section style={{padding:'64px 24px'}} id="events">
          <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:32,flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'#0052FF',marginBottom:8}}>Featured Events</div>
              <div className="syne" style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:700,letterSpacing:'-1px',marginBottom:8}}>What&apos;s on Base</div>
              <div style={{fontSize:15,color:'#888888'}}>Real-world events. Verified participation. Permanent records.</div>
            </div>
            <button
              style={{background:'none',border:'1px solid #CCCCCC',color:'#0A0A0A',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:500,padding:'8px 16px',borderRadius:8,cursor:'pointer'}}
              onClick={() => showToast('See all events — coming soon')}
            >See all events →</button>
          </div>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div className="carousel" style={{display:'flex',gap:20,overflowX:'auto',scrollSnapType:'x mandatory',WebkitOverflowScrolling:'touch',paddingBottom:16}}>

              {/* FEATURED CARD — now routes to real URL */}
              <div
                className="event-card-clickable"
                style={{minWidth:300,maxWidth:300,border:'1px solid #EFEFEF',borderRadius:16,overflow:'hidden',scrollSnapAlign:'start',background:'#fff',transition:'all 0.3s',flexShrink:0,cursor:'pointer'}}
                onClick={() => window.location.href = '/events/my-city-our-music'}
              >
                <div style={{height:180,position:'relative',overflow:'hidden'}}>
                  <img src="/event-flyer.png" alt="My City Our Music" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                  <div style={{position:'absolute',top:12,left:12,background:'#0052FF',color:'#fff',fontSize:10,fontWeight:600,letterSpacing:'1.5px',textTransform:'uppercase',padding:'4px 10px',borderRadius:100}}>Featured</div>
                </div>
                <div style={{padding:16}}>
                  <div style={{fontSize:11,fontWeight:600,letterSpacing:1,textTransform:'uppercase',color:'#0052FF',marginBottom:4}}>Hip Hop TV &amp; Citiesabc Present</div>
                  <div className="syne" style={{fontSize:17,fontWeight:700,letterSpacing:'-0.5px',marginBottom:8,lineHeight:1.2}}>My City Our Music</div>
                  <div style={{fontSize:12,color:'#888888',display:'flex',flexDirection:'column',gap:3,marginBottom:12}}>
                    <span>May 23, 2026</span>
                    <span>Henry J. Kaiser Center · Oakland</span>
                  </div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                    {['Music','Creative Industries','AI Summit'].map(t => (
                      <span key={t} style={{fontSize:11,background:'#F7F7F7',color:'#444444',border:'1px solid #EFEFEF',padding:'3px 8px',borderRadius:100}}>{t}</span>
                    ))}
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{fontSize:12,color:'#888888'}}><strong style={{color:'#0052FF'}}>3</strong> verified RSVPs</div>
                    <button
                      style={{background:'#0052FF',color:'#fff',border:'none',fontSize:12,fontWeight:600,padding:'7px 16px',borderRadius:7,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}
                      onClick={e => { e.stopPropagation(); window.location.href = '/events/my-city-our-music'; }}
                    >View Event</button>
                  </div>
                </div>
              </div>

              {/* PLACEHOLDER CARDS */}
              {[
                {city:'Bay Area · Summer 2026',name:'Cultural Event TBA',tags:['Culture','Community']},
                {city:'Los Angeles · Fall 2026',name:'Arts & Tech Summit TBA',tags:['Arts','Technology']},
                {city:'New York · Winter 2026',name:'Creator Economy Forum TBA',tags:['Creators','Web3']},
              ].map((ev,i) => (
                <div key={i} style={{minWidth:300,maxWidth:300,border:'1px solid #EFEFEF',borderRadius:16,overflow:'hidden',scrollSnapAlign:'start',background:'#fff',transition:'all 0.3s',flexShrink:0,opacity:0.65}}>
                  <div style={{height:180,background:['#111','#001a33','#0d1a0d'][i],display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    <div style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.7)',color:'#fff',fontSize:10,fontWeight:600,letterSpacing:'1.5px',textTransform:'uppercase',padding:'4px 10px',borderRadius:100}}>Coming Soon</div>
                    <span style={{fontFamily:'Syne,sans-serif',color:'rgba(255,255,255,0.4)',fontSize:13,fontWeight:700}}>Coming Soon</span>
                  </div>
                  <div style={{padding:16}}>
                    <div style={{fontSize:11,fontWeight:600,letterSpacing:1,textTransform:'uppercase',color:'#aaa',marginBottom:4}}>{ev.city}</div>
                    <div className="syne" style={{fontSize:17,fontWeight:700,letterSpacing:'-0.5px',marginBottom:8,lineHeight:1.2,color:'#aaa'}}>{ev.name}</div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                      {ev.tags.map(t => <span key={t} style={{fontSize:11,background:'#F7F7F7',color:'#444444',border:'1px solid #EFEFEF',padding:'3px 8px',borderRadius:100}}>{t}</span>)}
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{fontSize:12,color:'#aaa'}}>Announcing soon</div>
                      <button style={{background:'#ccc',color:'#fff',border:'none',fontSize:12,fontWeight:600,padding:'7px 16px',borderRadius:7,cursor:'default',fontFamily:'DM Sans,sans-serif'}} onClick={() => showToast('Stay tuned!')}>Notify Me</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* HOST CTA CARD */}
              <div
                style={{minWidth:280,maxWidth:280,border:'2px dashed rgba(0,82,255,0.25)',borderRadius:16,background:'rgba(0,82,255,0.02)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px',textAlign:'center',cursor:'pointer',scrollSnapAlign:'start',flexShrink:0,transition:'all 0.2s'}}
                onClick={scrollToHost}
              >
                <div style={{width:48,height:48,background:'rgba(0,82,255,0.1)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,fontSize:22,color:'#0052FF',fontWeight:700}}>+</div>
                <div className="syne" style={{fontSize:17,fontWeight:700,marginBottom:8,color:'#0052FF'}}>Host Your Event</div>
                <div style={{fontSize:13,color:'#888888',lineHeight:1.5,marginBottom:18}}>Bring verifiable participation to your community with BASE bloc.</div>
                <button style={{background:'#0052FF',color:'#fff',border:'none',fontSize:12,fontWeight:600,padding:'10px 20px',borderRadius:8,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>Get Started</button>
              </div>

            </div>
          </div>
        </section>

        <div style={{height:1,background:'#EFEFEF',margin:'0 24px'}}></div>

        {/* HOST SECTION */}
        <section id="host" style={{background:'#0A0A0A',color:'#fff',padding:'80px 24px'}}>
          <div style={{maxWidth:900,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'rgba(0,82,255,0.8)',marginBottom:12}}>For Event Organizers</div>
              <h2 className="syne" style={{fontSize:'clamp(28px,4vw,42px)',fontWeight:800,lineHeight:1.1,letterSpacing:'-1.5px',marginBottom:16}}>
                Host an event.<br /><span style={{color:'#0052FF'}}>Make it onchain.</span>
              </h2>
              <p style={{fontSize:15,lineHeight:1.7,color:'rgba(255,255,255,0.6)',marginBottom:28}}>
                Run a venue, a festival, or a community gathering? BASE bloc gives your attendees permanent, verifiable proof of participation — no tickets to lose, no receipts to forget.
              </p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                {[
                  {num:'100%',label:'Gasless for attendees via Coinbase Paymaster'},
                  {num:'$0',label:'Cost for attendees to claim their verified record'},
                ].map(s => (
                  <div key={s.num} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:20}}>
                    <div className="syne" style={{fontSize:32,fontWeight:800,color:'#0052FF',marginBottom:4}}>{s.num}</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.4}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',alignItems:'flex-start',gap:12,padding:16,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,marginTop:20}}>
                <div style={{width:32,height:32,background:'rgba(0,82,255,0.2)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:14}}>⬡</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'#fff',marginBottom:3}}>Works inside the Base App</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',lineHeight:1.4}}>BASE bloc is a native Mini App — your attendees tap, connect wallet, and RSVP in seconds. No downloads needed.</div>
                </div>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div className="syne" style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:4}}>Bring BASE bloc to your event</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:4}}>Tell us about your event and we&apos;ll be in touch.</div>
              {(['name','email','event'] as const).map(f => (
                <input
                  key={f}
                  style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'13px 16px',fontFamily:'DM Sans,sans-serif',fontSize:14,color:'#fff'}}
                  placeholder={f === 'name' ? 'Your name' : f === 'email' ? 'Email address' : 'Event name & city'}
                  value={hostForm[f]}
                  onChange={e => setHostForm(p => ({...p,[f]:e.target.value}))}
                />
              ))}
              <select
                style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'13px 16px',fontFamily:'DM Sans,sans-serif',fontSize:14,color:'rgba(255,255,255,0.5)',appearance:'none'}}
                value={hostForm.size}
                onChange={e => setHostForm(p => ({...p,size:e.target.value}))}
              >
                <option value="" disabled>Expected attendance size</option>
                <option>Under 100 people</option>
                <option>100–500 people</option>
                <option>500+ people</option>
              </select>
              <button
                style={{background:'#0052FF',color:'#fff',border:'none',borderRadius:10,padding:14,fontFamily:'DM Sans,sans-serif',fontSize:15,fontWeight:600,cursor:'pointer'}}
                onClick={handleHostSubmit}
              >Submit Inquiry</button>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.35)',textAlign:'center'}}>We&apos;ll respond within 48 hours. No spam, ever.</div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{padding:'80px 24px',background:'#fff'}} id="how-it-works">
          <div style={{maxWidth:1000,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:64}}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'#0052FF',marginBottom:8}}>How it works</div>
              <div className="syne" style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:700,letterSpacing:'-1px',marginBottom:8}}>Participation you can prove.</div>
              <div style={{fontSize:15,color:'#888888',maxWidth:520,margin:'0 auto'}}>BASE bloc combines existing infrastructure to create something new: a permanent, portable record of your real-world cultural life.</div>
            </div>

            {[
              {
                num:'Step 01',
                title:'Connect your wallet in the Base App',
                desc:'BASE bloc lives natively inside the Base App — no download, no account. Open the Mini App, connect your Coinbase Smart Wallet, and you\'re in. It takes about 10 seconds.',
                visual: (
                  <div style={{textAlign:'center'}}>
                    <div style={{background:'#0052FF',color:'#fff',display:'inline-flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:100,fontSize:13,fontWeight:600,marginBottom:16}}>⬡ Wallet Connected</div>
                    <div style={{fontSize:13,color:'#888888',marginBottom:12}}>0x2E05...E2d</div>
                    <div style={{background:'#fff',border:'1px solid #EFEFEF',borderRadius:10,padding:12,fontSize:12,color:'#444444',textAlign:'center'}}>
                      <div style={{fontWeight:600,marginBottom:4}}>Base App · Mini App</div>
                      <div style={{color:'#888888'}}>No gas required for attendees</div>
                    </div>
                  </div>
                )
              },
              {
                num:'Step 02',
                title:'RSVP, check in, or take part',
                desc:'Find an event on the Discover tab, RSVP, and check in when you arrive. Or participate with a BASE bloc collaborator in a recognized action — teaching, building, creating. Every verified participation is attested to the blockchain via EAS. Gas is fully covered.',
                visual: (
                  <div style={{background:'#fff',border:'1px solid #EFEFEF',borderRadius:12,padding:16,width:'100%'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                      <div style={{width:36,height:36,background:'#0052FF',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{color:'#fff',fontSize:16}}>✓</span></div>
                      <div><div style={{fontSize:13,fontWeight:600}}>Participation Attested</div><div style={{fontSize:11,color:'#888888'}}>My City Our Music · Base</div></div>
                    </div>
                    {[['Event','MY CITY OUR MUSIC'],['Date','May 23, 2026'],['Network','Base (L2)'],['Gas cost','$0.00 (sponsored)']].map(([k,v]) => (
                      <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:11,padding:'4px 0',borderBottom:'1px solid #EFEFEF'}}>
                        <span style={{color:'#888888'}}>{k}</span><span style={{fontWeight:500,color:'#0052FF'}}>{v}</span>
                      </div>
                    ))}
                  </div>
                )
              },
              {
                num:'Step 03',
                title:'Your Records tab builds over time',
                desc:'Every BASE bloc event you attend — and every time you participate with a BASE bloc collaborator in a way that\'s recognized — becomes a verified onchain record visible in your Records tab. Your participation history lives in your wallet, not a database someone else controls. It\'s yours, permanently.',
                visual: (
                  <div style={{width:'100%'}}>
                    <div style={{fontSize:11,fontWeight:600,letterSpacing:1,textTransform:'uppercase',color:'#888888',marginBottom:10}}>Your Participation Records</div>
                    <div style={{display:'flex',alignItems:'center',gap:12,padding:10,background:'#fff',border:'1px solid #EFEFEF',borderRadius:10,marginBottom:8}}>
                      <div style={{width:8,height:8,background:'#0052FF',borderRadius:'50%',flexShrink:0}}></div>
                      <div style={{fontSize:13,fontWeight:500,flex:1}}>My City Our Music</div>
                      <div style={{fontSize:10,background:'rgba(0,82,255,0.1)',color:'#0052FF',padding:'3px 8px',borderRadius:100,fontWeight:600}}>Verified</div>
                    </div>
                    {['Future Event','Future Action'].map(n => (
                      <div key={n} style={{display:'flex',alignItems:'center',gap:12,padding:10,background:'#fff',border:'1px solid #EFEFEF',borderRadius:10,marginBottom:8,opacity:0.4}}>
                        <div style={{width:8,height:8,background:'#ccc',borderRadius:'50%',flexShrink:0}}></div>
                        <div style={{fontSize:13,fontWeight:500,flex:1,color:'#aaa'}}>{n}</div>
                        <div style={{fontSize:10,background:'#EFEFEF',color:'#aaa',padding:'3px 8px',borderRadius:100,fontWeight:600}}>Pending</div>
                      </div>
                    ))}
                    <div style={{fontSize:12,color:'#0052FF',marginTop:10,fontWeight:500}}>Records grow with every action</div>
                  </div>
                )
              },
              {
                num:'Step 04 — The Bigger Picture',
                title:'Participation becomes identity. Identity enables governance.',
                desc:'Your onchain records become the foundation for community rewards, token distributions, and governance rights. BASE bloc is identity-first — we\'re building the layer that makes community power real, not just capital-driven.',
                visual: (
                  <div style={{textAlign:'center'}}>
                    <div className="syne" style={{fontSize:16,fontWeight:700,marginBottom:6}}>What your records unlock</div>
                    <div style={{fontSize:13,color:'#888888',lineHeight:1.5,marginBottom:14}}>A verified participation history that speaks for you.</div>
                    <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap'}}>
                      {['Community Rewards','Token Airdrops','Governance Rights','Collab Perks','Creator Access'].map(b => (
                        <span key={b} style={{fontSize:11,background:'#EFEFEF',borderRadius:100,padding:'4px 10px',color:'#444444'}}>{b}</span>
                      ))}
                    </div>
                  </div>
                )
              },
            ].map((step, i) => (
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center',padding:'60px 0',borderBottom: i < 3 ? '1px solid #EFEFEF' : 'none'}}>
                <div style={i % 2 === 1 ? {order:2} : {}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',color:'#0052FF',marginBottom:12}}>{step.num}</div>
                  <h3 className="syne" style={{fontSize:'clamp(22px,3vw,32px)',fontWeight:700,letterSpacing:'-1px',marginBottom:14,lineHeight:1.15}}>{step.title}</h3>
                  <p style={{fontSize:15,lineHeight:1.75,color:'#888888'}}>{step.desc}</p>
                </div>
                <div style={{...(i % 2 === 1 ? {order:1} : {}),background:'#F7F7F7',borderRadius:16,padding:32,border:'1px solid #EFEFEF',minHeight:220,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {step.visual}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ECOSYSTEM */}
        <section style={{background:'#F7F7F7',padding:'64px 24px'}}>
          <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'#0052FF',marginBottom:8}}>Built on</div>
            <div className="syne" style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:700,letterSpacing:'-1px',marginBottom:8}}>Powered by infrastructure you trust</div>
            <div style={{fontSize:15,color:'#888888',marginBottom:40}}>BASE bloc is assembled from the most credible primitives in the Base ecosystem — combined with intent.</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
              {[
                {icon:'⬡',name:'Base (L2)',desc:"Coinbase's L2. Fast, affordable, and trusted by millions."},
                {icon:'🔏',name:'EAS',desc:'Ethereum Attestation Service — the standard for verifiable onchain claims.'},
                {icon:'💳',name:'Coinbase Paymaster',desc:'Gas is fully sponsored for attendees. Zero cost to participate.'},
                {icon:'📱',name:'Base Mini App',desc:'Native to the Base App. No downloads. Your community is already there.'},
              ].map(e => (
                <div key={e.name} className="eco-card" style={{background:'#fff',border:'1px solid #EFEFEF',borderRadius:14,padding:'24px 16px',textAlign:'center',transition:'all 0.2s'}}>
                  <div style={{fontSize:24,marginBottom:10}}>{e.icon}</div>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{e.name}</div>
                  <div style={{fontSize:12,color:'#888888',lineHeight:1.4}}>{e.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TAGLINE STRIP */}
        <div style={{background:'#0052FF',color:'#fff',textAlign:'center',padding:'14px 24px',fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,letterSpacing:'0.5px'}}>
          Culture without tech doesn&apos;t scale. Tech without culture doesn&apos;t onboard everyone.
        </div>

        {/* BELIEF / MISSION */}
        <section style={{padding:'80px 24px',textAlign:'center',maxWidth:760,margin:'0 auto'}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'#0052FF',marginBottom:12}}>Our mission</div>
          <div className="syne" style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:700,lineHeight:1.25,letterSpacing:'-1px',marginBottom:24}}>
            &ldquo;Showing up <span style={{color:'#0052FF'}}>is the most human thing you can do.</span> It should mean something permanent.&rdquo;
          </div>
          <p style={{fontSize:16,lineHeight:1.7,color:'#888888',marginBottom:36}}>
            Concerts, summits, teaching, building, local events — millions of moments and actions happen every day that define who we are. BASE bloc gives those moments permanence, portability, and power. We&apos;re building the onchain layer for real-world participation, community, and empowerment.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button
              style={{padding:'14px 28px',borderRadius:10,fontSize:15,fontWeight:500,fontFamily:'DM Sans,sans-serif',cursor:'pointer',background:'#0052FF',color:'#fff',border:'none',transition:'all 0.2s'}}
              onClick={() => document.getElementById('events')?.scrollIntoView({behavior:'smooth'})}
            >Find an Event</button>
            <button
              className="btn-lg-secondary"
              style={{padding:'14px 28px',borderRadius:10,fontSize:15,fontWeight:500,fontFamily:'DM Sans,sans-serif',cursor:'pointer',background:'#fff',color:'#0A0A0A',border:'1.5px solid #CCCCCC',transition:'all 0.2s'}}
              onClick={scrollToHost}
            >Host with BASE bloc</button>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{background:'#0A0A0A',color:'rgba(255,255,255,0.5)',padding:'40px 24px',textAlign:'center'}}>
          <div className="syne" style={{fontWeight:800,fontSize:18,color:'#fff',marginBottom:8}}>BASE <span style={{color:'#0052FF'}}>bloc</span></div>
          <p style={{fontSize:13,marginBottom:4}}>The onchain layer for real-world participation, community, and empowerment.</p>
          <p style={{fontSize:13,color:'#0052FF',fontWeight:600,marginTop:6,fontFamily:'Syne,sans-serif',letterSpacing:'0.3px'}}>Power to the People. Onchain.</p>
          <p style={{fontSize:11,marginTop:4}}>Built on Base · Powered by EAS · basebloc.app</p>
          <div style={{display:'flex',gap:20,justifyContent:'center',marginTop:16,fontSize:12}}>
            {['Discover','Records','Host an Event','About'].map(l => (
              <a key={l} href="#" style={{color:'rgba(255,255,255,0.4)',textDecoration:'none'}}>{l}</a>
            ))}
          </div>
        </footer>

      </div>

      {/* TOAST */}
      <div style={{
        position:'fixed',bottom:24,left:'50%',transform:toastVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100px)',
        background:'#0A0A0A',color:'#fff',padding:'12px 24px',borderRadius:10,fontSize:14,fontWeight:500,
        transition:'transform 0.4s',zIndex:999,pointerEvents:'none',whiteSpace:'nowrap'
      }}>{toast}</div>
    </>
  );
}
