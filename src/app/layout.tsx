import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeRegistry from "../components/ThemeRegistry";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Powder Meter",
  description: "Find the best snow days",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
