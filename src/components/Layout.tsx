import React, { ReactNode } from 'react';
import { Github, Twitter } from 'lucide-react';
import ParticleBackground from './ParticleBackground';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-900 text-white relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-700 py-6 mt-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-sm text-gray-400">
              © {new Date().getFullYear()} Shiro Runner - All Rights Reserved
            </span>
          </div>
          <div className="flex items-center mb-4 md:mb-0">
          <div className="flex items-center">
            <a 
              href="https://x.com/theriteshmahale/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Twitter size={20} />
            </a>
          </div>
          <div className="flex items-center">
            <a 
              href="https://github.com/everest1508" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;