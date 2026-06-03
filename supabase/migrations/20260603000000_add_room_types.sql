-- Insert room types from Booking.com property
-- Prices are placeholders — update via the Δωμάτια page

INSERT INTO public.suites (name, location, size, max_guests, price_per_night, status, emoji, description, amenities)
SELECT * FROM (VALUES
  (
    'Double Room with Balcony and Sea View',
    'Tellion Suites',
    '25m²',
    3,
    120.00::NUMERIC,
    'available',
    '🌊',
    '20 rooms available. Double room with private balcony and sea view.',
    ARRAY['Balcony', 'Sea View', 'Air Conditioning', 'Wi-Fi', 'Private Bathroom']
  ),
  (
    'Double Room with Balcony',
    'Tellion Suites',
    '22m²',
    3,
    100.00::NUMERIC,
    'available',
    '🛏️',
    '2 rooms available. Double room with private balcony.',
    ARRAY['Balcony', 'Air Conditioning', 'Wi-Fi', 'Private Bathroom']
  ),
  (
    'Triple Room with Balcony',
    'Tellion Suites',
    '28m²',
    3,
    130.00::NUMERIC,
    'available',
    '🏨',
    'Triple room with private balcony.',
    ARRAY['Balcony', 'Air Conditioning', 'Wi-Fi', 'Private Bathroom']
  ),
  (
    'Apartment with Garden View',
    'Tellion Suites',
    '45m²',
    4,
    160.00::NUMERIC,
    'available',
    '🌿',
    '2 units available. Apartment with garden view and kitchenette.',
    ARRAY['Garden View', 'Kitchenette', 'Air Conditioning', 'Wi-Fi', 'Private Bathroom', 'Living Area']
  ),
  (
    'Apartment',
    'Tellion Suites',
    '40m²',
    3,
    150.00::NUMERIC,
    'available',
    '🏠',
    'Comfortable apartment with kitchenette.',
    ARRAY['Kitchenette', 'Air Conditioning', 'Wi-Fi', 'Private Bathroom', 'Living Area']
  )
) AS new_suites(name, location, size, max_guests, price_per_night, status, emoji, description, amenities)
WHERE NOT EXISTS (
  SELECT 1 FROM public.suites WHERE suites.name = new_suites.name
);
