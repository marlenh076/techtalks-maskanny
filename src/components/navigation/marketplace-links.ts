import type { MarketplaceAccount } from "./useMarketplaceAccount";

export function getBecomeHostHref(account: MarketplaceAccount): string | null {
  if (account.status === "guest") return "/sign-up?next=%2Fhost%2Fonboarding";
  if (account.status === "authenticated") return "/properties/create";
  return null;
}
