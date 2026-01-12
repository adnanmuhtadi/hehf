-- Delete all existing booking_hosts first (due to foreign key relationships)
DELETE FROM public.booking_hosts;

-- Delete all existing bookings
DELETE FROM public.bookings;

-- Insert new bookings from the PDF (number_of_nights is auto-calculated)
INSERT INTO public.bookings (booking_reference, arrival_date, departure_date, location, country_of_students, number_of_students, status, created_by, notes)
VALUES
  ('he02-2', '2026-02-02', '2026-02-05', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 1'),
  ('he09-2', '2026-02-09', '2026-02-12', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 2'),
  ('he16-2', '2026-02-16', '2026-02-20', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 3'),
  ('he22-2', '2026-02-22', '2026-02-28', 'Watford', 'China', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 4 - TBC'),
  ('he02-3', '2026-03-02', '2026-03-05', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 5'),
  ('he11-3', '2026-03-11', '2026-03-13', 'Watford', 'Czech Republic', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 6'),
  ('he16-3', '2026-03-16', '2026-03-19', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 7'),
  ('he23-3', '2026-03-23', '2026-03-26', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 8'),
  ('he30-3', '2026-03-30', '2026-04-03', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 9'),
  ('he06-4', '2026-04-06', '2026-04-09', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 10'),
  ('he13-4', '2026-04-13', '2026-04-16', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 11'),
  ('he20-4', '2026-04-20', '2026-04-23', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 12'),
  ('he26-4', '2026-04-26', '2026-04-28', 'Watford', 'Czech Republic', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 13'),
  ('he04-5', '2026-05-04', '2026-05-07', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 14'),
  ('he11-5', '2026-05-12', '2026-05-15', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 15'),
  ('he18-5', '2026-05-18', '2026-05-21', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 16'),
  ('he27-5', '2026-05-25', '2026-05-29', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 17'),
  ('he01-6', '2026-06-01', '2026-06-05', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 18'),
  ('he08-6', '2026-06-08', '2026-06-11', 'Watford', 'France', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 19'),
  ('he16-6', '2026-06-15', '2026-06-18', 'Watford', 'TBC', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 20 - Nights TBC'),
  ('he22-6', '2026-06-22', '2026-06-25', 'Watford', 'TBC', 1, 'pending', 'fc515952-1797-4283-91d6-4c689b8f8ee0', 'Group 21 - Nights TBC');