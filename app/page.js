import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Ticker from "@/components/landing/Ticker";
import IndicesPreview from "@/components/landing/IndicesPreview";
import AuthRedirect from "@/components/AuthRedirect";
import dynamic from 'next/dynamic';

const Features = dynamic(() => import("@/components/landing/Features"));
const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks"));
const OurTeam = dynamic(() => import("@/components/landing/OurTeam"));
const ProtectiveIndex = dynamic(() => import("@/components/landing/ProtectiveIndex"));
const Footer = dynamic(() => import("@/components/landing/Footer"));

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30 selection:text-blue-200 scroll-smooth">
      <AuthRedirect />
      <Navbar />
      <main>
        <Hero />
        <IndicesPreview />
        <Ticker />
        <Features />
        <HowItWorks />
        <OurTeam />
        <ProtectiveIndex />
      </main>
      <Footer />
    </div>
  );
}
