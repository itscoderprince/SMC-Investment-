// Server Component — no hooks, static navigation/links, fully SSR-able

import { Shield, Twitter, Linkedin, Github, Youtube, Mail, ArrowRight, Landmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Footer = () => {
    return (
        <footer id="footer" className="bg-[#020617] text-slate-400 py-16 border-t border-white/5 font-sans">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Column 1: Brand */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="flex items-center gap-2.5 group w-fit">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg">
                                <Shield className="h-4 w-4 fill-current" />
                            </div>
                            <span className="font-semibold text-xl text-white tracking-tight">
                                SMC
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400/80 leading-relaxed max-w-sm font-normal">
                            SMC INDEX LLC is registered in Russia (Registration Number 4093786) and also registered in the European Union, holding the necessary EU Forex License No. EUFX74355. The company is also registered under the Financial Services Commission (FSC) with Registration Number FSC/468/LLC 7902/25, and it provides secure and transparent forex and crypto trading services.
                        </p>
                        <div className="flex gap-3">
                            <Link 
                                href="mailto:Smcruteam@gmail.com" 
                                aria-label="Send email to SMC Support"
                                className="h-9 w-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-slate-400"
                            >
                                <Mail size={16} aria-hidden="true" />
                            </Link>
                            {[
                                { Icon: Twitter, label: "Twitter" },
                                { Icon: Linkedin, label: "LinkedIn" },
                                { Icon: Github, label: "GitHub" }
                            ].map(({ Icon, label }, i) => (
                                <Link 
                                    key={i} 
                                    href="#" 
                                    aria-label={`Follow us on ${label}`}
                                    className="h-9 w-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-slate-400"
                                >
                                    <Icon size={16} aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Platform */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white font-semibold text-sm">Protocol</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="#features" className="hover:text-blue-500 transition-colors">Services</Link></li>
                            <li><Link href="#how-it-works" className="hover:text-blue-500 transition-colors">Verification</Link></li>
                            <li><Link href="#indices" className="hover:text-blue-500 transition-colors">Market Indices</Link></li>
                            <li><Link href="/login" className="hover:text-blue-500 transition-colors">Terminal Access</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Account */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-white font-semibold text-sm">Account</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/dashboard" className="hover:text-blue-500 transition-colors">Client Dashboard</Link></li>
                            <li><Link href="/invest" className="hover:text-blue-500 transition-colors">Investment Plans</Link></li>
                            <li><Link href="/referrals" className="hover:text-blue-500 transition-colors">Affiliate Program</Link></li>
                            <li><Link href="/support" className="hover:text-blue-500 transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div className="lg:col-span-4 space-y-6">
                        <h4 className="text-white font-semibold text-sm">Sync Reports</h4>
                        <p className="text-sm text-slate-400/80 leading-relaxed font-normal">Subscribe to receive weekly forensic auditing digests and market volatility alerts.</p>
                        <div className="flex gap-2">
                            <label htmlFor="newsletter-email" className="sr-only">Subscribe to institutional reports</label>
                            <input
                                id="newsletter-email"
                                type="email"
                                placeholder="Institutional email..."
                                className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-colors placeholder:text-slate-600"
                            />
                            <Button 
                                size="icon" 
                                aria-label="Subscribe to newsletter"
                                className="h-auto w-10 bg-blue-600 hover:bg-blue-700 rounded-xl"
                            >
                                <ArrowRight size={16} aria-hidden="true" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-500/80">
                            <Landmark className="w-3.5 h-3.5" />
                            Certified Institutional Partner
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-1.5 text-center md:text-left">
                        <p className="text-xs text-slate-400 font-medium">
                            &copy; {new Date().getFullYear()} SMC Capital Management Protocol.
                        </p>
                        <p className="text-[10px] text-slate-600 max-w-2xl leading-relaxed">
                            Company Address: Dmitrovskoye Highway, building Number 58C, 127238, Moscow, Russia.
                            <br />
                            Nearest Metro: Delovoy Tsentr Metro Station,
                            Landmark: Near the Moscow-City International Business Center.
                        </p>
                    </div>
                    <div className="flex gap-6 text-xs text-slate-400 font-medium">
                        <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
                        <Link href="#indices" className="hover:text-slate-300 transition-colors">Registry</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
