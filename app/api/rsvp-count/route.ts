import { NextResponse } from "next/server";

const SCHEMA_UID =
  "0xb81941b702c7aacc8164f6fed9a3ff97bbf179131c9e4bedb040bd7d787da4f7";

export async function GET() {
  try {
    const res = await fetch("https://base.easscan.org/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          aggregateAttestation(
            where: {
              schemaId: { equals: "${SCHEMA_UID}" }
            }
          ) {
            _count {
              _all
            }
          }
        }`,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch RSVP count" },
        { status: 500 }
      );
    }
    const json = await res.json();
    const count = json?.data?.aggregateAttestation?._count?._all ?? 0;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: null }, { status: 500 });
  }
}
