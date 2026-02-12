import React, { useRef } from 'react';
import { UploadCloud, ShieldCheck, ArrowRight, FileText, Brain, Sparkles, Lock, Zap, Activity, Bone, Scan, Microscope } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from 'framer-motion';
import { MissionSection, TechStackSection, RoadmapSection, AboutHeroSection } from './About';

interface HomeProps {
  navigate: (page: string, params?: any) => void;
}

const Home: React.FC<HomeProps> = ({ navigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Scroll-linked animations for Hero Section
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.2], [0, 10]);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen pt-16 overflow-hidden bg-slate-50">
      
      {/* 3D Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center perspective-1000 overflow-hidden bg-white">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale, filter: `blur(${heroBlur}px)` }}
          className="max-w-7xl mx-auto text-center px-4 relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-6 py-2 rounded-full bg-slate-50 border border-slate-200 backdrop-blur-md text-slate-800 text-sm font-medium mb-8 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 mr-2 text-teal-600" /> STORE. COMPARE. UNDERSTAND
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-8 tracking-tighter leading-tight">
            <motion.span 
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
              className="block"
            >
              Your Personal
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-500"
            >
              AI Health Vault
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Medical-grade analysis for your scans. <br className="hidden md:block"/>
            Powered by Gemini 2.5 Flash.
          </motion.p>
          
          <div className="flex justify-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('scans')}
              className="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-semibold shadow-2xl hover:shadow-teal-500/30 transition-all"
            >
              Start Analysis <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById('about-intro-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* Abstract Background Elements with Parallax */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-teal-50/50 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              rotate: [360, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px]" 
          />
        </div>
      </section>

      {/* Redesigned Apple-Style Process Section */}
      <ProcessSection navigate={navigate} />

      {/* NEW Scan Vaults Section (Tech Stack Style) */}
      <ScanVaultSection navigate={navigate} />

      {/* Moved About Sections */}
      <div id="about-intro-section">
          <AboutHeroSection />
      </div>
      <div id="mission-section">
        <MissionSection />
      </div>
      <TechStackSection />
      <RoadmapSection />

    </div>
  );
};

// --- PROCESS SECTION (Apple Style - How It Works Only) ---
const ProcessSection = ({ navigate }: { navigate: (page: string, params?: any) => void }) => {
  const steps = [
    {
      id: "01",
      title: "Upload.",
      desc: "Drag, drop & store your medical scans. We encrypt everything locally before secure upload.",
      icon: UploadCloud,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      id: "02",
      title: "Analyze.",
      desc: "Gemini AI instantly decodes complex medical jargon into clear, actionable insights.",
      icon: Brain,
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      id: "03",
      title: "Track.",
      desc: "Monitor your health timeline. Compare results over months to spot trends early.",
      icon: Activity,
      color: "text-teal-500",
      bg: "bg-teal-50"
    }
  ];

  return (
    <section className="py-32 bg-[#F5F5F7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
         <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] mb-4 tracking-tight">How it works.</h2>
             <p className="text-xl text-[#86868b] font-medium">Three simple steps to clarity.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
               <motion.div 
                 key={index}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 whileHover={{ y: -10 }}
                 transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                 viewport={{ once: true }}
                 className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgb(0,0,0,0.08)] transition-all duration-500 border border-slate-100 relative overflow-hidden group"
               >
                   <div className="absolute top-4 right-8 text-[8rem] font-bold text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 select-none -z-0 pointer-events-none leading-none">
                       {step.id}
                   </div>

                   <div className={`w-20 h-20 ${step.bg} rounded-3xl flex items-center justify-center mb-8 z-10 group-hover:scale-110 transition-transform duration-300 relative`}>
                       <step.icon className={`w-10 h-10 ${step.color}`} />
                   </div>
                   
                   <h3 className="text-3xl font-semibold text-[#1d1d1f] mb-4 z-10 relative">{step.title}</h3>
                   <p className="text-[#86868b] text-lg leading-relaxed z-10 font-medium relative">
                       {step.desc}
                   </p>
               </motion.div>
            ))}
         </div>
      </div>
    </section>
  );
};

// --- NEW SCAN VAULTS SECTION (Tech Stack Style) ---
const ScanVaultSection = ({ navigate }: { navigate: (page: string, params?: any) => void }) => {
    const categories = [
      { name: "MRI", icon: Brain, type: "MRI Scan", desc: "Neurology", color: "bg-indigo-500" },
      { name: "Blood", icon: Activity, type: "Blood Report", desc: "Pathology", color: "bg-rose-500" },
      { name: "X-Ray", icon: Bone, type: "X-Ray", desc: "Radiology", color: "bg-slate-500" },
      { name: "CT Scan", icon: Scan, type: "CT Scan", desc: "Imaging", color: "bg-blue-500" }
    ];

    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative perspective-1000">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#F5F5F7] to-transparent z-10 opacity-10"></div>
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                     <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Scan Vaults</h2>
                     <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                        Secure, categorized storage for your medical imaging. Select a vault to begin.
                     </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                    {categories.map((cat, idx) => (
                        <FloatingVaultCard key={idx} cat={cat} index={idx} navigate={navigate} />
                    ))}
                </div>
            </div>
        </section>
    )
}

const FloatingVaultCard = ({ cat, index, navigate }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            animate={{ y: [0, -12, 0] }}
            // @ts-ignore
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
            onClick={() => navigate('upload', { type: cat.type })}
            className="relative group w-48 h-48 md:w-56 md:h-56 cursor-pointer"
        >
            {/* Glow Effect */}
            <div className={`absolute inset-0 ${cat.color} rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-40 transition-opacity duration-500`}></div>
            
            {/* Card Content */}
            <div className="absolute inset-0 bg-slate-800 border border-slate-700/50 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:border-slate-500 hover:bg-slate-750 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/50">
                <div className="mb-4 text-slate-400 group-hover:text-white transition-colors duration-300 transform group-hover:scale-110 p-3 rounded-2xl bg-slate-900/50 border border-slate-700">
                    <cat.icon className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <span className="font-bold text-lg md:text-xl mb-1 text-slate-100 tracking-tight">{cat.name}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{cat.desc}</span>
            </div>
        </motion.div>
    )
}

export default Home;