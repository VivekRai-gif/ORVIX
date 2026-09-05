import React from 'react';

export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-[#131926] border border-[#1E2638] p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-[#1E2638] rounded" />
        <div className="w-8 h-8 bg-[#1E2638] rounded-lg" />
      </div>
      <div className="h-7 w-32 bg-[#1E2638] rounded" />
      <div className="h-3 w-40 bg-[#1E2638] rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="rounded-xl bg-[#131926] border border-[#1E2638] p-4 space-y-3 animate-pulse">
      <div className="h-4 w-48 bg-[#1E2638] rounded mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#1E2638]">
          <div className="h-3 w-24 bg-[#1E2638] rounded" />
          <div className="h-3 w-32 bg-[#1E2638] rounded" />
          <div className="h-3 w-20 bg-[#1E2638] rounded" />
          <div className="h-5 w-16 bg-[#1E2638] rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default CardSkeleton;
