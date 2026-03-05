import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, MotionValue } from 'framer-motion';
import { Activity, Shield, Brain, Globe, Zap, Lock, Database, Smartphone, Users, Bell, Share2, FileText, Stethoscope } from 'lucide-react';

const About: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

    return (
        <div ref={containerRef} className="bg-slate-50 min-h-screen relative overflow-hidden">
            {/* Global Parallax Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div style={{ y: backgroundY, opacity }} className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-400/5 rounded-full blur-[120px]" />
                <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]), opacity }} className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            </div>

            <AboutHeroSection />
            <MissionSection />
            <TechStackSection />
            <RoadmapSection />
            <FooterSection />
        </div>
    );
};

// --- HERO SECTION (Redefining Section) ---
export const AboutHeroSection: React.FC = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-100px" });

    return (
        <section ref={ref} className="relative py-32 flex items-center justify-center perspective-1000 z-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center px-4 max-w-4xl mx-auto"
            >
                <motion.div
                    initial={{ rotateX: 90, opacity: 0 }}
                    animate={isInView ? { rotateX: 0, opacity: 1 } : {}}
                    transition={{ duration: 1, type: "spring", delay: 0.2 }}
                    className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-3xl shadow-xl shadow-teal-500/20"
                >
                    <Activity className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-6 tracking-tighter">
                    Redefining <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600">Health Intelligence</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    MediVault bridges the gap between complex medical data and human understanding using Generative AI.
                </p>

                {/* Floating 3D Elements */}
                <div className="absolute inset-0 pointer-events-none -z-10">
                    <FloatingIcon icon={Brain} className="top-1/4 left-1/4 text-indigo-200 w-24 h-24" delay={0} />
                    <FloatingIcon icon={Shield} className="bottom-1/3 right-1/4 text-teal-200 w-16 h-16" delay={2} />
                    <FloatingIcon icon={Database} className="top-1/3 right-10 text-slate-200 w-20 h-20" delay={4} />
                </div>
            </motion.div>
        </section>
    );
};

const FloatingIcon = ({ icon: Icon, className, delay }: any) => (
    <motion.div
        animate={{
            y: [-20, 20, -20],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
        }}
        transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay
        }}
        className={`absolute ${className} opacity-50 blur-sm`}
    >
        <Icon className="w-full h-full" />
    </motion.div>
);

// --- MISSION SECTION ---
export const MissionSection: React.FC = () => {
    return (
        <section className="py-20 px-4 max-w-7xl mx-auto z-10 relative">
            <div className="mb-24 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Core Mission</h2>
                <div className="h-1 w-24 bg-teal-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
                <MissionCard
                    icon={Globe}
                    title="Accessibility"
                    desc="Making medical data understandable for everyone, regardless of medical background."
                    delay={0}
                />
                <MissionCard
                    icon={Lock}
                    title="Privacy First"
                    desc="Your health data is encrypted and stored securely. You own your data, always."
                    delay={0.1}
                />
                <MissionCard
                    icon={Database}
                    title="Digital Vault"
                    desc="A permanent, organized home for your medical history. Track trends over years, not just days."
                    delay={0.2}
                />
                <MissionCard
                    icon={Zap}
                    title="Instant Clarity"
                    desc="Replacing days of anxiety waiting for doctor appointments with instant AI analysis."
                    delay={0.3}
                />
            </div>
        </section>
    )
}

const MissionCard = ({ icon: Icon, title, desc, delay }: any) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, rotateX: 45, y: 100 }}
            animate={isInView ? { opacity: 1, rotateX: 0, y: 0 } : {}}
            transition={{ duration: 0.8, delay, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.05, rotateX: 5, z: 50 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 group transform-style-3d cursor-pointer flex flex-col items-start"
        >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                <Icon className="w-7 h-7 text-slate-900 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-700 transition-colors">
                {desc}
            </p>
        </motion.div>
    )
}

// --- TECH STACK SECTION ---
export const TechStackSection = () => {
    const stack = [
        { name: "Gemini 2.5 Flash", role: "Reasoning Engine", color: "bg-blue-500" },
        { name: "React 19", role: "UI/UX Core", color: "bg-cyan-500" },
        { name: "Supabase", role: "Backend", color: "bg-emerald-500" },
        { name: "PostgreSQL", role: "Database", color: "bg-sky-500" },
    ];

    return (
        <section className="py-20 bg-slate-900 text-white overflow-hidden relative perspective-1000">
            <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-16 text-center opacity-80">Powered By Modern Tech</h2>
                <div className="flex flex-wrap justify-center gap-8">
                    {stack.map((tech, i) => (
                        <FloatingTechCard key={i} tech={tech} index={i} />
                    ))}
                </div>
            </div>

            {/* Background Mesh */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </section>
    )
}

const FloatingTechCard = ({ tech, index }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
            className="relative group w-48 h-32"
        >
            <div className={`absolute inset-0 ${tech.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity`}></div>
            <div className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-slate-500 transition-colors">
                <span className="font-bold text-lg mb-1">{tech.name}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">{tech.role}</span>
            </div>
        </motion.div>
    )
}

// --- ROADMAP SECTION ---
export const RoadmapSection: React.FC = () => {
    const roadmapData = [
        {
            icon: Smartphone,
            title: "Mobile App",
            desc: "Native iOS and Android apps for scanning and viewing reports on the go.",
        },
        {
            icon: FileText,
            title: "DICOM Support",
            desc: "Full support for DICOM format to directly import scans from medical imaging centers.",
        },
        {
            icon: Users,
            title: "Family Sharing",
            desc: "Share scans and reports with family members or caregivers with granular privacy controls.",
        },
        {
            icon: Bell,
            title: "Smart Reminders",
            desc: "AI-powered reminders for follow-up scans based on your health patterns and doctor recommendations.",
        },
        {
            icon: Share2,
            title: "Provider Integration",
            desc: "Direct integration with healthcare providers to automatically import scans and share reports.",
        },
        {
            icon: Stethoscope,
            title: "Telemedicine Integration",
            desc: "Connect with healthcare providers for virtual consultations about your scan results.",
        }
    ];

    return (
        <section className="py-32 max-w-5xl mx-auto px-4 relative z-10">
            <div className="mb-24 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Future Roadmap</h2>
                <p className="text-xl text-slate-500">The journey to a complete health ecosystem.</p>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 via-indigo-500 to-slate-200 rounded-full transform -translate-x-1/2"></div>

                <div className="space-y-24">
                    {roadmapData.map((item, index) => (
                        <RoadmapItem
                            key={index}
                            side={index % 2 === 0 ? 'left' : 'right'}
                            icon={item.icon}
                            title={item.title}
                            desc={item.desc}
                            date={item.date}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

const RoadmapItem = ({ side, icon: Icon, title, desc, date }: any) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });

    return (
        <div ref={ref} className={`relative flex items-center ${side === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}>
            {/* Center Node */}
            <div className="absolute left-8 md:left-1/2 w-12 h-12 bg-white border-4 border-teal-500 rounded-full z-10 transform -translate-x-1/2 flex items-center justify-center shadow-lg">
                <div className={`w-3 h-3 bg-teal-500 rounded-full transition-all duration-500 ${isInView ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
            </div>

            {/* Spacer for Mobile layout */}
            <div className="w-20 md:w-1/2"></div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, x: side === 'left' ? -50 : 50, rotateY: side === 'left' ? 20 : -20 }}
                animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className={`flex-1 ${side === 'left' ? 'md:pr-12 md:text-right pl-4' : 'md:pl-12 md:text-left pl-4'}`}
            >
                <div className={`bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow ${side === 'left' ? 'ml-6 md:ml-0' : 'ml-6 md:ml-0'}`}>
                    <div className={`flex items-center gap-4 mb-4 ${side === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                        <div className="p-3 bg-slate-100 rounded-xl">
                            <Icon className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-teal-600 tracking-wider uppercase">{date}</span>
                            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                        </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{desc}</p>
                </div>
            </motion.div>
        </div>
    )
}

const FooterSection = () => (
    <div className="bg-slate-900 text-slate-400 py-12 text-center relative z-10 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-4">
            <h3 className="text-white text-lg font-bold mb-4">MediVault AI</h3>
            <p className="mb-8">Empowering patients through technology.</p>
            <div className="flex justify-center gap-6 text-sm">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Contact Support</span>
            </div>
        </div>
    </div>
)

export default About;