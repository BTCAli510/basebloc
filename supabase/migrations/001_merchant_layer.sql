-- Merchant registry
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  merchant_id text unique not null,
  merchant_name text not null,
  wallet_address text not null,
  coalition_id text not null,
  secret_hash text not null,
  registration_tx text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Attestation log
create table if not exists merchant_attestations (
  id uuid primary key default gen_random_uuid(),
  attestation_uid text unique not null,
  merchant_id text not null,
  customer_wallet text not null,
  service_id text,
  amount_usdc bigint,
  points_pending integer default 0,
  merchant_confirmed boolean default false,
  confirmed_at timestamptz,
  confirm_tx_hash text,
  created_at timestamptz default now()
);

-- Bloc Parti points ledger
create table if not exists bloc_parti_points (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  points_awarded integer not null,
  source text not null,
  attestation_uid text,
  awarded_at timestamptz default now()
);

-- Tickets table (for event check-in)
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  event_name text not null,
  event_date bigint not null,
  ticket_tier text not null,
  display_name text not null,
  checked_in boolean default false,
  checked_in_at timestamptz,
  attestation_uid text,
  attendee_index integer,
  created_at timestamptz default now()
);

create index if not exists idx_merchant_attestations_wallet on merchant_attestations(customer_wallet);
create index if not exists idx_bloc_parti_points_wallet on bloc_parti_points(wallet_address);
create index if not exists idx_tickets_wallet on tickets(wallet_address);
