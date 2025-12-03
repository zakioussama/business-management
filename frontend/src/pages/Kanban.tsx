import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Form/Input';
import { Select } from '../components/ui/Form/Select';
import { Textarea } from '../components/ui/Form/Textarea';

import { Board } from '../components/kanban/Board';
import { ticketService, userService } from '../lib/api/services';
import type { Ticket, User } from '../types';
import { TICKET_PRIORITY, TICKET_STATUS } from '../utils/constants';

export function Kanban() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'account_request' as const,
    priority: TICKET_PRIORITY.MEDIUM,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, usersData] = await Promise.all([
        ticketService.getAll(),
        userService.getAll(),
      ]);
      setTickets(ticketsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      await ticketService.create({
        ...formData,
      });
      setModalOpen(false);
      setFormData({ title: '', description: '', type: 'account_request', priority: TICKET_PRIORITY.MEDIUM });
      loadData();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleTicketUpdate = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      if (updates.status) {
        await ticketService.updateStatus(ticketId, updates.status);
      }
      if (updates.assignedTo) {
        await ticketService.assign(ticketId, updates.assignedTo);
      }
      loadData();
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600 mt-1">Manage support tickets</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Create Ticket
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <Board tickets={tickets} onTicketUpdate={handleTicketUpdate} />
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Ticket"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket}>Create</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
          />
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'account_request' | 'account_report' })}
            options={[
              { value: 'account_request', label: 'Account Request' },
              { value: 'account_report', label: 'Account Report' },
            ]}
            required
          />
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            options={[
              { value: TICKET_PRIORITY.LOW, label: 'Low' },
              { value: TICKET_PRIORITY.MEDIUM, label: 'Medium' },
              { value: TICKET_PRIORITY.HIGH, label: 'High' },
              { value: TICKET_PRIORITY.CRITICAL, label: 'Critical' },
            ]}
            required
          />
        </div>
      </Modal>
    </div>
  );
}

