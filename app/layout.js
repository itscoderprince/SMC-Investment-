import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import InitialAuth from "@/components/InitialAuth";

// Root layout for the application
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "SMC | Grow Your Wealth",
  description: "Invest in top-performing indices with weekly returns of 2-5%",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-slate-900`}
      >
        <InitialAuth />
        <Toaster position="top-right" richColors closeButton />
        {children}
      </body>
    </html>
  );
}
