import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HSE-F002-Permiso para trabajos en alturas",
  description: "Formulario HSE F002",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
