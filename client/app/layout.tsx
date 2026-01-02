import type { Metadata } from 'next';
import {  Readex_Pro } from 'next/font/google';
import './globals.css';

const ar = Readex_Pro({
  weight: '400',
});

export const metadata: Metadata = {
  title: 'EndLine',
description: "منصة ذكية لتنظيم الوقت والتركيز الدراسي، مصممة لمساعدتك على الإنجاز والتحرر من ضغوط الدراسة.",};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ar.className} antialiased`}>{children}</body>
    </html>
  );
}
