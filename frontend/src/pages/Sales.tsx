import { useState, useEffect } from 'react';
import { Plus, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SaleWizard, type SaleFormData } from '../components/sales/SaleWizard';
import { saleService, clientService, productService } from '../lib/api/services';
import type { Sale, Client, Product } from '../types';
import { SALE_STATUS } from '../utils/constants';

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, clientsData, productsData] = await Promise.all([
        saleService.getAll(),
        clientService.getAll(),
        productService.getAll(),
      ]);
      setSales(salesData);
      setClients(clientsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = async (data: SaleFormData) => {
    try {
      await saleService.create({
        clientId: data.clientId,
        salesAttributeId: data.salesAttributeId,
        startDate: data.startDate,
      });
      setWizardOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to create sale:', error);
    }
  };

  const handleRenew = async (id: string) => {
    try {
      await saleService.renew(id);
      loadData();
    } catch (error) {
      console.error('Failed to renew sale:', error);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await saleService.reactivate(id);
      loadData();
    } catch (error) {
      console.error('Failed to reactivate sale:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sale? This will free up the inventory.')) {
      try {
        await saleService.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete sale:', error);
      }
    }
  };

  const statusColors: Record<string, 'primary' | 'accent' | 'status' | 'gray'> = {
    [SALE_STATUS.ACTIVE]: 'status',
    [SALE_STATUS.EXPIRED]: 'gray',
    [SALE_STATUS.CANCELLED]: 'accent',
    [SALE_STATUS.EVICTED]: 'primary',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Manage your sales</p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <Plus size={20} className="mr-2" />
          Create Sale
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>Client</TableHeaderCell>
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
                  <TableCell>{sale.client?.name || '-'}</TableCell>
                  <TableCell>{sale.product?.name || sale.salesAttribute?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[sale.status] || 'gray'}>{sale.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(sale.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(sale.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>${sale.price}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {sale.status === SALE_STATUS.EXPIRED && (
                        <Button variant="ghost" size="sm" onClick={() => handleRenew(sale.id)} title="Renew">
                          <RefreshCw size={16} />
                        </Button>
                      )}
                      {sale.status === SALE_STATUS.CANCELLED && (
                        <Button variant="ghost" size="sm" onClick={() => handleReactivate(sale.id)} title="Reactivate">
                          <RotateCcw size={16} />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(sale.id)} title="Delete">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <SaleWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSubmit={handleCreateSale}
        clients={clients}
        products={products}
      />
    </div>
  );
}

