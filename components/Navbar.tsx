import React, { useState, useEffect } from 'react';
import { Activity, LayoutDashboard, Bookmark, Info, Menu, X, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';

interface NavbarProps {
  currentPage: string;
  navigate: (page: string) => void;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, navigate, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for glassmorphism intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'scans', label: 'Scans', icon: LayoutDashboard },
    { id: 'compare', label: 'Saved', icon: Bookmark },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <>
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('home')}>
            <div className="relative">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-tr from-teal-500 to-emerald-400 p-2 rounded-xl shadow-lg shadow-teal-500/20"
                >
                  <Activity className="h-5 w-5 text-white" />
                </motion.div>
            </div>
            <span className="ml-3 text-lg font-bold text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
              MediVault<span className="text-teal-500"></span>
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  currentPage === item.id 
                    ? 'text-teal-700' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {currentPage === item.id && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-100/50"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${currentPage === item.id ? 'text-teal-500' : 'opacity-70'}`} />
                    {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* User / Action Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                     <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-800 leading-none">{user.name}</span>
                        <span className="text-sm text-teal-600 font-medium">Verified Patient</span>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white">
                        {user.name.charAt(0)}
                     </div>
                     <button 
                        onClick={onLogout}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                        title="Sign Out"
                     >
                        <LogOut className="w-4 h-4" />
                     </button>
                </div>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('auth')}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all"
                >
                    <LogIn className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    Sign In
                </motion.button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white fixed inset-0 top-16 z-40 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="grid gap-2">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        navigate(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-4 rounded-2xl text-lg font-medium flex items-center gap-4 transition-all ${
                        currentPage === item.id 
                          ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                          : 'bg-slate-50 text-slate-600 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${currentPage === item.id ? 'bg-teal-200/50' : 'bg-white'}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      {item.label}
                    </motion.button>
                  ))}
              </div>
              
              <div className="border-t border-slate-100 pt-6">
                 {user ? (
                     <div className="bg-slate-50 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold shadow-lg">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <span className="block text-lg font-bold text-slate-900">{user.name}</span>
                                <span className="text-sm text-slate-500">{user.email}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => { onLogout(); setIsOpen(false); }}
                            className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                     </div>
                 ) : (
                    <button 
                        onClick={() => { navigate('auth'); setIsOpen(false); }}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2"
                    >
                         <LogIn className="w-5 h-5" /> Sign In to Vault
                    </button>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
};

export default Navbar;