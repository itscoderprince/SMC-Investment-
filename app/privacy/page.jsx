"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto max-w-4xl px-4 md:px-6">
                    {/* Header */}
                    <div className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Shield className="w-3 h-3" />
                            Data Security
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
                            Privacy <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Policy</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                            Your privacy is our priority. Learn how SMC INDEX LLC handles your data with institutional-grade security and transparency.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-invert max-w-none space-y-12">
                        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                                    <Eye className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-white m-0">Information Collection</h2>
                            </div>
                            <div className="space-y-4 text-slate-400 leading-relaxed">
                                <p>We collect information necessary to provide our financial services, including:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Personal identification information (Name, email address, phone number).</li>
                                    <li>KYC documentation as required by Russian and EU regulations (Passport, proof of address).</li>
                                    <li>Financial information related to your USDT transactions and investment preferences.</li>
                                    <li>Technical data such as IP addresses and browser types for security monitoring.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-white m-0">Data Protection</h2>
                            </div>
                            <div className="space-y-4 text-slate-400 leading-relaxed">
                                <p>SMC employs multi-layered security protocols to safeguard your assets and data:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>End-to-end encryption for all sensitive data transfers.</li>
                                    <li>Cold storage solutions for major asset reserves.</li>
                                    <li>Strict access controls restricted to authorized compliance personnel.</li>
                                    <li>Regular third-party security audits and forensic monitoring.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-white m-0">Data Disclosure</h2>
                            </div>
                            <div className="space-y-4 text-slate-400 leading-relaxed">
                                <p>We do not sell your personal data. Disclosure only occurs in the following circumstances:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Compliance with legal obligations under Russian or EU jurisdiction.</li>
                                    <li>To protect the rights, property, or safety of SMC, our clients, or others.</li>
                                    <li>With your explicit consent for specific service integrations.</li>
                                </ul>
                            </div>
                        </section>

                        <div className="text-center pt-8">
                            <p className="text-sm text-slate-500 font-medium italic">
                                Last Updated: February 23, 2026. For privacy inquiries, contact Smcruteam@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
