ALTER TABLE public."user"
  ADD CONSTRAINT user_auth_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

CREATE FUNCTION public.sync_user_email()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
  UPDATE public."user"
  SET email = NEW.email
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_user_email();
