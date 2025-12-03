import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { InventoryAccount } from '../../types';
import { Badge } from '../ui/Badge';
import { INVENTORY_STATUS } from '../../utils/constants';
import { cn } from '../../utils/cn';

interface AccountRowProps {
  account: InventoryAccount;
}

const statusColors: Record<string, 'primary' | 'accent' | 'status' | 'gray'> = {
  [INVENTORY_STATUS.AVAILABLE]: 'status',
  [INVENTORY_STATUS.OCCUPIED]: 'primary',
  [INVENTORY_STATUS.UNDER_MAINTENANCE]: 'accent',
};

export function AccountRow({ account }: AccountRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="bg-white px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={20} className="text-gray-400" />
          ) : (
            <ChevronRight size={20} className="text-gray-400" />
          )}
          <span className="font-medium text-gray-900">{account.accountNumber}</span>
          <Badge variant="gray">{account.profiles.length} profiles</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {account.profiles.filter((p) => p.status === INVENTORY_STATUS.AVAILABLE).length} available
          </span>
        </div>
      </div>
      {expanded && (
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="space-y-2">
            {account.profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-lg p-3 flex items-center justify-between border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Profile {profile.profileNumber}
                  </span>
                  <Badge variant={statusColors[profile.status] || 'gray'}>
                    {profile.status}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">ID: {profile.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

