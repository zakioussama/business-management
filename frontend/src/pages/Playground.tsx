import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Form/Input';
import { Select } from '../components/ui/Form/Select';
import { Toggle } from '../components/ui/Form/Toggle';
import { Modal } from '../components/ui/Modal';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../components/ui/Table';
import type { Role } from '../types';

export function Playground() {
  const { user, switchRole } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('admin');

  const handleRoleSwitch = () => {
    switchRole(selectedRole);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Playground</h1>
        <p className="text-gray-600 mt-1">Component showcase and role switcher</p>
      </div>

      <Card title="Role Switcher">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Current role: <Badge>{user?.role}</Badge></p>
          <Button onClick={() => setModalOpen(true)}>Switch Role</Button>
        </div>
      </Card>

      <Card title="UI Components">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Buttons</p>
            <div className="flex gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Badges</p>
            <div className="flex gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="status">Status</Badge>
              <Badge variant="gray">Gray</Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Form Components</p>
            <div className="space-y-4 max-w-md">
              <Input label="Text Input" placeholder="Enter text" />
              <Select
                label="Select"
                options={[
                  { value: '1', label: 'Option 1' },
                  { value: '2', label: 'Option 2' },
                ]}
              />
              <Toggle label="Toggle Switch" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Table</p>
            <Table>
              <TableHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell><Badge variant="status">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell><Badge variant="status">Active</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Switch Role"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleSwitch}>Switch</Button>
          </div>
        }
      >
        <Select
          label="Select Role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as Role)}
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'supervisor', label: 'Supervisor' },
            { value: 'agent', label: 'Agent' },
            { value: 'client', label: 'Client' },
          ]}
        />
      </Modal>
    </div>
  );
}

