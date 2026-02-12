import React, { useRef, useState, useEffect } from 'react';
import { FileText, Brain, Bone, Scan, Microscope, Calendar, Activity, ChevronRight, Database, CheckSquare, Square } from 'lucide-react';
import { ScanCategory, Scan as ScanType } from '../types';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { mockDb } from '../services/mockDb';

interface ScanDashboardProps {
  navigate: (page: string, params?: any) => void;
}

const ScanDashboard: React.FC<ScanDashboardProps> = ({ navigate }) => {
  const [history, setHistory] = useState<ScanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
        const data = await mockDb.getScans();
        // Sort by date desc
        const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(sorted);
        setLoading(false);
    };
    fetchHistory();
  }, []);

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click navigation
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
      navigate('compare', { ids: selectedIds });
  };

  const scanTypes = [
    { type: ScanCategory.BLOOD, icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50', desc: "Hemoglobin, Lipid Profile, etc.", border: 'group-hover:border-rose-200' },
    { type: ScanCategory.MRI, icon: Brain, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: "Brain, Spine, Soft Tissue", border: 'group-hover:border-indigo-200' },
    { type: ScanCategory.XRAY, icon: Bone, color: 'text-slate-600', bg: 'bg-slate-100', desc: "Fractures, Lung Infections", border: 'group-hover:border-slate-300' },
    { type: ScanCategory.CT, icon: Scan, color: 'text-blue-500', bg: 'bg-blue-50', desc: "Internal Organ Scanning", border: 'group-hover:border-blue-200' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 min-h-screen relative bg-[#FBFBFD]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Scan Dashboard</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Select a diagnostic category to begin your AI-powered analysis.</p>
      </motion.div>

      {/* New Scan Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000 mb-24">
        {scanTypes.map((item, index) => (
          <Tilt3DCard 
            key={item.type} 
            item={item} 
            index={index} 
            onClick={() => navigate('upload', { type: item.type })} 
          />
        ))}
      </div>

      {/* Storage / Vault Section */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
        className="pt-12"
      >
        <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center">
                <div className="p-3 bg-white rounded-2xl mr-4 shadow-sm border border-slate-100">
                    <Database className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Recent Vault Activity</h2>
                    <p className="text-slate-500 text-sm">Securely stored medical records.</p>
                </div>
            </div>
            {selectedIds.length > 0 && (
                <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, color: "#ef4444" }}
                    onClick={() => setSelectedIds([])}
                    className="text-sm font-semibold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                    Clear Selection ({selectedIds.length})
                </motion.button>
            )}
        </div>

        {loading ? (
            <div className="text-center py-12 text-slate-400">Loading vault...</div>
        ) : history.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-16 bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">Vault is Empty</h3>
                <p className="text-slate-500 mb-6">You haven't uploaded any scans yet.</p>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-teal-600 font-medium hover:underline">Start your first analysis &uarr;</button>
            </motion.div>
        ) : (
            <motion.div variants={containerVariants} className="grid gap-4 mb-24">
                {history.slice(0, 10).map((scan) => {
                    const isSelected = selectedIds.includes(scan.id);
                    return (
                        <motion.div
                            key={scan.id}
                            variants={itemVariants}
                            layout
                            whileHover={{ 
                                scale: 1.005, 
                                backgroundColor: "#ffffff",
                                borderColor: "#cbd5e1"
                            }}
                            className={`group bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer relative ${
                                isSelected ? 'border-teal-500 ring-1 ring-teal-500 bg-teal-50/10' : 'border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
                            }`}
                            onClick={() => navigate('analysis', { id: scan.id })}
                        >
                             {/* Selection Checkbox Area */}
                            <div 
                                className="absolute top-4 right-4 md:relative md:top-auto md:right-auto md:order-first z-10"
                                onClick={(e) => toggleSelection(e, scan.id)}
                            >
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    {isSelected ? (
                                        <CheckSquare className="w-6 h-6 text-teal-600 fill-teal-100" />
                                    ) : (
                                        <Square className="w-6 h-6 text-slate-300 group-hover:text-slate-400 transition-colors" />
                                    )}
                                </motion.div>
                            </div>

                            <div className="w-full md:w-24 h-40 md:h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 relative">
                                <img src={scan.imageUrl} alt="Scan thumbnail" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity" />
                            </div>
                            
                            <div className="flex-grow min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100 text-[10px] font-bold uppercase tracking-wider">
                                        {scan.category}
                                    </span>
                                    <span className="flex items-center text-xs text-slate-400 font-medium">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(scan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors truncate">
                                    {scan.analysis?.summary || "Analysis Processing..."}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className={`flex items-center px-2 py-0.5 rounded-md ${scan.analysis && scan.analysis.urgencyScore > 7 ? 'bg-red-50 text-red-600 font-bold' : scan.analysis && scan.analysis.urgencyScore > 3 ? 'bg-amber-50 text-amber-600 font-medium' : 'bg-emerald-50 text-emerald-600 font-medium'}`}>
                                        <Activity className="w-3.5 h-3.5 mr-1.5" />
                                        Urgency Level: {scan.analysis?.urgencyScore}/10
                                    </span>
                                </div>
                            </div>

                            <div className="hidden md:block self-center pr-2">
                                <div className="p-2 rounded-full bg-slate-50 text-slate-300 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all duration-300">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        )}
      </motion.div>

      {/* Floating Compare Button */}
      <AnimatePresence>
        {selectedIds.length >= 2 && (
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none"
            >
                <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl text-white rounded-full shadow-2xl shadow-slate-900/40 p-2 pl-6 pr-2 flex items-center gap-6 border border-white/10 ring-1 ring-black/5">
                    <span className="font-medium text-sm">
                        <span className="font-bold text-teal-400">{selectedIds.length}</span> Scans Selected
                    </span>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCompare}
                        className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-2.5 rounded-full font-bold transition-colors shadow-lg flex items-center gap-2"
                    >
                        Compare Reports <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Physics-based 3D Tilt Card
const Tilt3DCard: React.FC<{ item: any; index: number; onClick: () => void }> = ({ item, index, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    x.set((e.clientX - rect.left) / width - 0.5);
    y.set((e.clientY - rect.top) / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`group cursor-pointer relative h-80 rounded-[2.5rem] bg-white border border-slate-100 ${item.border} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgb(0,0,0,0.12)] transition-shadow duration-500`}
    >
      <div style={{ transform: "translateZ(50px)" }} className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center backface-hidden">
        <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`${item.bg} w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-inner transition-colors duration-300 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <item.icon className={`${item.color} w-10 h-10`} />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{item.type}</h3>
        <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
        
        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
             <span className="text-sm font-bold text-teal-600 flex items-center">Start Analysis <ChevronRight className="w-4 h-4 ml-1" /></span>
        </div>
      </div>
      
      {/* Dynamic Sheen Effect */}
      <motion.div 
        style={{ background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.6), transparent 60%)` }}
        className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay" 
      />
    </motion.div>
  );
};

export default ScanDashboard;