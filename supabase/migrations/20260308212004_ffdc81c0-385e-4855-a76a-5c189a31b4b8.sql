
-- Create suites table
CREATE TABLE public.suites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Krotiri Hillside, Parikia',
  size TEXT NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2,
  price_per_night NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
  rating NUMERIC(2,1) DEFAULT 4.9,
  emoji TEXT DEFAULT '🏖️',
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  current_guest TEXT,
  next_check_in DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guests table
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  country_flag TEXT,
  total_stays INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  last_visit TEXT,
  last_suite TEXT,
  rating INTEGER DEFAULT 4 CHECK (rating >= 1 AND rating <= 5),
  vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_code TEXT NOT NULL UNIQUE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  suite_id UUID REFERENCES public.suites(id) ON DELETE SET NULL,
  suite_name TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'checked-in', 'checked-out', 'cancelled')),
  source TEXT DEFAULT 'Direct',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Suites policies
CREATE POLICY "Anyone can read suites" ON public.suites FOR SELECT USING (true);
CREATE POLICY "Anyone can insert suites" ON public.suites FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update suites" ON public.suites FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete suites" ON public.suites FOR DELETE USING (true);

-- Guests policies
CREATE POLICY "Anyone can read guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update guests" ON public.guests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete guests" ON public.guests FOR DELETE USING (true);

-- Reservations policies
CREATE POLICY "Anyone can read reservations" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reservations" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reservations" ON public.reservations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reservations" ON public.reservations FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER update_suites_updated_at BEFORE UPDATE ON public.suites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
