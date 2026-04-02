"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Scale, AlertCircle, CheckCircle2, Gavel } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto max-w-4xl px-4 md:px-6">
                    {/* Header */}
                    <div className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Scale className="w-3 h-3" />
                            Legal Framework
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
                            Terms of <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Service</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                            Please review the terms and conditions governing your use of the SMC INDEX LLC platform and services.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-invert max-w-none space-y-12">
                        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-white m-0">1. Eligibility</h2>
                            </div>
                            <div className="space-y-4 text-slate-400 leading-relaxed">
                                <p>By accessing the SMC platform, you represent and warrant that:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>You are at least 18 years of age or the legal age of majority in your jurisdiction.</li>
                                    <li>You have the legal authority to enter into these terms.</li>
                                    <li>You are not a resident of any jurisdiction where our services are prohibited by law.</li>
                                    <li>You will provide accurate and complete information during the registration and KYC process.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-white m-0">2. Risk Disclosure</h2>
                            </div>
                            <div className="space-y-4 text-slate-400 leading-relaxed">
                                <p>Investing in financial markets and cryptocurrencies involves significant risk:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Market volatility can lead to substantial losses of capital.</li>
                                    <li>Past performance of indices or traders is not indicative of future results.</li>
                                    <li>SMC provides the platform and technology, but all investment decisions are the responsibility of the user.</li>
                                    <li>Users should only invest capital they can afford to lose.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                                    <Gavel className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-white m-0">3. Governing Law</h2>
                            </div>
                            <div className="space-y-4 text-slate-400 leading-relaxed">
                                <p>These terms shall be governed by and construed in accordance with the laws of Russia. Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts located in Moscow, Russia. SMC INDEX LLC's EU operations are also subject to applicable EU Forex regulations.</p>
                            </div>
                        </section>

                        <div className="text-center pt-8">
                            <p className="text-sm text-slate-500 font-medium italic">
                                Last Updated: February 23, 2026. For legal inquiries, contact Smcruteam@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
