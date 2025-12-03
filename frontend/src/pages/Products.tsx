import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Form/Input';
import { Select } from '../components/ui/Form/Select';
import { Toggle } from '../components/ui/Form/Toggle';
import { productService } from '../lib/api/services';
import type { Product } from '../types';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    type: '',
    ownership: 'RENTED',
    cost: 0,
    renewable: false,
    warranty: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getAll();
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await productService.create(formData);
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your products and their sales attributes</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Ownership</TableHeaderCell>
              <TableHeaderCell>Warranty</TableHeaderCell>
              <TableHeaderCell>Cost</TableHeaderCell>
              <TableHeaderCell>Sales Attributes</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.type || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={product.ownership === 'OWNED' ? 'primary' : 'gray'}>
                      {product.ownership}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.warranty ? 'status' : 'gray'}>
                      {product.warranty ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>${product.cost}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      {product.salesAttributes?.map(sa => (
                        <Badge key={sa.id} variant="accent">
                          {sa.name}: ${sa.price} / {sa.duration} days
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Product"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Product</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
          <Select
            label="Ownership"
            value={formData.ownership}
            onChange={(e) => setFormData({ ...formData, ownership: e.target.value as 'RENTED' | 'OWNED' })}
            options={[{ value: 'RENTED', label: 'Rented' }, { value: 'OWNED', label: 'Owned' }]}
            required
          />
          <Input
            label="Cost"
            type="number"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
            required
          />
          <Toggle
            label="Renewable"
            checked={formData.renewable}
            onChange={(e) => setFormData({ ...formData, renewable: e.target.checked })}
          />
          <Toggle
            label="Warranty"
            checked={formData.warranty}
            onChange={(e) => setFormData({ ...formData, warranty: e.target.checked })}
          />
        </div>
      </Modal>
    </div>
  );
}
