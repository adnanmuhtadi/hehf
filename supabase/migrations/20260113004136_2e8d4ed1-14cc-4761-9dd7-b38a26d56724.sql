-- Update existing Cheshunt bookings with correct location and dates
UPDATE public.bookings SET location = 'Cheshunt', country_of_students = 'TBC', notes = 'Duration TBC' WHERE booking_reference = 'he02-2';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-02-09', departure_date = '2026-02-12', country_of_students = 'France', status = 'confirmed' WHERE booking_reference = 'he09-2';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-02-16', departure_date = '2026-02-20', country_of_students = 'France', status = 'confirmed' WHERE booking_reference = 'he16-2';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-02-22', departure_date = '2026-02-28', country_of_students = 'China', notes = 'Chinese group - TBC' WHERE booking_reference = 'he22-2';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-03-02', departure_date = '2026-03-05', country_of_students = 'France', status = 'confirmed' WHERE booking_reference = 'he02-3';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-03-16', departure_date = '2026-03-19', country_of_students = 'Czech Republic', status = 'confirmed' WHERE booking_reference = 'he16-3';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-03-23', departure_date = '2026-03-26', country_of_students = 'France', status = 'confirmed' WHERE booking_reference = 'he23-3';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-03-30', departure_date = '2026-04-02', country_of_students = 'France', status = 'confirmed' WHERE booking_reference = 'he30-3';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-04-13', departure_date = '2026-04-16', country_of_students = 'TBC', notes = 'Duration TBC' WHERE booking_reference = 'he13-4';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-04-20', departure_date = '2026-04-23', country_of_students = 'TBC', notes = 'Duration TBC' WHERE booking_reference = 'he20-4';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-05-04', departure_date = '2026-05-07', country_of_students = 'France', status = 'confirmed' WHERE booking_reference = 'he04-5';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-05-18', departure_date = '2026-05-21', country_of_students = 'France', status = 'confirmed' WHERE booking_reference = 'he18-5';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-06-01', departure_date = '2026-06-05', country_of_students = 'France', status = 'confirmed' WHERE booking_reference = 'he01-6';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-06-08', departure_date = '2026-06-11', country_of_students = 'Czech Republic', status = 'confirmed' WHERE booking_reference = 'he08-6';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-06-16', departure_date = '2026-06-19', country_of_students = 'Czech Republic', status = 'confirmed' WHERE booking_reference = 'he16-6';
UPDATE public.bookings SET location = 'Cheshunt', arrival_date = '2026-06-22', departure_date = '2026-06-25', country_of_students = 'TBC', notes = 'Duration TBC' WHERE booking_reference = 'he22-6';

-- Insert new Cheshunt bookings that don't exist yet
INSERT INTO public.bookings (booking_reference, arrival_date, departure_date, location, country_of_students, status, created_by, notes)
VALUES
('he09-3', '2026-03-09', '2026-03-11', 'Cheshunt', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('he07-4', '2026-04-07', '2026-04-10', 'Cheshunt', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('he27-4', '2026-04-27', '2026-04-30', 'Cheshunt', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('he10-5', '2026-05-10', '2026-05-12', 'Cheshunt', 'Czech Republic', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('he26-5', '2026-05-26', '2026-05-29', 'Cheshunt', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL)
ON CONFLICT (booking_reference) DO UPDATE SET 
  location = EXCLUDED.location,
  arrival_date = EXCLUDED.arrival_date,
  departure_date = EXCLUDED.departure_date,
  country_of_students = EXCLUDED.country_of_students,
  status = EXCLUDED.status;

-- Insert Loughton/Chingford 2026 bookings
INSERT INTO public.bookings (booking_reference, arrival_date, departure_date, location, country_of_students, status, created_by, notes)
VALUES
('lc02-2', '2026-02-02', '2026-02-05', 'Loughton', 'TBC', 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Duration TBC'),
('lc09-2', '2026-02-09', '2026-02-12', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc16-2', '2026-02-16', '2026-02-20', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc22-2', '2026-02-22', '2026-02-28', 'Loughton', 'China', 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Chinese group - TBC'),
('lc02-3', '2026-03-02', '2026-03-05', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc09-3', '2026-03-09', '2026-03-11', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc16-3', '2026-03-16', '2026-03-19', 'Loughton', 'Czech Republic', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc23-3', '2026-03-23', '2026-03-26', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc30-3', '2026-03-30', '2026-04-02', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc07-4', '2026-04-07', '2026-04-10', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc13-4', '2026-04-13', '2026-04-16', 'Loughton', 'TBC', 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Duration TBC'),
('lc20-4', '2026-04-20', '2026-04-23', 'Loughton', 'TBC', 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Duration TBC'),
('lc27-4', '2026-04-27', '2026-04-30', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc04-5', '2026-05-04', '2026-05-07', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc10-5', '2026-05-10', '2026-05-12', 'Loughton', 'Czech Republic', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc18-5', '2026-05-18', '2026-05-21', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc26-5', '2026-05-26', '2026-05-29', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc01-6', '2026-06-01', '2026-06-05', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc08-6', '2026-06-08', '2026-06-11', 'Loughton', 'Czech Republic', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc16-6', '2026-06-15', '2026-06-18', 'Loughton', 'France', 'confirmed', 'fc515952-1797-4283-91d6-4c689b8f8ee0', NULL),
('lc22-6', '2026-06-22', '2026-06-25', 'Loughton', 'TBC', 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Duration TBC')
ON CONFLICT (booking_reference) DO UPDATE SET 
  location = EXCLUDED.location,
  arrival_date = EXCLUDED.arrival_date,
  departure_date = EXCLUDED.departure_date,
  country_of_students = EXCLUDED.country_of_students,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;