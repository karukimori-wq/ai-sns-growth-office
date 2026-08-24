import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI SNS Growth Office",
  description: "CEO dashboard for an AI-agent SNS marketing company"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
