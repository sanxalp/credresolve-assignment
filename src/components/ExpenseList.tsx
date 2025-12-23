import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Group } from '../lib/database.types';
import { Receipt } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  split_type: string;
  created_at: string;
  paid_by_user: { name: string } | null;
}

interface ExpenseListProps {
  group: Group;
  refreshKey: number;
}

export function ExpenseList({ group, refreshKey }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [group.id, refreshKey]);

  async function loadExpenses() {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        id,
        description,
        amount,
        split_type,
        created_at,
        paid_by_user:users!expenses_paid_by_fkey(name)
      `)
      .eq('group_id', group.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading expenses:', error);
    } else {
      setExpenses((data as Expense[]) || []);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-600">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
        Recent Expenses
      </h3>
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">{expense.description}</h4>
              <p className="text-sm text-slate-600 mt-1">
                Paid by {expense.paid_by_user?.name || 'Unknown'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(expense.created_at).toLocaleDateString()} • {expense.split_type} split
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-slate-900">
                ${parseFloat(expense.amount.toString()).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
