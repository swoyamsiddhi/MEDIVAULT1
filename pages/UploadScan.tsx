import React, { useState, useEffect } from 'react';
import { Upload, Loader2, AlertCircle, History, Calendar, Activity, ChevronRight, FileText, CheckSquare, Square } from 'lucide-react';
import { ScanCategory, Scan } from '../types';
import { geminiService } from '../services/gemini';
import { mockDb } from '../services/mockDb';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadScanProps {
  category: ScanCategory;
  navigate: (page: string, params?: any) => void;
}

const UploadScan: React.FC<UploadScanProps> = ({ category, navigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // History State
  const [history, setHistory] = useState<Scan[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Load category-specific history
  useEffect(() => {
    const fetchHistory = async () => {
        setLoadingHistory(true);
        const allScans = await mockDb.getScans();
        const filtered = allScans
            .filter(s => s.category === category)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(filtered);
        setLoadingHistory(false);
    };
    fetchHistory();
  }, [category]);

  const toggleSelection = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
  };

  const handleCompare = () => {
      navigate('compare', { ids: selectedIds });
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile.type.startsWith('image/')) {
            processFile(droppedFile);
        } else {
            setError("Please upload an image file (JPG, PNG).");
        }
    }
  };

  const handleUpload = async () => {
    if (!preview || !file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisResult = await geminiService.analyzeScan(preview, category);

      const newScan = {
        id: mockDb.generateId(),
        category,
        date: new Date().toISOString(),
        imageUrl: preview,
        analysis: analysisResult
      };

      await mockDb.saveScan(newScan);
      navigate('analysis', { id: newScan.id });

    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze image. Please ensure API key is set and image is clear.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-24 min-h-screen relative">
      <div className="flex items-center justify-between mb-8">
        <motion.button 
            whileHover={{ x: -5 }}
            onClick={() => navigate('scans')} 
            className="text-slate-500 hover:text-slate-800 transition-colors flex items-center font-medium"
        >
            &larr; Back to Dashboard
        </motion.button>
        <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium border border-teal-100 shadow-sm">
            {category} Section
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-20">
        {/* LEFT COLUMN: Upload Interface */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <h1 className="text-3xl font-bold text-slate-900">Upload New Scan</h1>
            <p className="text-slate-600 mb-6">Analyze a new {category} report to detect anomalies.</p>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-8">
                {!preview ? (
                    <motion.div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        animate={isDragging ? { 
                            scale: 1.02, 
                            borderColor: '#0d9488', 
                            backgroundColor: '#f0fdfa',
                            boxShadow: "0px 10px 20px rgba(13, 148, 136, 0.1)"
                        } : { 
                            scale: 1, 
                            borderColor: '#cbd5e1', 
                            backgroundColor: '#f8fafc',
                            boxShadow: "none"
                        }}
                        transition={{ duration: 0.2 }}
                        className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer"
                    >
                    <motion.div
                        animate={isDragging ? { y: -10 } : { y: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                         <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-teal-600' : 'text-slate-400'}`} />
                    </motion.div>
                    
                    <p className={`text-lg font-medium mb-2 ${isDragging ? 'text-teal-800' : 'text-slate-700'}`}>
                        {isDragging ? 'Drop it here!' : 'Drag & Drop or Click'}
                    </p>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden" 
                        id="file-upload"
                    />
                    <motion.label 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        htmlFor="file-upload" 
                        className="mt-4 inline-block px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg cursor-pointer hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
                    >
                        Browse Files
                    </motion.label>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full aspect-video mb-6 bg-slate-900 rounded-2xl overflow-hidden shadow-lg group"
                    >
                        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => setPreview(null)} className="text-white underline font-medium">Change Image</button>
                        </div>
                    </motion.div>
                    
                    {error && (
                        <div className="flex items-center text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4 w-full border border-red-100">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="flex gap-4 w-full">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPreview(null)}
                            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                            disabled={isAnalyzing}
                        >
                        Cancel
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(13, 148, 136, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleUpload}
                            disabled={isAnalyzing}
                            className="flex-1 flex items-center justify-center px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-70 transition-all font-semibold"
                        >
                        {isAnalyzing ? (
                            <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing...
                            </>
                        ) : (
                            'Run Analysis'
                        )}
                        </motion.button>
                    </div>
                    </div>
                )}
                </div>
            </div>
        </motion.div>

        {/* RIGHT COLUMN: History List */}
        <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="relative"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-teal-600" />
                    <h2 className="text-2xl font-bold text-slate-900">{category} History</h2>
                </div>
                {selectedIds.length > 0 && (
                     <button onClick={() => setSelectedIds([])} className="text-xs text-red-500 hover:underline">Clear</button>
                )}
            </div>

            <div className="relative">
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 -z-10"></div>

                {loadingHistory ? (
                    <div className="text-center py-12 text-slate-400">Loading vault...</div>
                ) : history.length === 0 ? (
                    <div className="bg-slate-50/50 border border-dashed border-slate-300 rounded-3xl p-12 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <h3 className="text-lg font-medium text-slate-700">No scans found</h3>
                        <p className="text-slate-500 text-sm">Upload your first {category} scan to start tracking.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-4 scrollbar-hide">
                        <AnimatePresence>
                        {history.map((scan, idx) => {
                             const isSelected = selectedIds.includes(scan.id);
                             return (
                                <motion.div
                                    key={scan.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02, x: 5, backgroundColor: "#ffffff" }}
                                    className={`group relative bg-white p-5 rounded-2xl shadow-sm border transition-all cursor-pointer flex gap-4 items-center ${
                                        isSelected ? 'border-teal-500 bg-teal-50/10' : 'border-slate-100 hover:border-teal-200 hover:shadow-md'
                                    }`}
                                    onClick={() => navigate('analysis', { id: scan.id })}
                                >
                                    <div 
                                        className="p-1 z-10"
                                        onClick={(e) => toggleSelection(e, scan.id)}
                                    >
                                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                            {isSelected ? <CheckSquare className="text-teal-600 w-5 h-5"/> : <Square className="text-slate-300 hover:text-slate-400 w-5 h-5"/>}
                                        </motion.div>
                                    </div>

                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                                        <img src={scan.imageUrl} alt="Thumb" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs text-slate-400 font-medium flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(scan.date).toLocaleDateString()}
                                            </p>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                (scan.analysis?.urgencyScore || 0) > 7 ? 'bg-red-100 text-red-700' :
                                                (scan.analysis?.urgencyScore || 0) > 3 ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                Score: {scan.analysis?.urgencyScore}/10
                                            </span>
                                        </div>
                                        <h4 className="text-slate-800 font-semibold text-sm truncate pr-4">
                                            {scan.analysis?.summary || 'Processing...'}
                                        </h4>
                                    </div>

                                    <motion.div whileHover={{ x: 3 }}>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
                                    </motion.div>
                                </motion.div>
                             );
                        })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
      </div>

       {/* Floating Compare Button */}
       <AnimatePresence>
        {selectedIds.length >= 2 && (
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none"
            >
                <div className="pointer-events-auto bg-slate-900 text-white rounded-full shadow-2xl p-2 pl-6 pr-2 flex items-center gap-4 border border-slate-700">
                    <span className="font-semibold">
                        {selectedIds.length} Scans Selected
                    </span>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCompare}
                        className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-2.5 rounded-full font-bold transition-colors shadow-lg"
                    >
                        Compare Reports &rarr;
                    </motion.button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadScan;