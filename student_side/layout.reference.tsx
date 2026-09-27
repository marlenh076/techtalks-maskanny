/**
 * ⚠️ DO NOT REPLACE YOUR EXISTING LAYOUT WITH THIS FILE.
 *
 * If src/app/layout.tsx already exists in your project — it does, since a
 * Next.js app can't build without one — keep yours and make ONE change:
 * import StudentNav and render it just inside <body>, above {children}.
 *
 *   import StudentNav from "@/components/layout/StudentNav";
 *   ...
 *   <body>
 *     <StudentNav />
 *     {children}
 *   </body>
 *
 * That's the entire integration. This file is here only as a reference for
 * where the nav goes, and to show the globals.css import order.
 */

import type { Metadata } from "next";
import StudentNav from "@/components/layout/StudentNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maskani — student housing in Lebanon",
  description:
    "Find dorms near Lebanese universities. Compare price, distance and room type, then contact the owner.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F4F2ED] text-[#16171A] antialiased">
        <StudentNav />
        {children}
      </body>
    </html>
  );
}
