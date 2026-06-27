import type { Metadata } from "next";
import { Manrope, Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HD Tech Solutions | Premium Computer Sales, Networking & CCTV Security",
  description: "Enterprise-grade CCTV systems, premium computer & laptop sales, custom PC building, wireless networking solutions (LAN/WAN/WiFi), and AMC maintenance for homes and offices.",
  keywords: ["HD Tech Solutions", "Computer Sales", "Laptop Repair", "CCTV Installation", "Networking", "WiFi Setup", "AMC Solutions"],
  authors: [{ name: "HD Tech Solutions Team" }],
  openGraph: {
    title: "HD Tech Solutions | Premium IT & CCTV Services",
    description: "Expert security camera setups, network infrastructure, and computer hardware sales.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#101415] text-[#e0e3e5] selection:bg-[#bdf4ff]/30 selection:text-[#bdf4ff]">
        {children}
      </body>
    </html>
  );
}

