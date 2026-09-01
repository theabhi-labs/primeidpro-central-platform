import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, change, trend = 'neutral', color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-600/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20 shadow-indigo-950/40',
    emerald: 'from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-emerald-950/40',
    cyan: 'from-cyan-600/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20 shadow-cyan-950/40',
    amber: 'from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/20 shadow-amber-950/40',
    rose: 'from-rose-600/20 to-rose-500/5 text-rose-400 border-rose-500/20 shadow-rose-950/40'
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-b ${selectedColor} border backdrop-blur-xl shadow-xl transition-all duration-300 hover:translate-y-[-2px]`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {(subtitle || change) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            {change && (
              <span className={`font-semibold ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                {change}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
