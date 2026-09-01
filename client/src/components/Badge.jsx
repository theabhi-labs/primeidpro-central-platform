import React from 'react';

const Badge = ({ status, children, size = 'md', className = '' }) => {
  const statusStr = (status || children || '').toString().toUpperCase();

  const getStyle = () => {
    switch (statusStr) {
      case 'COMPLETED':
      case 'PAID':
      case 'ACTIVE':
      case 'ONLINE':
      case 'SUCCESS':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'PRINTING':
      case 'DOWNLOADING':
      case 'PROCESSING':
      case 'READY':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 animate-pulse-slow';
      case 'DISPATCHED':
      case 'CREATED':
      case 'PENDING':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'FAILED':
      case 'REVOKED':
      case 'BLOCKED':
      case 'CANCELLED':
      case 'OFFLINE':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide uppercase ${getStyle()} ${
        sizeClasses[size]
      } ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {children || status}
    </span>
  );
};

export default Badge;
