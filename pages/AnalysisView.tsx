import React, { useEffect, useState } from 'react';
import { Download, AlertTriangle, Activity, ArrowRight, ZoomIn, Microscope } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Scan } from '../types';
import { mockDb } from '../services/mockDb';
import { motion, Variants } from 'framer-motion';

interface AnalysisViewProps {
  scanId: string;
  navigate: (page: string) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ scanId, navigate }) => {
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScan = async () => {
      const data = await mockDb.getScanById(scanId);
      if (data) setScan(data);
      setLoading(false);
    };
    loadScan();
  }, [scanId]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Activity className="w-8 h-8 text-teal-600 animate-spin" /></div>;
  if (!scan || !scan.analysis) return <div className="text-center mt-20 text-slate-500">Scan not found.</div>;

  const { analysis } = scan;

  const graphData = analysis.metrics.slice(0, 5).map(m => ({
    name: m.name,
    Patient: m.value,
    ReferenceMin: m.refMin,
    ReferenceMax: m.refMax,
    Standard: (m.refMax + m.refMin) / 2,
    status: m.status
  }));

  const exportPDF = () => {
    const element = document.getElementById('analysis-report');
    if (element && window.html2pdf) {
      window.html2pdf().from(element).save(`MediVault_Report_${scan.date.split('T')[0]}.pdf`);
    } else {
        alert("PDF generator not ready.");
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score <= 3) return 'bg-emerald-50 text-emerald-800 border-emerald-100';
    if (score <= 7) return 'bg-amber-50 text-amber-800 border-amber-100';
    return 'bg-rose-50 text-rose-800 border-rose-100 animate-urgent';
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
      >
        <div>
          <motion.button 
            whileHover={{ x: -5 }}
            onClick={() => navigate('scans')} 
            className="text-sm font-medium text-slate-400 hover:text-teal-600 mb-2 transition-colors inline-flex items-center"
          >
            &larr; Back to Scans
          </motion.button>
          <h1 className="text-4xl font-bold text-slate-900">{scan.category} Report</h1>
          <p className="text-slate-500">Processed on {new Date(scan.date).toLocaleDateString()}</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportPDF} 
          className="flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all"
        >
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </motion.button>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        id="analysis-report" 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        
        {/* Left Column: Image, Urgency, and Next Steps */}
        <div className="space-y-6">
          {/* Scan Image */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative group h-[500px]"
          >
            <motion.img 
                src={scan.imageUrl} 
                alt="Scan" 
                className="w-full h-full object-contain bg-black"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm pointer-events-none">
                <ZoomIn className="text-white w-10 h-10" />
            </div>
          </motion.div>
          
          {/* Urgency Card */}
          <motion.div 
             variants={itemVariants}
             className={`p-8 rounded-3xl border ${getUrgencyColor(analysis.urgencyScore)} flex items-center justify-between shadow-sm`}
          >
             <div>
                <span className="text-sm font-bold uppercase tracking-wider opacity-80">Urgency Score</span>
                <div className="text-4xl font-bold mt-1">{analysis.urgencyScore}/10</div>
             </div>
             <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
               <Activity className="w-8 h-8" />
             </div>
          </motion.div>

          {/* Recommended Next Steps (Moved to Left Column) */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-teal-500 to-teal-600 p-8 rounded-3xl shadow-lg text-white"
          >
            <h2 className="text-xl font-bold mb-4">Recommended Next Steps</h2>
            <ul className="space-y-3">
                {analysis.nextSteps.map((step, idx) => (
                    <motion.li 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (idx * 0.1) }}
                        className="flex items-start opacity-90"
                    >
                        <ArrowRight className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                        {step}
                    </motion.li>
                ))}
            </ul>
          </motion.div>
        </div>

        {/* Right Column: Overview, Key Obs, Metrics Graph */}
        <div className="space-y-6">
            
          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">Overview</h2>
            <p className="text-slate-600 leading-relaxed text-lg">{analysis.summary}</p>
          </motion.div>

          {/* Biomarkers Breakdown (New Highlighted Section) */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50 pointer-events-none" />
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center relative z-10">
                <Microscope className="w-6 h-6 mr-2 text-indigo-500" /> Biomarker Breakdown
            </h2>
            
            {analysis.metrics.length === 0 ? (
               <p className="text-slate-500 italic">No specific biomarkers extracted from this scan.</p>
            ) : (
               <div className="grid gap-4 relative z-10">
                   {analysis.metrics.map((m, i) => {
                       const isAbnormal = m.status !== 'Normal';
                       const statusColor = isAbnormal ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';
                       const iconColor = isAbnormal ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600';
                       
                       return (
                           <motion.div 
                               key={i} 
                               whileHover={{ scale: 1.02 }}
                               className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isAbnormal ? 'bg-red-50/30 border-red-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}
                           >
                               <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${iconColor}`}>
                                       {m.name.substring(0, 2).toUpperCase()}
                                   </div>
                                   <div>
                                       <h4 className="font-bold text-slate-900 text-lg">{m.name}</h4>
                                       <p className="text-xs text-slate-500 font-medium bg-white px-2 py-0.5 rounded-md inline-block border border-slate-100 mt-1">
                                           Ref: {m.refMin} - {m.refMax} {m.unit}
                                       </p>
                                   </div>
                               </div>
                               <div className="text-right">
                                   <div className={`text-xl font-bold ${isAbnormal ? 'text-red-600' : 'text-slate-900'}`}>
                                       {m.value} <span className="text-xs text-slate-400 font-normal">{m.unit}</span>
                                   </div>
                                   <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor} mt-1 inline-block uppercase tracking-wide`}>
                                       {m.status}
                                   </span>
                               </div>
                           </motion.div>
                       );
                   })}
               </div>
            )}
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" /> Key Observations
            </h2>
            <ul className="space-y-3">
                {analysis.keyObservations.map((obs, idx) => (
                    <li key={idx} className="flex items-start text-slate-700">
                        <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {obs}
                    </li>
                ))}
            </ul>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-slate-100"
          >
             <h2 className="text-xl font-bold text-slate-900 mb-6">Visual Metrics Analysis</h2>
             <div className="h-80 w-full"> 
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="Patient" radius={[4, 4, 0, 0]} name="Your Value" animationDuration={1500}>
                            {graphData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.status === 'Normal' ? '#0d9488' : '#ef4444'} />
                            ))}
                        </Bar>
                        <Bar dataKey="Standard" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Standard Ref" animationDuration={1500} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisView;