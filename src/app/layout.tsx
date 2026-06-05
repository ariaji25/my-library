import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Rak buku digital pribadi Arinda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${cormorant.variable} min-h-screen antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
