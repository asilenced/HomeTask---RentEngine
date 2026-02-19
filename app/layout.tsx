import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Address Insights",
  description: "Get insights about any address - walking score, driving score, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
