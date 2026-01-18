DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user by email (case-insensitive)
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = lower('jonathonsands@hotmail.com');

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
    RAISE EXCEPTION 'User with email jonathonsands@hotmail.com not found';
  END IF;
END $$;