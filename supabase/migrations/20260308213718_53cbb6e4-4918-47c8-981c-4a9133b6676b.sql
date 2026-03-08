
-- Add balance, invoice_status, booking_date, guest_phone, guest_country, guest_country_flag, occupants, check_in_time, check_out_time to reservations
ALTER TABLE public.reservations 
  ADD COLUMN balance NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN invoice_status TEXT DEFAULT 'not-invoiced' CHECK (invoice_status IN ('not-invoiced', 'invoiced', 'partially-invoiced')),
  ADD COLUMN booking_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN guest_phone TEXT,
  ADD COLUMN guest_country TEXT,
  ADD COLUMN guest_country_flag TEXT,
  ADD COLUMN occupants_adults INTEGER DEFAULT 2,
  ADD COLUMN occupants_children INTEGER DEFAULT 0,
  ADD COLUMN check_in_time TEXT DEFAULT '15:00',
  ADD COLUMN check_out_time TEXT DEFAULT '11:00',
  ADD COLUMN rate_name TEXT DEFAULT 'Standard Rate';

-- Update existing reservations with balance = total_amount (nothing paid yet)
UPDATE public.reservations SET balance = total_amount, booking_date = created_at;
