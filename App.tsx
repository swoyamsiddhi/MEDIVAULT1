import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ScanDashboard from './pages/ScanDashboard';
import UploadScan from './pages/UploadScan';
import AnalysisView from './pages/AnalysisView';
import CompareMode from './pages/CompareMode';
import About from './pages/About';
import Auth from './pages/Auth';
import { User } from './types';
import { authService } from './services/auth';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  // Simple hash-based router state
  const [currentPage, setCurrentPage] = useState('home');
  const [currentParams, setCurrentParams] = useState<any>({});
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const storedUser = authService.getUser();
      setUser(storedUser);
      setLoadingAuth(false);
    };
    initAuth();
  }, []);

  // Handle browser back button & Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      // Simple parse for demo (e.g. #analysis/123)
      const parts = hash.split('/');
      const page = parts[0];
      
      setCurrentPage(page);
      
      if (page === 'upload' && parts[1]) {
        setCurrentParams({ type: decodeURIComponent(parts[1]) });
      } else if (page === 'analysis' && parts[1]) {
        setCurrentParams({ id: parts[1] });
      } else if (page === 'compare' && parts[1]) {
        // Handle comma-separated IDs: #compare/id1,id2
        const ids = parts[1].split(',').filter(Boolean);
        setCurrentParams({ ids });
      } else {
        setCurrentParams({});
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string, params?: any) => {
    let hash = page;
    if (page === 'upload' && params?.type) {
        hash += `/${params.type}`;
    } else if (page === 'analysis' && params?.id) {
        hash += `/${params.id}`;
    } else if (page === 'compare' && params?.ids) {
        // params.ids should be an array of strings
        hash += `/${params.ids.join(',')}`;
    }
    window.location.hash = hash;
    setCurrentParams(params || {});
  };

  const handleLogout = () => {
    authService.signOut();
    setUser(null);
    navigate('home');
  };

  const handleLoginSuccess = () => {
    const loggedInUser = authService.getUser();
    setUser(loggedInUser);
    navigate('home'); // Redirect to home page after login
  };

  const protectedRoutes = ['scans', 'upload', 'analysis', 'compare'];
  const isProtectedRedirect = protectedRoutes.includes(currentPage) && !user;
  const showNavbar = currentPage !== 'auth' && !isProtectedRedirect;

  const renderPage = () => {
    // Auth Check for Protected Routes
    if (isProtectedRedirect) {
        // Automatically redirect to auth if trying to access protected route without user
        if (!loadingAuth) {
             return <Auth onLogin={handleLoginSuccess} />;
        }
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    switch (currentPage) {
      case 'home':
        return <Home navigate={navigate} />;
      case 'auth':
        return <Auth onLogin={handleLoginSuccess} />;
      case 'scans':
        return <ScanDashboard navigate={navigate} />;
      case 'upload':
        return <UploadScan category={currentParams.type} navigate={navigate} />;
      case 'analysis':
        return <AnalysisView scanId={currentParams.id} navigate={navigate} />;
      case 'compare':
        return <CompareMode preSelectedIds={currentParams.ids} navigate={navigate} />;
      case 'about':
        return <About />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  if (loadingAuth) return null; // Or a splash screen

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {showNavbar && (
        <Navbar currentPage={currentPage} navigate={navigate} user={user} onLogout={handleLogout} />
      )}
      <main className="flex-grow relative">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom ease curve
                className="w-full h-full"
            >
                {renderPage()}
            </motion.div>
        </AnimatePresence>
      </main>
      {showNavbar && <Footer />}
    </div>
  );
};

export default App;