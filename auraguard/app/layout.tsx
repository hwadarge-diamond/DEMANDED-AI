import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "AuraGuard — Your City's Climate-Health Guardian",
  description:
    "Autonomous Agentic AI sensing live environmental telemetry from Open-Meteo, assessing clinical risks deterministically, and producing safe, personalized climate-health protection protocols.",
  keywords: [
    "AuraGuard",
    "Agentic AI",
    "Climate Health",
    "Air Quality",
    "Heatwave Warning",
    "Open-Meteo",
    "Vulnerable Health Protection",
    "Three.js Living City",
  ],
  authors: [{ name: "AuraGuard Autonomous Systems" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-aura-darkest text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
