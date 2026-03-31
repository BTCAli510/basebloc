'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { useName } from "@coinbase/onchainkit/identity";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { base } from "viem/chains";

const EAS_CONTRACT = "0x4200000000000000000000000000000000000021";
const SCHEMA_UID = "0xb81941b702c7aacc8164f6fed9a3ff97bbf179131c9e4bedb040bd7d787da4f7";
const BUILDER_CODE_DATA_SUFFIX = "0x62635f37736474747335310b0080218021802180218021802180218021";

export default function MyCityOurMusicPage() {
  const { address, isConnected, connector } = useAccount();
  const { data: basename } = useName({ address, chain: base });
  const [countdown, setCountdown] = useState({ days: '00', hrs: '00', min: '00', sec: '00' });
  const [rsvpState, setRsvpState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [attestationUID, setAttestationUID] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  useEffect(() => {
    if (basename && !nameEdited) setDisplayName(basename as string);
  }, [basename, nameEdited]);

  const finalDisplayName = displayName.trim() || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Guest');

  async function handleRSVP() {
    if (!connector || !address) return;
    setRsvpState('loading');
    setErrorMsg('');
    try {
      const schemaEncoder = new SchemaEncoder(
        'string eventName,string eventDate,string coalition,bool attending,string ticketTier,string displayName'
      );
      const encoded = schemaEncoder.encodeData([
        { name: 'eventName', value: 'MY CITY OUR MUSIC', type: 'string' },
        { name: 'eventDate', value: '2026-05-23', type: 'string' },
        { name: 'coalition', value: 'BASE Oakland bloc', type: 'string' },
        { name: 'attending', value: true, type: 'bool' },
        { name: 'ticketTier', value: 'General', type: 'string' },
        { name: 'displayName', value: finalDisplayName, type: 'string' },
      ]);

      const { encodeFunctionData } = await import('viem');
      const EAS_ABI = [{
        name: 'attest',
        type: 'function',
        inputs: [{
          name: 'request', type: 'tuple',
          components: [
            { name: 'schema', type: 'bytes32' },
            {
              name: 'data', type: 'tuple',
              components: [
                { name: 'recipient', type: 'address' },
                { name: 'expirationTime', type: 'uint64' },
                { name: 'revocable', type: 'bool' },
                { name: 'refUID', type: 'bytes32' },
                { name: 'data', type: 'bytes' },
                { name: 'value', type: 'uint256' },
              ]
            }
          ]
        }],
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'payable',
      }] as const;

      const calldata = encodeFunctionData({
        abi: EAS_ABI,
        functionName: 'attest',
        args: [{
          schema: SCHEMA_UID as `0x${string}`,
          data: {
            recipient: address,
            expirationTime: BigInt(0),
            revocable: true,
            refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
            data: encoded as `0x${string}`,
            value: BigInt(0),
          }
        }]
      });

      const provider = await connector.getProvider();
      console.log('[handleRSVP] provider constructor:', (provider as any)?.constructor?.name);

      await (provider as any).request({
        method: 'wallet_sendCalls',
        params: [{
          version: '1.0',
          chainId: '0x2105',
          from: address,
          calls: [{ to: EAS_CONTRACT, data: calldata, value: '0x0' }],
          capabilities: {},
          ...(BUILDER_CODE_DATA_SUFFIX ? { dataSuffix: BUILDER_CODE_DATA_SUFFIX } : {}),
        }],
      });

      let uid: string | null = null;
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const res = await fetch('https://base.easscan.org/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query {
              attestations(
                where: { attester: { equals: "${address}" }, schemaId: { equals: "${SCHEMA_UID}" } }
                orderBy: { timeCreated: desc }
                take: 1
              ) { id }
            }`
          })
        });
        const json = await res.json();
        uid = json?.data?.attestations?.[0]?.id ?? null;
        if (uid) break;
      }

      setAttestationUID(uid);
      setRsvpState('success');
    } catch (e: any) {
      console.error('[handleRSVP] error:', e);
      console.error('[handleRSVP] message:', e?.message);
      console.error('[handleRSVP] code:', e?.code);
      console.error('[handleRSVP] stack:', e?.stack);
      // Never surface raw provider/SDK error messages to the user
      setErrorMsg('Something went wrong. Please try again.');
      setRsvpState('error');
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'DM Sans',sans-serif;background:#fff;color:#0A0A0A;overflow-x:hidden;}
        .syne{font-family:'Syne',sans-serif;}
        .back-btn:hover{color:#0052FF!important;}
        .rsvp-btn:hover{background:#0040CC!important;}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(255,255,255,0.97)',backdropFilter:'blur(10px)',borderBottom:'1px solid #EFEFEF',padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link
          href="/"
          className="syne"
          style={{fontWeight:800,fontSize:18,color:'#0A0A0A',letterSpacing:'-0.5px',textDecoration:'none'}}
        >
          BASE <span style={{color:'#0052FF'}}>bloc</span>
        </Link>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <Link
            href="/records"
            style={{background:'none',border:'1px solid #CCCCCC',color:'#0A0A0A',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:500,padding:'8px 16px',borderRadius:8,cursor:'pointer',textDecoration:'none',display:'inline-block'}}
          >My Records</Link>
          <Link
            href="/#host"
            style={{background:'#0052FF',border:'none',color:'#fff',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:500,padding:'8px 18px',borderRadius:8,cursor:'pointer',textDecoration:'none',display:'inline-block'}}
          >Host an Event</Link>
        </div>
      </nav>

      {/* EVENT DETAIL */}
      <div style={{maxWidth:680,margin:'0 auto',padding:'40px 24px 80px'}}>
        <Link
          href="/"
          className="back-btn"
          style={{display:'inline-flex',alignItems:'center',gap:8,fontSize:13,color:'#888888',cursor:'pointer',marginBottom:32,textDecoration:'none',transition:'color 0.2s'}}
        >
          ← Back to BASE bloc
        </Link>

        <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'#0052FF',marginBottom:10}}>
          Hip Hop TV &amp; Citiesabc Present
        </div>
        <h1 className="syne" style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:800,letterSpacing:'-2px',lineHeight:1.05,marginBottom:12}}>
          My City Our Music
        </h1>
        <div style={{fontSize:16,color:'#888888',marginBottom:8}}>Music · Creative Industries · AI Summit</div>
        <div style={{fontSize:15,fontWeight:600,color:'#0A0A0A',marginBottom:6}}>May 23, 2026</div>
        <div style={{fontSize:14,color:'#888888',marginBottom:28}}>Henry J. Kaiser Center for the Arts · Oakland, CA</div>

        <div style={{width:'100%',borderRadius:16,overflow:'hidden',marginBottom:28,border:'1px solid #EFEFEF'}}>
          <img src="/event-flyer.png" alt="My City Our Music" style={{width:'100%',display:'block'}} />
        </div>

        {/* COUNTDOWN */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:28}}>
          {[['days',countdown.days],['hrs',countdown.hrs],['min',countdown.min],['sec',countdown.sec]].map(([label,val]) => (
            <div key={label} style={{background:'#F7F7F7',border:'1px solid #EFEFEF',borderRadius:12,padding:'16px 8px',textAlign:'center'}}>
              <div className="syne" style={{fontSize:28,fontWeight:800,color:'#0052FF'}}>{val}</div>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'#888888',marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <Link
          href="/tickets"
          style={{display:'block',width:'100%',background:'#0052FF',color:'#fff',border:'none',borderRadius:12,padding:18,fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:700,cursor:'pointer',marginBottom:12,letterSpacing:'-0.5px',textAlign:'center',textDecoration:'none',transition:'background 0.2s'}}
        >
          Get Tickets — from 25 USDC
        </Link>
        {/* RSVP FLOW */}
        {rsvpState === 'success' ? (
          <div style={{background:'#F0F7FF',border:'1.5px solid #0052FF',borderRadius:12,padding:20,marginBottom:12,textAlign:'center'}}>
            <div style={{fontSize:22,marginBottom:6}}>✓</div>
            <div className="syne" style={{fontSize:16,fontWeight:700,color:'#0052FF',marginBottom:4}}>You&apos;re on the list.</div>
            <div style={{fontSize:13,color:'#888888',marginBottom:attestationUID ? 8 : 0}}>
              Your RSVP is recorded onchain via EAS.
            </div>
            {attestationUID && (
              <a
                href={`https://base.easscan.org/attestation/view/${attestationUID}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{fontSize:12,color:'#0052FF',textDecoration:'underline'}}
              >
                View attestation →
              </a>
            )}
          </div>
        ) : !isConnected ? (
          <div style={{border:'1.5px solid #EFEFEF',borderRadius:12,padding:20,marginBottom:12,textAlign:'center'}}>
            <div style={{fontSize:14,color:'#888888',marginBottom:12}}>
              Connect your wallet to RSVP onchain — free, gas sponsored.
            </div>
            <ConnectWallet />
          </div>
        ) : (
          <div style={{border:'1.5px solid #EFEFEF',borderRadius:12,padding:20,marginBottom:12}}>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:12,fontWeight:600,marginBottom:6,color:'#444444'}}>
                Display Name (optional)
              </label>
              <input
                value={displayName}
                onChange={e => { setDisplayName(e.target.value); setNameEdited(true); }}
                placeholder="Your name or handle"
                style={{width:'100%',padding:'10px 14px',border:'1.5px solid #EFEFEF',borderRadius:8,fontSize:14,fontFamily:'DM Sans,sans-serif',outline:'none',boxSizing:'border-box'}}
              />
              <p style={{fontSize:11,color:'#aaa',marginTop:5}}>
                {basename ? 'Pre-filled from your Basename — edit freely' : 'Optional — leave blank to use your wallet address'}
              </p>
            </div>
            <button
              onClick={handleRSVP}
              disabled={rsvpState === 'loading'}
              style={{display:'block',width:'100%',background:rsvpState === 'loading' ? '#aaa' : '#fff',color:rsvpState === 'loading' ? '#fff' : '#0052FF',border:'2px solid ' + (rsvpState === 'loading' ? '#aaa' : '#0052FF'),borderRadius:10,padding:14,fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,cursor:rsvpState === 'loading' ? 'not-allowed' : 'pointer',letterSpacing:'-0.5px',textAlign:'center',transition:'all 0.2s'}}
            >
              {rsvpState === 'loading' ? 'Attesting to Base...' : 'RSVP on Base — Free'}
            </button>
            {rsvpState === 'error' && (
              <p style={{color:'#CC0000',fontSize:13,marginTop:10}}>Something went wrong. Please try again.</p>
            )}
          </div>
        )}
        <p style={{textAlign:'center',fontSize:12,color:'#888888',lineHeight:1.6,marginBottom:32}}>
          Ticket required for entry · RSVP signals intent · Verified attendance is recorded at check-in
        </p>

        {/* HOW IT WORKS */}
        <div style={{marginBottom:32}}>
          <h3 className="syne" style={{fontSize:20,fontWeight:700,letterSpacing:'-0.5px',marginBottom:16}}>How it works</h3>
          {[
            {step:'1',title:'RSVP or Buy a Ticket',desc:'Connect your wallet and claim your place. Free RSVP or paid ticket — connect your wallet and claim your place.'},
            {step:'2',title:'Check in at the event',desc:'BASE bloc staff verify you in person at the door. No app required — just your wallet.'},
            {step:'3',title:'Your attendance is recorded',desc:'Verified onchain and tied to your wallet. A permanent credential that travels with you.'},
          ].map(r => (
            <div key={r.step} style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:20}}>
              <div style={{width:32,height:32,background:'#0052FF',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,flexShrink:0,color:'#fff',fontFamily:'Syne,sans-serif'}}>{r.step}</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:'#0A0A0A',marginBottom:2}}>{r.title}</div>
                <div style={{fontSize:14,color:'#888888',lineHeight:1.6}}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ABOUT */}
        <div style={{marginBottom:32}}>
          <h3 className="syne" style={{fontSize:20,fontWeight:700,letterSpacing:'-0.5px',marginBottom:10}}>About the summit</h3>
          <p style={{fontSize:15,lineHeight:1.7,color:'#888888'}}>
            My City Our Music is a one-day summit at the intersection of music, creative industries, and artificial intelligence — produced by Hip Hop TV and Citiesabc at the iconic Henry J. Kaiser Center for the Arts in Oakland.
          </p>
          <p style={{fontSize:15,lineHeight:1.7,color:'#888888',marginTop:12}}>
            This summit brings together artists, technologists, and community leaders to explore how culture shapes technology — and how technology can serve culture. Oakland is the first stop.
          </p>
        </div>

        {/* COLLABORATORS */}
        <div style={{marginBottom:32}}>
          <h3 className="syne" style={{fontSize:20,fontWeight:700,letterSpacing:'-0.5px',marginBottom:12}}>Collaborators</h3>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {['Hip Hop TV','Citiesabc','Beast Mode','Oakland XChange','BASE bloc'].map(c => (
              <span key={c} style={{background:'#F7F7F7',border:'1px solid #EFEFEF',borderRadius:100,padding:'6px 14px',fontSize:12,fontWeight:600,color:'#444444'}}>{c}</span>
            ))}
          </div>
        </div>

        {/* MORE THAN A TICKET */}
        <div style={{background:'#F7F7F7',border:'1px solid #EFEFEF',borderRadius:16,padding:28}}>
          <h3 className="syne" style={{fontSize:18,fontWeight:700,letterSpacing:'-0.5px',marginBottom:10}}>More than a ticket.</h3>
          <p style={{fontSize:14,lineHeight:1.7,color:'#888888'}}>
            Your RSVP creates a verified onchain record that shows you were part of this moment. As BASE bloc grows, that record can help power community recognition, future access, and opportunities for those who show up.
          </p>
          {[
            {icon:'●',title:'Reserve your place.',desc:'Reserve your place at MY CITY OUR MUSIC — onchain and verified from the moment you commit.'},
            {icon:'▼',title:'Get event access.',desc:'Get event access with a verified check-in path. Your ticket is the credential.'},
            {icon:'■',title:'Create a record.',desc:'Create a record that becomes meaningful when you show up. Attendance is attested on Base.'},
          ].map(r => (
            <div key={r.title} style={{display:'flex',alignItems:'flex-start',gap:12,marginTop:16}}>
              <div style={{width:28,height:28,background:'rgba(0,82,255,0.1)',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0,marginTop:2,color:'#0052FF'}}>{r.icon}</div>
              <div style={{fontSize:13,lineHeight:1.6,color:'#444444'}}>
                <strong style={{color:'#0A0A0A'}}>{r.title}</strong> {r.desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center',fontSize:13,color:'#0052FF',fontWeight:600,marginTop:40,fontFamily:'Syne,sans-serif',letterSpacing:'0.3px'}}>
          Power to the People. Onchain.
        </div>
      </div>
    </>
  );
}
