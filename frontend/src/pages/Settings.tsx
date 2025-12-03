import { useState, useEffect } from 'react';
import { Save, Send } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form/Input';
import { Toggle } from '../components/ui/Form/Toggle';
import { webhookService } from '../lib/api/services';
import { WEBHOOK_EVENTS } from '../utils/constants';
import type { WebhookConfig } from '../types';

export function Settings() {
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([]);
  const [newEndpoint, setNewEndpoint] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const configs = await webhookService.getConfigs();
    setWebhookConfigs(configs);
  };

  const handleSave = async () => {
    if (!newEndpoint) return;
    
    const config: WebhookConfig = {
      id: String(Date.now()),
      endpoint: newEndpoint,
      events: selectedEvents,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await webhookService.saveConfig(config);
    setNewEndpoint('');
    setSelectedEvents([]);
    loadConfigs();
  };

  const handleTest = async (endpoint: string) => {
    const result = await webhookService.testWebhook(endpoint, {
      event: 'sale.created',
      data: { id: '1', clientId: '1', productId: '1' },
      timestamp: new Date().toISOString(),
    });
    setTestResult(result);
    setTimeout(() => setTestResult(null), 3000);
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure webhooks and system settings</p>
      </div>

      <Card title="Webhook Configuration">
        <div className="space-y-6">
          <div>
            <Input
              label="Webhook Endpoint"
              value={newEndpoint}
              onChange={(e) => setNewEndpoint(e.target.value)}
              placeholder="https://hook.make.com/..."
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Events</p>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map((event) => (
                <Toggle
                  key={event.id}
                  label={event.label}
                  checked={selectedEvents.includes(event.id)}
                  onChange={() => toggleEvent(event.id)}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleSave} disabled={!newEndpoint || selectedEvents.length === 0}>
            <Save size={16} className="mr-2" />
            Save Webhook
          </Button>
        </div>
      </Card>

      <Card title="Active Webhooks">
        <div className="space-y-4">
          {webhookConfigs.map((config) => (
            <div key={config.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{config.endpoint}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Events: {config.events.join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleTest(config.endpoint)}
                  >
                    <Send size={16} className="mr-2" />
                    Test
                  </Button>
                </div>
              </div>
              {testResult && (
                <div
                  className={`mt-2 p-2 rounded text-sm ${
                    testResult.success
                      ? 'bg-status-50 text-status-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          ))}
          {webhookConfigs.length === 0 && (
            <p className="text-center py-8 text-gray-500">No webhooks configured</p>
          )}
        </div>
      </Card>
    </div>
  );
}

