import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SemaforoBadgeProps {
  nivel: 'V' | 'A' | 'R' | string | null | undefined;
  className?: string;
}

const statusConfig = {
    V: { text: "Verde", className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" },
    A: { text: "Amarillo", className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100" },
    R: { text: "Rojo", className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100" },
};


export function SemaforoBadge({ nivel, className }: SemaforoBadgeProps) {
  if (!nivel) {
    return <Badge variant="outline" className={cn("font-normal bg-gray-100 text-gray-800 border-gray-200", className)}>N/A</Badge>;
  }
  const config = statusConfig[nivel as keyof typeof statusConfig] || { text: nivel, className: "bg-gray-100 text-gray-800 border-gray-200" };

  return (
    <Badge variant="outline" className={cn("font-normal", config.className, className)}>
      <span className={cn("mr-2 h-2 w-2 rounded-full", config.className.replace('text-', 'bg-').replace('100', '500'))}></span>
      {config.text}
    </Badge>
  );
}
