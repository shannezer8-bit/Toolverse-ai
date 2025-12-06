import React, { useState } from 'react';
import { ToolLayout } from '../ToolLayout';
import { DollarSign, PieChart as ChartIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { planBudget, BudgetResult } from '../../services/gemini';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const BudgetPlanner: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BudgetResult | null>(null);

  const handlePlan = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await planBudget(input);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Budget Planner"
      description="Enter your income and expenses to get a detailed budget plan and visualization."
      icon={<DollarSign size={24} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Financial Overview</label>
            <textarea
              className="w-full h-64 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              placeholder={`Describe your finances. Example:
Monthly Income: $4000
Rent: $1200
Groceries: $400
Utilities: $150
Car Payment: $300
I want to save for a vacation.`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              onClick={handlePlan}
              disabled={!input.trim() || loading}
              className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><ChartIcon size={18} /> Plan Budget</>}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          {result ? (
            <div className="flex flex-col h-full">
              <div className="h-64 w-full mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {result.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="prose prose-sm prose-emerald max-w-none flex-1 overflow-y-auto">
                <ReactMarkdown>{result.analysis}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <DollarSign size={64} className="mb-4 opacity-50" />
              <p>Your budget plan will appear here...</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};