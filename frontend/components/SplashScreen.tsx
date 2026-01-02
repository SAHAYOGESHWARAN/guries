
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SYSTEM_CHECKS = [
  "Core Systems",
  "Neural Engine",
  "Security Protocols",
  "Data Streams",
  "UI Rendering"
];

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [activeCheck, setActiveCheck] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Progress Animation
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsExiting(true);
          setTimeout(onComplete, 1000);
          return 100;
        }
        // Non-linear progress for realism
        const increment = Math.random() > 0.7 ? 5 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 50);

    // Text Cycle
    const checkTimer = setInterval(() => {
      setActiveCheck(prev => (prev + 1) % SYSTEM_CHECKS.length);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(checkTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-105 filter blur-sm' : 'opacity-100'}`}>
      
      {/* Background Aurora */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Animated Logo Container */}
        <div className="mb-12 relative group">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            
            {/* Logo Box */}
            <div className="relative w-24 h-24 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-cyan-300 tracking-tighter">
                    G
                </span>
                
                {/* Scanning Light Effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 animate-shine" />
            </div>
        </div>

        {/* Typography */}
        <div className="text-center space-y-2 mb-16">
            <h1 className="text-3xl font-bold text-white tracking-tight">
                Guires <span className="font-light text-slate-400">Marketing OS</span>
            </h1>
            <div className="h-6 overflow-hidden relative">
                <div className="transition-transform duration-500" style={{ transform: `translateY(-${activeCheck * 24}px)` }}>
                    {SYSTEM_CHECKS.map((check, i) => (
                        <p key={i} className="text-xs font-medium text-indigo-400 uppercase tracking-[0.2em] h-6 flex items-center justify-center">
                            Initializing {check}...
                        </p>
                    ))}
                </div>
            </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-64 h-[2px] bg-slate-800 rounded-full overflow-hidden relative">
            <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 transition-all duration-200 ease-out"
                style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)' }}
            ></div>
        </div>
        
        <p className="mt-4 text-[10px] text-slate-600 font-mono">
            v2.5.0 // ENTERPRISE BUILD
        </p>

      </div>
    </div>
  );
};

export default SplashScreen;
