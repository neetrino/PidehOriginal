import type { Metadata } from "next";
import { Geist_Mono, Montserrat, Noto_Sans_Armenian } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

/** Figma display face — Pricehigh Black (fonter.am, free for commercial use). */
const pricehigh = localFont({
  src: "../fonts/Pricehigh-Black.ttf",
  variable: "--font-pricehigh",
  weight: "900",
  style: "normal",
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoArmenian = Noto_Sans_Armenian({
  variable: "--font-noto-armenian",
  subsets: ["armenian"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pideh",
    template: "%s · Pideh",
  },
  description: "Հայկական փիդե — պատվիրիր առցանց",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hy" className="h-full" suppressHydrationWarning>
      <body
        className={`${pricehigh.variable} ${montserrat.variable} ${notoArmenian.variable} ${geistMono.variable} flex min-h-dvh flex-col overflow-x-hidden antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
