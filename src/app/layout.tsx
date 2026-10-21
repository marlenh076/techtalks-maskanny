import type { Metadata } from "next";
import { MarketplaceNav } from "@/src/components/navigation/MarketplaceNav";
import { Toaster } from "sonner";
import "./globals.css";
import "./app.css";

export const metadata: Metadata = {
  title: {
    default: "Maskanny | Student Housing in Lebanon",
    template: "%s | Maskanny",
  },
  description: "Find student apartments, rooms, and dorms near universities in Lebanon.",
  icons: {
    icon: "/Maskanny.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="min-h-screen font-sans antialiased bg-brand-light text-brand-navy"
      >
        <MarketplaceNav />
        {children}
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          visibleToasts={3}
          toastOptions={{
            style: {
              borderRadius: "16px",
              fontFamily: "inherit",
            },
          }}
        />
      </body>
    </html>
  );
}
