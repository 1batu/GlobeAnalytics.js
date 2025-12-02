import React from 'react';

const HudOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full h-16 flex justify-between items-start p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="text-cyan-400 font-mono text-xs tracking-[0.3em]">SYS.ONLINE</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono text-cyan-400/50">T-MINUS</span>
          <span className="text-xl font-mono text-cyan-400">00:00:00</span>
        </div>
      </div>

      {/* Crosshairs / Grid Lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-500/10 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-cyan-500/10 rounded-full"></div>

      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-cyan-500/30"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-cyan-500/30"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30"></div>

      {/* Bottom Status */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-cyan-500/50 tracking-widest">LATITUDE</span>
          <span className="text-sm font-mono text-cyan-400">34.0522° N</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-cyan-500/50 tracking-widest">LONGITUDE</span>
          <span className="text-sm font-mono text-cyan-400">118.2437° W</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-cyan-500/50 tracking-widest">ALTITUDE</span>
          <span className="text-sm font-mono text-cyan-400">450 KM</span>
        </div>
      </div>
    </div>
  );
};

export default HudOverlay;
