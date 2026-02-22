import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import type { Locale } from "@/types";

export const metadata: Metadata = {
  title: "VoteBoard - Feature Voting",
  description: "Submit and vote on product ideas",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read locale from cookie for SSR — prevents flash of wrong language
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const initialLocale: Locale =
    rawLocale === "de" || rawLocale === "en" ? rawLocale : "de";
  // True only when the cookie was explicitly set — used to skip browser-language detection
  const localeExplicit = rawLocale === "de" || rawLocale === "en";

  return (
    <html lang={initialLocale}>
      <body className="antialiased">
        <ClientProviders initialLocale={initialLocale} localeExplicit={localeExplicit}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
