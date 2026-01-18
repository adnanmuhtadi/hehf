-- Get the user_id for the new admin and assign admin role
-- This will run after the user is created in Auth

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'jonathonsands@hotmail.com';

  IF target_user_id IS NOT NULL THEN
    -- Insert admin role into user_roles table (if not exists)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Update profile role to admin
    UPDATE public.profiles
    SET role = 'admin'
    WHERE user_id = target_user_id;

    RAISE NOTICE 'Admin role assigned to user %', target_user_id;
  ELSE
    RAISE NOTICE 'User not found - please create the user in Auth first';
  END IF;
END $$;