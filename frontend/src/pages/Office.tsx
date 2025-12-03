import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { officeService } from '../lib/api/services';
import type { FinanceToday, ProfitabilityReport } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Office() {
  const [financeToday, setFinanceToday] = useState<FinanceToday | null>(null);
  const [profitability, setProfitability] = useState<ProfitabilityReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [todayData, profitabilityData] = await Promise.all([
        officeService.getFinanceToday(),
        officeService.getProfitabilityReport(),
      ]);
      setFinanceToday(todayData);
      setProfitability(profitabilityData);
    } catch (error) {
      console.error('Failed to load office data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Office & Finance</h1>
        <p className="text-gray-600 mt-1">Financial overview and product profitability</p>
      </div>

      <Card title="Today's Financial Summary">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : financeToday ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-600">Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${(financeToday.income || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                ${(financeToday.expenses || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                ${(financeToday.net || 0).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Could not load financial summary.</div>
        )}
      </Card>

      <Card title="Product Profitability">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={profitability} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${(value || 0).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#3B82F6" name="Total Revenue" />
              <Bar dataKey="totalCost" fill="#EF4444" name="Total Cost" />
              <Bar dataKey="profit" fill="#10B981" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}




