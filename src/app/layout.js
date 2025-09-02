import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chat App",
  description: "Chat App with Socket IO",
};

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <main className="container mx-auto px-4 py-8">{children}</main>

          <Toaster richColors />
        </body>
      </html>
    </>
  );
}
