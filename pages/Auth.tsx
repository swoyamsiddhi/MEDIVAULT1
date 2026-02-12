import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { authService } from '../services/auth';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.signIn(email, password);
      onLogin();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden flex max-w-5xl w-full border border-slate-100"
      >
        {/* Left Side - Visual */}
        <div className="hidden lg:block w-1/2 bg-slate-900 relative p-12 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 opacity-90"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
               <div className="flex items-center gap-2 mb-8">
                 <Activity className="w-8 h-8 text-teal-400" />
                 <span className="text-xl font-bold">MediVault AI</span>
               </div>
               <h2 className="text-4xl font-bold leading-tight mb-6">Medical Intelligence,<br/>Democratized.</h2>
               <p className="text-slate-300 text-lg">Securely analyze, track, and understand your medical diagnostics with military-grade privacy.</p>
            </div>

            <div className="space-y-4">
               {[
                 "HIPAA-Compliant Processing",
                 "Gemini 1.5 Flash Analysis",
                 "Encrypted Health Vault"
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="p-1 rounded-full bg-teal-500/20">
                     <CheckCircle className="w-4 h-4 text-teal-400" />
                   </div>
                   <span className="font-medium text-slate-200">{item}</span>
                 </div>
               ))}
            </div>
          </div>
          
          {/* Abstract Circle Animation */}
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
             className="absolute -right-32 -bottom-32 w-96 h-96 border border-white/10 rounded-full border-dashed"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2>
                <p className="text-slate-500">
                    {isLogin ? "Access your personal health dashboard" : "Start your journey to better health tracking"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            {isLogin ? "Sign In" : "Create Account"}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="ml-2 text-teal-600 font-bold hover:text-teal-700 hover:underline transition-all"
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center text-xs text-slate-400">
                <ShieldCheck className="w-3 h-3 mr-1" /> Secure Mock Authentication
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;