import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column } from './Column';
import { CardItem } from './CardItem';
import type { Ticket } from '../../types';
import { TICKET_STATUS } from '../../utils/constants';

interface BoardProps {
  tickets: Ticket[];
  onTicketUpdate: (ticketId: string, updates: Partial<Ticket>) => void;
}

const columns = [
  { id: TICKET_STATUS.OPEN, title: 'Open' },
  { id: TICKET_STATUS.IN_PROGRESS, title: 'In Progress' },
  { id: TICKET_STATUS.RESOLVED, title: 'Resolved' },
  { id: TICKET_STATUS.CLOSED, title: 'Closed' },
];

export function Board({ tickets, onTicketUpdate }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as Ticket['status'];

    if (newStatus && newStatus !== active.data.current?.status) {
      onTicketUpdate(ticketId, { status: newStatus });
    }
  };

  const getTicketsByStatus = (status: string) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  const activeTicket = activeId ? tickets.find((t) => t.id === activeId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTickets = getTicketsByStatus(column.id);
          return (
            <Column key={column.id} id={column.id} title={column.title} count={columnTickets.length}>
              <SortableContext items={columnTickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {columnTickets.map((ticket) => (
                  <CardItem key={ticket.id} ticket={ticket} />
                ))}
              </SortableContext>
            </Column>
          );
        })}
      </div>
      <DragOverlay>
        {activeTicket ? <CardItem ticket={activeTicket} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

