import React from 'react';

const DashboardSidebar = ({ stats, countries, pages }) => {
  return (
    <div className="h-full w-full bg-[#0B0F19]/90 backdrop-blur-md border-r border-white/10 p-6 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tighter">GLOBE ANALYTICS</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-cyan-400 font-mono text-xs tracking-widest uppercase">LIVE TELEMETRY — ONLINE</p>
        </div>
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-3 rounded border border-white/5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Active Users</p>
          <p className="text-2xl font-mono text-white">{stats?.activeUsers || 0}</p>
        </div>
        <div className="bg-white/5 p-3 rounded border border-white/5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Pageviews</p>
          <p className="text-2xl font-mono text-white">{stats?.totalPageViews || 0}</p>
        </div>
        <div className="bg-white/5 p-3 rounded border border-white/5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Countries</p>
          <p className="text-2xl font-mono text-white">{stats?.uniqueCountries || 0}</p>
        </div>
        <div className="bg-white/5 p-3 rounded border border-white/5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cities</p>
          <p className="text-2xl font-mono text-white">{stats?.uniqueCities || 0}</p>
        </div>
      </div>

      {/* Country List */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Top Regions</h3>
        <div className="space-y-3">
          {countries?.slice(0, 5).map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-300 w-24 truncate">{c.name}</span>
              <div className="flex-1 mx-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                  style={{ width: `${Math.min((c.activeUsers / (countries[0]?.activeUsers || 1)) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-cyan-400 font-mono w-8 text-right">{c.activeUsers}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Page List */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Top Pages</h3>
        <div className="space-y-3">
          {pages?.slice(0, 5).map((p, i) => (
            <div key={i} className="flex items-center justify-between text-xs group">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-gray-500 font-mono">0{i + 1}</span>
                <span className="text-gray-300 truncate group-hover:text-white transition-colors">{p.path}</span>
              </div>
              <span className="text-gray-400 font-mono">{p.views}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
