import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Form/Input';
import { Select } from '../components/ui/Form/Select';
import { AccountRow } from '../components/inventory/AccountRow';
import { inventoryService, productService } from '../lib/api/services';
import type { InventoryAccount, Product } from '../types';

export function Inventory() {
  const [accounts, setAccounts] = useState<InventoryAccount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, productsData] = await Promise.all([
        inventoryService.getAccounts(),
        productService.getAll(),
      ]);
      setAccounts(accountsData);
      setProducts(productsData);
      if (productsData.length > 0) {
        setFormData((prev) => ({ ...prev, productId: productsData[0].id }));
      }
    } catch (error) {
      console.error('Failed to load inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await inventoryService.createAccount({
        ...formData,
        productId: parseInt(formData.productId),
        status: 'available',
      });
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage inventory accounts and profiles</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Add Account
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
            {accounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">No inventory accounts</div>
            )}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Inventory Account"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Account</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Product"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            options={products.map((p) => ({ value: p.id, label: p.name }))}
            required
          />
          <Input
            label="Account Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Account Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
      </Modal>
    </div>
  );
}

