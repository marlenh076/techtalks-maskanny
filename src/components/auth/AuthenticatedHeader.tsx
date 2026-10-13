import Image from "next/image";
import { LogoutAction } from "./LogoutAction";

type AuthenticatedHeaderProps = {
  email?: string;
};

export function AuthenticatedHeader({ email }: AuthenticatedHeaderProps) {
  return (
    <header className="flex w-full items-center justify-between gap-4 border-b border-[var(--line-strong)] pb-5">
      <div className="flex min-w-0 items-center gap-3">
        <Image src="/Maskanny.svg" alt="" aria-hidden="true" width={36} height={36} className="shrink-0" />
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-tight text-[var(--ink)]">Maskanny</p>
          {email && <p className="truncate text-xs text-[var(--soft)]">{email}</p>}
        </div>
      </div>
      <LogoutAction />
    </header>
  );
}
