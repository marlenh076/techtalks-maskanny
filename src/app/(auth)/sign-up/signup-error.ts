import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js";

const NETWORK_ERROR = "We couldn't connect. Check your connection and try again.";
const UNEXPECTED_ERROR = "Something went wrong. Please try again later.";

export function signupErrorMessage(error: AuthError): string {
  if (isAuthRetryableFetchError(error)) return NETWORK_ERROR;

  switch (error.code) {
    case "email_exists":
    case "user_already_exists":
      return "This email is already registered. Sign in or reset your password.";
    case "over_email_send_rate_limit":
      return "Too many emails requested. Please wait before trying again.";
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a few minutes.";
    case "email_address_invalid":
      return "Enter a valid email address.";
    case "weak_password":
      return "Choose a stronger password.";
    case "validation_failed":
      return "Check your details and try again.";
    case "invalid_credentials":
      return "Check your email and password, then try again.";
    case "email_address_not_authorized":
      return "We can't send a confirmation link to this address. Try another.";
  }

  if (error.status === 429) return "Too many attempts. Please wait before trying again.";
  return UNEXPECTED_ERROR;
}

export function unexpectedSignupErrorMessage(error: unknown): string {
  return error instanceof TypeError ? NETWORK_ERROR : UNEXPECTED_ERROR;
}
