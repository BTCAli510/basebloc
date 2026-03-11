import { NextResponse } from "next/server";

const SCHEMA_UID =
  "0xa953e6bcb14432c88b30183bd4020f349a8a03f2beca1d5d2e09761f7b5aac36";

export async function GET() {
  try {
    const res = await fetch("https://base.easscan.org/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          attestations(
            where: {
              schemaId: { equals: "${SCHEMA_UID}" }
            }
          ) {
            id
          }
        }`,
      }),
      next: { revalidate: 30 }, // cache for 30 seconds
    });

    const json = await res.json();
    const count = json?.data?.attestations?.length ?? 0;
    return NextResponse.json({ count });
  } catch (err) {
    console.error("EAS fetch error:", err);
    return NextResponse.json({ count: 0 });
  }
}
