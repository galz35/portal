import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  isNegative?: boolean;
  children?: React.ReactNode;
}

export function KpiCard({ title, value, icon: Icon, description, children, trend, isNegative }: KpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden border-none shadow-sm shadow-slate-200/50 bg-white group transition-all hover:shadow-xl hover:shadow-slate-200/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center transition-colors group-hover:bg-[#DA291C]">
               <Icon className="h-7 w-7 text-[#DA291C] group-hover:text-white transition-colors" />
            </div>
            
            <div className="flex-1 min-w-0">
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
               <div className="flex items-baseline gap-2">
                 <h3 className="text-2xl font-black text-slate-900 leading-none">{value || '...'}</h3>
                 {trend && (
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", isNegative ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>
                        {trend}
                    </span>
                 )}
               </div>
               {description && <p className="text-[12px] text-slate-500 font-medium mt-1 truncate">{description}</p>}
            </div>
          </div>
          {children && <div className="mt-4 pt-4 border-t border-slate-50">{children}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
