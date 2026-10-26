import { Sarabun } from "next/font/google";
import "./globals.css";

const font = Sarabun({ subsets: ["thai", "latin"], weight: ["400", "600", "800"] });

export const metadata = { title: "แบบทดสอบออนไลน์" };

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={font.className}>{children}</body>
    </html>
  );
}
