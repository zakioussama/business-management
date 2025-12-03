import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, RotateCcw, X, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { clientService, saleService } from '../lib/api/services';
import type { Client, Sale } from '../types';
import { SALE_STATUS } from '../utils/constants';

export function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [clientData, salesData] = await Promise.all([
        clientService.getById(id),
        saleService.getAll(),
      ]);
      setClient(clientData);
      setSales(salesData.filter((s) => s.clientId === id));
    } catch (error) {
      console.error('Failed to load client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (saleId: string) => {
    try {
      await saleService.renew(saleId);
      loadData();
    } catch (error) {
      console.error('Failed to renew sale:', error);
    }
  };

  const handleReactivate = async (saleId: string) => {
    try {
      await saleService.reactivate(saleId);
      loadData();
    } catch (error) {
      console.error('Failed to reactivate sale:', error);
    }
  };

  const handleEvict = async (saleId: string) => {
    if (confirm('Are you sure you want to evict this sale?')) {
      try {
        await saleService.expel(saleId);
        loadData();
      } catch (error) {
        console.error('Failed to evict sale:', error);
      }
    }
  };

  const handleDelete = async (saleId: string) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      try {
        await saleService.delete(saleId);
        loadData();
      } catch (error) {
        console.error('Failed to delete sale:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!client) {
    return <div className="text-center py-8 text-gray-500">Client not found</div>;
  }

  const statusColors: Record<string, 'primary' | 'accent' | 'status' | 'gray'> = {
    [SALE_STATUS.ACTIVE]: 'status',
    [SALE_STATUS.EXPIRED]: 'gray',
    [SALE_STATUS.CANCELLED]: 'accent',
    [SALE_STATUS.EVICTED]: 'primary',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-600 mt-1">{client.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Contact Information">
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-600">Email:</span> {client.email}
            </p>
            {client.phone && (
              <p className="text-sm">
                <span className="text-gray-600">Phone:</span> {client.phone}
              </p>
            )}
            {client.address && (
              <p className="text-sm">
                <span className="text-gray-600">Address:</span> {client.address}
              </p>
            )}
          </div>
        </Card>
        <Card title="Quick Stats">
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-gray-600">Total Sales:</span> {sales.length}
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Active Sales:</span>{' '}
              {sales.filter((s) => s.status === SALE_STATUS.ACTIVE).length}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Sales History" actions={<Button size="sm">New Sale</Button>}>
        <Table>
          <TableHeader>
            <TableHeaderCell>Product</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Start Date</TableHeaderCell>
            <TableHeaderCell>End Date</TableHeaderCell>
            <TableHeaderCell>Price</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.product?.name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[sale.status] || 'gray'}>{sale.status}</Badge>
                </TableCell>
                <TableCell>{new Date(sale.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(sale.endDate).toLocaleDateString()}</TableCell>
                <TableCell>${sale.price}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {sale.status === SALE_STATUS.EXPIRED && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRenew(sale.id)}
                        title="Renew"
                      >
                        <RefreshCw size={16} />
                      </Button>
                    )}
                    {sale.status === SALE_STATUS.CANCELLED && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReactivate(sale.id)}
                        title="Reactivate"
                      >
                        <RotateCcw size={16} />
                      </Button>
                    )}
                    {sale.status === SALE_STATUS.ACTIVE && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEvict(sale.id)}
                        title="Evict"
                      >
                        <X size={16} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sale.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

