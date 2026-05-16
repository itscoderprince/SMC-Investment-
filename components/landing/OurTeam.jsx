// Server Component — uses next/image with static data, fully SSR-able

import Image from "next/image";
import { Users } from "lucide-react";

const teamMembers = [
    {
        name: "SMC Co-Founder",
        role: "Co-Founder & CEO",
        image: "/Team/smc-co-founder.jpeg",
        description:
            "Visionary leader steering SMC towards excellence with strategic direction and innovation.",
    },
    {
        name: "SMC Fund Manager",
        role: "Fund Manager",
        image: "/Team/smc-fund-manager.jpeg",
        description:
            "Expert fund manager driving high-yield portfolio strategies with precision and expertise.",
    },
    {
        name: "Index Manager",
        role: "Index Manager",
        image: "/Team/index-manager.jpeg",
        description:
            "Specialist in index tracking and market analytics ensuring optimal fund performance.",
    },
];

const OurTeam = () => {
    return (
        <section
            id="our-team"
            className="py-24 px-4 md:px-6 relative overflow-hidden bg-[#020617]"
        >
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Section Header */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                        <Users className="w-3 h-3" aria-hidden="true" />
                        Leadership
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6">
                        Meet Our{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                            Team
                        </span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        A dedicated team of financial experts and strategists committed to
                        maximizing your returns with transparency and trust.
                    </p>
                    <div className="h-1 bg-blue-600 mx-auto rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] w-20 mt-6" />
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(37,99,235,0.08)]"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Image Container */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    loading="lazy"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-80" />

                                {/* Role Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                        {member.role}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative p-6 -mt-16 z-10">
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 mb-2">
                                    {member.name}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {member.description}
                                </p>

                                {/* Decorative line */}
                                <div className="mt-4 h-[1px] w-12 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full group-hover:w-full transition-all duration-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurTeam;
