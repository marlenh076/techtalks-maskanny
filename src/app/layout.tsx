import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import StudentNav from "../../student_side/StudentNav";
import { Toaster } from 'sonner';
import "./globals.css";
import "./app.css"


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Maskanny',
  description: 'Student housing search and management platform',
  icons: {
    icon: '/Maskanny.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased bg-brand-light text-brand-navy">
        <StudentNav />
        {children}
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          visibleToasts={3}
          toastOptions={{ style: { borderRadius: "16px", fontFamily: "inherit" } }}
        />
      </body>
    </html>
  );
}
