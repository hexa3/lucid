import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lucid — The AI tutor that finds where understanding breaks",
  description:
    "Lucid uses the Feynman technique to diagnose exactly where understanding breaks, then teaches to that gap with personalized analogies and spaced repetition.",
  keywords: [
    "AI tutor",
    "education",
    "Feynman technique",
    "spaced repetition",
    "misconception diagnosis",
    "personalized learning",
  ],
  openGraph: {
    title: "Lucid — The AI tutor that finds where understanding breaks",
    description:
      "Explain a concept in your own words. Lucid diagnoses your specific misconception, then teaches to it with a personalized analogy.",
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
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
