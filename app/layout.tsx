import type { Metadata } from "next";
import { Inter, Syne, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-syne" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ansonseer.world"),
  title: "ANSON WORLD — an explorable digital self",
  description:
    "Part portfolio, part autobiography, part philosophy archive. You don't browse it. You enter it.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "ANSON WORLD — an explorable digital self",
    description:
      "Two versions of one person, and the worlds between them. You don't browse it. You enter it.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Anson Sun",
  alternateName: "Ansonseer",
  url: "https://ansonseer.world",
  image: "https://ansonseer.world/avatar.jpg",
  email: "mailto:suneric0228@gmail.com",
  jobTitle: "AI Engineer & Builder",
  address: { "@type": "PostalAddress", addressLocality: "Sydney", addressCountry: "AU" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "The University of Queensland" },
  sameAs: ["https://github.com/ansonseer", "https://x.com/Ansonseer"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
