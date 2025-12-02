import React from 'react';

const DashboardSidebar = ({ stats, countries, pages }) => {
  return (
    <div className="h-full w-full p-6 flex flex-col overflow-y-auto text-white">
      <style>{`
        .stat-text { text-shadow: 0 2px 8px rgba(0,0,0,0.8); }
      `}</style>

      {/* General Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard label="Active Users" value={stats?.activeUsers} delay={0} />
        <StatCard label="Pageviews" value={stats?.totalPageViews} delay={100} />
        <StatCard label="Countries" value={stats?.uniqueCountries} delay={200} />
        <StatCard label="Cities" value={stats?.uniqueCities} delay={300} />
      </div>

      {/* Country List */}
      <div className="mb-8 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2 stat-text">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
          Top Regions
        </h3>
        <div className="space-y-3">
          {countries?.slice(0, 5).map((c, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-200 font-medium group-hover:text-white transition-colors">{c.name}</span>
                <span className="text-cyan-400 font-mono">{c.activeUsers}</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full group-hover:from-cyan-400 group-hover:to-white transition-all duration-500"
                  style={{ width: `${Math.min((c.activeUsers / (countries[0]?.activeUsers || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page List */}
      <div className="flex-1 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2 stat-text">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          Top Pages
        </h3>
        <div className="space-y-2">
          {pages?.slice(0, 6).map((p, i) => (
            <div key={i} className="flex items-center justify-between text-xs group p-2.5 hover:bg-white/5 rounded-lg transition-colors cursor-default border border-transparent hover:border-white/10">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-gray-500 font-mono text-[10px]">0{i + 1}</span>
                <span className="text-gray-300 truncate group-hover:text-white transition-colors font-medium">{p.path}</span>
              </div>
              <span className="text-gray-500 font-mono text-[10px] group-hover:text-cyan-400">{p.views}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 text-[10px] text-gray-500 font-mono flex justify-between">
        <span>V 2.0.5</span>
        <span>SECURE CONNECTION</span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, delay }) => (
  <div
    className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all hover:bg-black/60 group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <p className="text-[10px] text-gray-300 uppercase tracking-wider mb-1 group-hover:text-cyan-400 transition-colors stat-text">{label}</p>
    <p className="text-2xl font-mono text-white font-bold stat-text">{value || 0}</p>
  </div>
);

export default DashboardSidebar;
