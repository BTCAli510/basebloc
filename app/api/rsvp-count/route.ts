import { NextResponse } from 'next/server';

const SCHEMA_UID = '0xe75ec39ab8bfdd680f02b11817ed9e10556850278264c0917d645c73866784d9';

export async function GET() {
  try {
    const res = await fetch('https://base.easscan.org/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{
          aggregateAttestation(
            where: {
              schemaId: { equals: "${SCHEMA_UID}" }
              revoked: { equals: false }
            }
          ) {
            _count { _all }
          }
        }`,
      }),
      cache: 'no-store',
    });

    const json = await res.json();
    const count = json?.data?.aggregateAttestation?._count?._all ?? 0;
    return NextResponse.json({ count });
  } catch (err) {
    console.error('RSVP count error:', err);
    return NextResponse.json({ count: 0 });
  }
}
