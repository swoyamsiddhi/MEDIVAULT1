import React, { useEffect, useState } from 'react';
import { geminiService } from '../services/gemini';
import { mockDb } from '../services/mockDb';
import { Scan, ComparisonResult, SavedComparison } from '../types';
import { CheckCircle, TrendingUp, ArrowDownRight, ArrowUpRight, Minus, AlertCircle, Sparkles, Save, Trash2, Bookmark, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompareModeProps {
  navigate: (page: string) => void;
  preSelectedIds?: string[];
}

const CompareMode: React.FC<CompareModeProps> = ({ navigate, preSelectedIds }) => {
  // Default to 'saved' tab if no specific IDs are passed (i.e. user came from 'Saved' nav link)
  const [activeTab, setActiveTab] = useState<'new' | 'saved'>(preSelectedIds && preSelectedIds.length > 0 ? 'new' : 'saved');
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load all scans and saved comparisons
  useEffect(() => {
    const fetchData = async () => {
      const allScans = await mockDb.getScans();
      setScans(allScans);
      
      const saved = await mockDb.getComparisons();
      setSavedComparisons(saved);

      if (preSelectedIds && preSelectedIds.length > 0) {
        setSelectedIds(preSelectedIds);
        setActiveTab('new');
        // Optional: Auto-trigger comparison if passing IDs implies immediate action
        // For now, let user click "Compare" to confirm.
      }
    };
    fetchData();
  }, [preSelectedIds]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    setComparison(null);
    try {
      const selectedScans = scans.filter(s => selectedIds.includes(s.id));
      const result = await geminiService.compareScans(selectedScans);
      setComparison(result);
    } catch (e) {
      console.error(e);
      alert("Failed to compare scans.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!comparison) return;
    setIsSaving(true);
    const selectedScans = scans.filter(s => selectedIds.includes(s.id));
    const title = `Comparison: ${selectedScans.map(s => s.category).join(' & ')} (${new Date().toLocaleDateString()})`;
    
    const newSave: SavedComparison = {
        id: mockDb.generateId(),
        date: new Date().toISOString(),
        title,
        scanIds: selectedIds,
        result: comparison
    };

    await mockDb.saveComparison(newSave);
    const updated = await mockDb.getComparisons();
    setSavedComparisons(updated);
    setIsSaving(false);
    alert("Comparison saved successfully to your vault!");
    setActiveTab('saved'); // Switch to saved tab after saving
  };

  const loadSavedComparison = (saved: SavedComparison) => {
      setComparison(saved.result);
      setSelectedIds(saved.scanIds);
      setActiveTab('new'); // Switch to view mode (reusing the new tab UI for viewing logic)
  };

  const deleteSaved = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this saved report?")) {
          await mockDb.deleteComparison(id);
          const updated = await mockDb.getComparisons();
          setSavedComparisons(updated);
      }
  };

  const getTrendIcon = (change: string) => {
    if (!change) return <Minus className="text-slate-400 w-4 h-4" />;
    if (change.includes('+') || change.toLowerCase().includes('inc')) return <ArrowUpRight className="text-red-500 w-4 h-4" />;
    if (change.includes('-') || change.toLowerCase().includes('dec')) return <ArrowDownRight className="text-green-500 w-4 h-4" />;
    return <Minus className="text-slate-400 w-4 h-4" />;
  };

  const isSignificantChange = (changeStr: string) => {
    if (!changeStr) return false;
    const cleanStr = changeStr.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleanStr);
    return !isNaN(val) && val > 10;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-teal-600" />
            Saved Analysis
        </h1>
        <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-inner">
            <button 
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'saved' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
                <Bookmark className="w-4 h-4" />
                Saved Reports ({savedComparisons.length})
            </button>
            <button 
                onClick={() => { setActiveTab('new'); setComparison(null); setSelectedIds([]); }}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
                <Plus className="w-4 h-4" />
                Create New
            </button>
        </div>
      </div>
      
      {activeTab === 'saved' ? (
           <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="grid gap-4"
            >
               {savedComparisons.length === 0 ? (
                   <div className="text-center py-24 text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Bookmark className="w-8 h-8 text-slate-300" />
                       </div>
                       <h3 className="text-lg font-semibold text-slate-700">No saved reports</h3>
                       <p className="max-w-xs mx-auto mb-6">Create a comparison from your dashboard or using the "Create New" tab to save it here.</p>
                       <button onClick={() => setActiveTab('new')} className="text-teal-600 font-bold hover:underline">Start a comparison</button>
                   </div>
               ) : (
                   <div className="grid md:grid-cols-2 gap-6">
                   {savedComparisons.map(saved => (
                       <div key={saved.id} onClick={() => loadSavedComparison(saved)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-400 cursor-pointer flex justify-between items-start group transition-all duration-300 relative overflow-hidden">
                           {/* Decorative background */}
                           <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform origin-top-right"></div>
                           
                           <div className="relative z-10">
                               <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full mb-3">
                                   {new Date(saved.date).toLocaleDateString()}
                               </span>
                               <h3 className="font-bold text-xl text-slate-900 mb-2 leading-tight pr-8">{saved.title}</h3>
                               <p className="text-sm text-slate-500 flex items-center">
                                   <CheckCircle className="w-4 h-4 mr-1 text-teal-500" />
                                   {saved.scanIds.length} Scans Analyzed
                               </p>
                           </div>
                           <div className="flex flex-col gap-2 relative z-10">
                                <button 
                                    onClick={(e) => deleteSaved(e, saved.id)} 
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Report"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                           </div>
                       </div>
                   ))}
                   </div>
               )}
           </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!comparison ? (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-teal-600" />
                    Select Scans to Compare ({selectedIds.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-h-[500px] overflow-y-auto pr-2">
                    {scans.length === 0 && <p className="text-slate-500">No scans available in vault.</p>}
                    {scans.map((scan) => (
                    <div 
                        key={scan.id}
                        onClick={() => toggleSelection(scan.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                        selectedIds.includes(scan.id) 
                            ? 'border-teal-500 bg-teal-50' 
                            : 'border-slate-100 hover:border-teal-300 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className="text-sm font-bold text-slate-900 block mb-1">{scan.category}</span>
                            <span className="text-xs text-slate-500 bg-white/50 px-2 py-1 rounded-full">{new Date(scan.date).toLocaleDateString()}</span>
                        </div>
                        {selectedIds.includes(scan.id) && <CheckCircle className="text-teal-600 w-6 h-6" />}
                        </div>
                    </div>
                    ))}
                </div>
                
                <button
                    onClick={handleCompare}
                    disabled={selectedIds.length < 2 || loading}
                    className="w-full md:w-auto px-8 py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            Analyzing Trends...
                        </>
                    ) : (
                        `Compare ${selectedIds.length} Scans`
                    )}
                </button>
                </div>
            ) : (
                <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => setComparison(null)}
                        className="text-slate-500 hover:text-teal-600 transition-colors font-medium flex items-center gap-2"
                    >
                        &larr; Start New Comparison
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-70 font-semibold"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save to Vault'}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Overall Analysis */}
                    <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm animate-slide-up">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <TrendingUp className="w-6 h-6 mr-3 text-slate-600" /> Analysis of Past
                    </h2>
                    <p className="text-slate-700 leading-relaxed">{comparison.overallAnalysis}</p>
                    </div>

                    {/* Predictive Analytics */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-xl text-white animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-xl font-bold text-indigo-100 mb-4 flex items-center">
                        <Sparkles className="w-6 h-6 mr-3 text-indigo-400" /> Predictive Forecast
                    </h2>
                    <div className="text-indigo-100 leading-relaxed opacity-90">
                        <p className="font-semibold mb-2 text-xs uppercase tracking-wide text-indigo-400">Proactive AI Insight</p>
                        {comparison.prediction}
                    </div>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-8 py-5 font-semibold text-slate-700">Metric</th>
                            <th className="px-8 py-5 font-semibold text-slate-700">Previous</th>
                            <th className="px-8 py-5 font-semibold text-slate-700">Current</th>
                            <th className="px-8 py-5 font-semibold text-slate-700">% Change</th>
                            <th className="px-8 py-5 font-semibold text-slate-700">Medical Reasoning</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {comparison.rows.map((row, idx) => {
                            const isSignificant = isSignificantChange(row.change);
                            return (
                            <tr key={idx} className={`hover:bg-slate-50 transition-colors ${isSignificant ? 'bg-amber-50/50' : ''}`}>
                                <td className="px-8 py-5 font-medium text-slate-900">
                                <div className="flex items-center gap-2">
                                    {row.metric}
                                    {isSignificant && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200" title="Significant Change (>10%)">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Significant
                                    </span>
                                    )}
                                </div>
                                </td>
                                <td className="px-8 py-5 text-slate-600">{row.oldValue}</td>
                                <td className="px-8 py-5 text-slate-900 font-medium">{row.newValue}</td>
                                <td className="px-8 py-5">
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(row.change)}
                                    <span className={`text-sm ${isSignificant ? 'font-bold' : ''}`}>{row.change}</span>
                                </div>
                                </td>
                                <td className="px-8 py-5 text-sm text-slate-600 italic">"{row.reasoning}"</td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>
                </div>
                </div>
            )}
        </motion.div>
      )}
    </div>
  );
};

export default CompareMode;