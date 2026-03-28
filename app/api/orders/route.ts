import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function isValidWallet(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function toUsdcUnits(amount: number | string) {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 1_000_000).toString();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const { data: event, error } = await supabase
      .from("events")
      .select("id, title, ticket_price_usd, sold_count, max_tickets, status")
      .eq("id", eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const soldCount = Number(event.sold_count ?? 0);
    const maxTickets = Number(event.max_tickets ?? 0);
    const available = Math.max(0, maxTickets - soldCount);

    return NextResponse.json({
      eventId: event.id,
      title: event.title,
      status: event.status,
      ticketPriceUsd: event.ticket_price_usd,
      soldCount,
      maxTickets,
      available,
      soldOut: available <= 0,
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to load event availability" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventId = body?.eventId;
    const buyerWallet = body?.buyerWallet;

    if (!eventId || !buyerWallet) {
      return NextResponse.json(
        { error: "Missing eventId or buyerWallet" },
        { status: 400 }
      );
    }

    if (!isValidWallet(buyerWallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, ticket_price_usd, payout_wallet, sold_count, max_tickets, status")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "active") {
      return NextResponse.json({ error: "Event is not active" }, { status: 400 });
    }

    const soldCount = Number(event.sold_count ?? 0);
    const maxTickets = Number(event.max_tickets ?? 0);

    if (soldCount >= maxTickets) {
      return NextResponse.json({ error: "Sold out" }, { status: 400 });
    }

    const expectedAmount = event.ticket_price_usd;
    const recipient = event.payout_wallet;
    const usdcUnits = toUsdcUnits(expectedAmount);

    if (!recipient || !usdcUnits) {
      return NextResponse.json(
        { error: "Event payment settings are invalid" },
        { status: 500 }
      );
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        event_id: event.id,
        buyer_wallet: buyerWallet,
        expected_amount: expectedAmount,
        expected_recipient: recipient,
        status: "pending",
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      usdcUnits,
      recipient,
    });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
