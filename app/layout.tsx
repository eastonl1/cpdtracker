import type { Metadata } from 'next';
import './globals.css';
import SupabaseSessionProvider from './supabase-session-provider';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'CPDTracker – Track Your PEO CPD Hours',
  description: 'Easily track your professional development hours to stay compliant with PEO regulations.',
  generator: 'E Corp',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SupabaseSessionProvider>
          {children}
        </SupabaseSessionProvider>
      </body>
    </html>
  );
}
