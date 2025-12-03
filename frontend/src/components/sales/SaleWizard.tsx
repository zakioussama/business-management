import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Form/Input';
import { Select } from '../ui/Form/Select';
import type { Client, Product, SalesAttribute } from '../../types';

interface SaleWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SaleFormData) => void;
  clients: Client[];
  products: Product[];
}

export interface SaleFormData {
  clientId: string;
  productId: string;
  salesAttributeId: string;
  startDate: string;
}

export function SaleWizard({
  isOpen,
  onClose,
  onSubmit,
  clients,
  products,
}: SaleWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SaleFormData>({
    clientId: '',
    productId: '',
    salesAttributeId: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [availableAttributes, setAvailableAttributes] = useState<SalesAttribute[]>([]);

  useEffect(() => {
    if (formData.productId) {
      const selectedProduct = products.find((p) => p.id === formData.productId);
      setAvailableAttributes(selectedProduct?.salesAttributes || []);
    } else {
      setAvailableAttributes([]);
    }
  }, [formData.productId, products]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      clientId: clients[0]?.id || '',
      productId: '',
      salesAttributeId: '',
      startDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.clientId;
      case 2:
        return !!formData.productId;
      case 3:
        return !!formData.salesAttributeId && !!formData.startDate;
      default:
        return false;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Create Sale - Step ${step} of 3`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed()}>
                Create Sale
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Client</h3>
            <Select
              label="Client"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              required
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Product</h3>
            <Select
              label="Product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value, salesAttributeId: '' })}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
              required
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Plan & Date</h3>
            <div className="space-y-4">
              <Select
                label="Sales Plan"
                value={formData.salesAttributeId}
                onChange={(e) => setFormData({ ...formData, salesAttributeId: e.target.value })}
                options={availableAttributes.map((sa) => ({
                  value: sa.id,
                  label: `${sa.name} - $${sa.price} for ${sa.duration} days`,
                }))}
                required
              />
              {availableAttributes.length === 0 && formData.productId && (
                <p className="mt-2 text-sm text-red-600">No available plans for the selected product.</p>
              )}
               <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

