CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  IF NULLIF(BTRIM(NEW.raw_user_meta_data->>'firstname'), '') IS NULL
    OR NULLIF(BTRIM(NEW.raw_user_meta_data->>'lastname'), '') IS NULL
    OR NULLIF(BTRIM(NEW.email), '') IS NULL
    OR NULLIF(BTRIM(NEW.raw_user_meta_data->>'phone'), '') IS NULL THEN
    RAISE EXCEPTION 'Signup requires firstname, lastname, email, and phone'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public."user" (
    user_id,
    firstname,
    lastname,
    email,
    phone
  )
  VALUES (
    NEW.id,
    BTRIM(NEW.raw_user_meta_data->>'firstname'),
    BTRIM(NEW.raw_user_meta_data->>'lastname'),
    BTRIM(NEW.email),
    BTRIM(NEW.raw_user_meta_data->>'phone')
  );

  RETURN NEW;
END;
$function$;
