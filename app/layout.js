import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import InitialAuth from "@/components/InitialAuth";
import Providers from "@/components/Providers";

// Root layout for the application
const inter = Inter({
  variable: "--font-inter",
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
        className={`${inter.variable} font-sans antialiased bg-white text-slate-900`}
      >
        <Providers>
          <InitialAuth />
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
