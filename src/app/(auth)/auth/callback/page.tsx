import type { Metadata } from "next";
import AuthCallbackClient from "./AuthCallbackClient";

export const metadata: Metadata = {
  title: "Maskanny | Completing Sign In",
};

export default function AuthCallbackPage() {
  return <AuthCallbackClient />;
}
