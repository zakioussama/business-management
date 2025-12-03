import { type ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../utils/cn';

interface ColumnProps {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
}

export function Column({ id, title, count, children }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4 transition-colors',
        isOver && 'bg-primary-50'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
          {count}
        </span>
      </div>
      <div className="space-y-2 min-h-[200px]">{children}</div>
    </div>
  );
}

