-- SQL schema for Siap-Muncak

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  phone text,
  is_vendor boolean default false,
  is_verified boolean default false,
  role text default 'user' check (role in ('user', 'vendor', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- stores table
create table if not exists public.stores (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text not null,
  description text,
  city text not null check (city in ('Bandung', 'Garut')),
  is_verified boolean default false,
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- equipment table
create table if not exists public.equipment (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  description text,
  price_per_day numeric not null check (price_per_day >= 0),
  total_stock integer not null check (total_stock >= 0),
  stok_tersedia integer not null check (stok_tersedia >= 0),
  category text not null check (category in ('Tenda', 'Carrier', 'Sleeping Bag', 'Kompor', 'Sepatu', 'Penerangan', 'Trekking Pole')),
  images text[] default '{}'::text[],
  rating numeric default 4.5 check (rating >= 0 and rating <= 5),
  reviews_count integer default 0 check (reviews_count >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- bookings table
create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  equipment_id uuid references public.equipment(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  duration integer not null check (duration > 0),
  total_price numeric not null check (total_price >= 0),
  delivery_method text not null check (delivery_method in ('pickup', 'delivery')),
  shipping_address jsonb, -- {name, phone, address, city, postal_code}
  shipping_cost numeric default 0,
  payment_method text not null check (payment_method in ('transfer', 'qris')),
  payment_proof_url text,
  status text default 'pending' check (status in ('pending', 'menunggu_konfirmasi', 'dikonfirmasi', 'siap_diambil', 'diambil', 'diproses', 'dikirim', 'selesai', 'dibatalkan')),
  verification_token text,
  nomor_resi text,
  cancellation_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- reviews table
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  equipment_id uuid references public.equipment(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger for auto profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, is_vendor, is_verified, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User Baru'),
    new.email,
    new.raw_user_meta_data->>'phone',
    false,
    false,
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;
