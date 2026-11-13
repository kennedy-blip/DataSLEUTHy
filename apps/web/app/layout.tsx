import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataSleuth | Local-First Data Analytics",
  description: "Drag-and-drop CSV analytics with SQL query console.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}