import React from 'react';
import { Mail, Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-6 mb-8">
          <a href="#" className="hover:text-teal-400 transition-colors"><Github className="w-6 h-6" /></a>
          <a href="#" className="hover:text-teal-400 transition-colors"><Mail className="w-6 h-6" /></a>
        </div>
        <p className="text-slate-400 mb-2">Built with <Heart className="w-4 h-4 inline text-red-500 mx-1" /> by Pixel Forge</p>
        <p className="text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} MediVault. Not a replacement for professional medical advice.
        </p>
      </div>
    </footer>
  );
};

export default Footer;