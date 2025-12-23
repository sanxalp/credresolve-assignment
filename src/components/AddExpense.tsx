import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Group, SplitType } from '../lib/database.types';
import { X } from 'lucide-react';

interface AddExpenseProps {
  group: Group;
  currentUser: User;
  members: User[];
  onExpenseAdded: () => void;
  onCancel: () => void;
}

interface SplitData {
  userId: string;
  amount: string;
  percentage: string;
}

export function AddExpense({ group, currentUser, members, onExpenseAdded, onCancel }: AddExpenseProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [splits, setSplits] = useState<Record<string, SplitData>>(
    members.reduce((acc, member) => ({
      ...acc,
      [member.id]: { userId: member.id, amount: '', percentage: '' }
    }), {})
  );
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(members.map(m => m.id))
  );

  function toggleMember(userId: string) {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  }

  function updateSplit(userId: string, field: 'amount' | 'percentage', value: string) {
    setSplits({
      ...splits,
      [userId]: { ...splits[userId], [field]: value }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const selectedMemberIds = Array.from(selectedMembers);
    if (selectedMemberIds.length === 0) {
      alert('Please select at least one member');
      return;
    }

    let expenseSplits: { user_id: string; amount: number; percentage: number }[] = [];

    if (splitType === 'equal') {
      const splitAmount = totalAmount / selectedMemberIds.length;
      expenseSplits = selectedMemberIds.map(userId => ({
        user_id: userId,
        amount: splitAmount,
        percentage: 0
      }));
    } else if (splitType === 'exact') {
      expenseSplits = selectedMemberIds.map(userId => {
        const splitAmount = parseFloat(splits[userId]?.amount || '0');
        return {
          user_id: userId,
          amount: splitAmount,
          percentage: 0
        };
      });

      const totalSplit = expenseSplits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(totalSplit - totalAmount) > 0.01) {
        alert(`Split amounts must add up to ${totalAmount}. Current total: ${totalSplit.toFixed(2)}`);
        return;
      }
    } else if (splitType === 'percentage') {
      expenseSplits = selectedMemberIds.map(userId => {
        const percentage = parseFloat(splits[userId]?.percentage || '0');
        return {
          user_id: userId,
          amount: (totalAmount * percentage) / 100,
          percentage: percentage
        };
      });

      const totalPercentage = expenseSplits.reduce((sum, s) => sum + s.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        alert(`Percentages must add up to 100%. Current total: ${totalPercentage.toFixed(2)}%`);
        return;
      }
    }

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: group.id,
        paid_by: paidBy,
        amount: totalAmount,
        description,
        split_type: splitType
      })
      .select()
      .single();

    if (expenseError) {
      console.error('Error creating expense:', expenseError);
      alert('Error creating expense');
      return;
    }

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(
        expenseSplits.map(split => ({
          expense_id: expense.id,
          user_id: split.user_id,
          amount: split.amount,
          percentage: split.percentage
        }))
      );

    if (splitsError) {
      console.error('Error creating splits:', splitsError);
      alert('Error creating expense splits');
      return;
    }

    onExpenseAdded();
  }

  return (
    <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Add Expense</h3>
        <button onClick={onCancel} className="text-slate-600 hover:text-slate-900">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="What was this expense for?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Paid by
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Split type
          </label>
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value as SplitType)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="equal">Equal Split</option>
            <option value="exact">Exact Amount</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Split between
          </label>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedMembers.has(member.id)}
                  onChange={() => toggleMember(member.id)}
                  className="w-4 h-4 text-slate-700 rounded focus:ring-slate-500"
                />
                <span className="flex-1 text-slate-900">{member.name}</span>

                {selectedMembers.has(member.id) && splitType === 'exact' && (
                  <input
                    type="number"
                    step="0.01"
                    value={splits[member.id]?.amount || ''}
                    onChange={(e) => updateSplit(member.id, 'amount', e.target.value)}
                    placeholder="0.00"
                    className="w-24 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                )}

                {selectedMembers.has(member.id) && splitType === 'percentage' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      value={splits[member.id]?.percentage || ''}
                      onChange={(e) => updateSplit(member.id, 'percentage', e.target.value)}
                      placeholder="0"
                      className="w-20 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    <span className="text-slate-600">%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Add Expense
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
