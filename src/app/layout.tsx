import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Open_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import type { Locale } from "@/types";

// Justinian-Typografie: Cormorant (Titel), Open Sans (Bedienung), IBM Plex Mono (Rechtsquellen)
const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const fontSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

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
    <html lang={initialLocale} className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <body className="antialiased">
        <ClientProviders initialLocale={initialLocale} localeExplicit={localeExplicit}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
