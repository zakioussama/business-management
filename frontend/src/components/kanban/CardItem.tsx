import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Ticket } from '../../types';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { TICKET_PRIORITY } from '../../utils/constants';

interface CardItemProps {
  ticket: Ticket;
  isDragging?: boolean;
}

const priorityColors: Record<string, 'primary' | 'accent' | 'status' | 'gray'> = {
  [TICKET_PRIORITY.LOW]: 'gray',
  [TICKET_PRIORITY.MEDIUM]: 'primary',
  [TICKET_PRIORITY.HIGH]: 'accent',
  [TICKET_PRIORITY.CRITICAL]: 'status',
};

export function CardItem({ ticket, isDragging }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: ticket.id,
    data: {
      status: ticket.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow',
        isDragging && 'shadow-lg'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{ticket.title}</h4>
        <Badge variant={priorityColors[ticket.priority] || 'gray'}>
          {ticket.priority}
        </Badge>
      </div>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>#{ticket.id}</span>
        {ticket.assignedToUser && (
          <span className="text-primary-600">{ticket.assignedToUser.name}</span>
        )}
      </div>
    </div>
  );
}

