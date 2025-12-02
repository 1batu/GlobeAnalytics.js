import React from 'react';

const TelemetryPanel = ({ visitors, countryData }) => {
  const totalUsers = visitors.reduce((acc, curr) => acc + curr.activeUsers, 0);

  return (
    <div className="absolute top-20 right-8 w-80 z-30 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 p-4 clip-path-polygon">
        <h2 className="text-cyan-400 font-mono text-sm tracking-[0.2em] border-b border-cyan-500/30 pb-2 mb-4">
          MISSION TELEMETRY
        </h2>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-cyan-900/10 p-2 border-l-2 border-cyan-500">
            <div className="text-[10px] text-cyan-400/60 uppercase">Active Users</div>
            <div className="text-2xl font-mono text-white">{totalUsers}</div>
          </div>
          <div className="bg-cyan-900/10 p-2 border-l-2 border-purple-500">
            <div className="text-[10px] text-purple-400/60 uppercase">Nodes</div>
            <div className="text-2xl font-mono text-white">{visitors.length}</div>
          </div>
        </div>

        {/* Top Regions List */}
        <div className="space-y-2">
          <div className="text-[10px] text-cyan-400/60 uppercase mb-2">Signal Strength / Region</div>
          {countryData.slice(0, 6).map((c, i) => (
            <div key={c.country} className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-100/80">{c.country.substring(0, 12)}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1 bg-cyan-900/30">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${Math.min((c.activeUsers / (countryData[0]?.activeUsers || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-cyan-400 w-6 text-right">{c.activeUsers}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative Graph Area */}
        <div className="mt-6 border-t border-cyan-500/30 pt-4">
          <div className="text-[10px] text-cyan-400/60 uppercase mb-2">Network Load</div>
          <div className="h-16 flex items-end gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-cyan-500/20 animate-pulse"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryPanel;
