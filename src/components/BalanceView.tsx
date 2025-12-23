import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Group } from '../lib/database.types';
import { ArrowRight, DollarSign } from 'lucide-react';

interface BalanceViewProps {
  group: Group;
  currentUser: User;
  members: User[];
  refreshKey: number;
  onSettlement: () => void;
}

interface Balance {
  userId: string;
  userName: string;
  netBalance: number;
}

interface SimplifiedDebt {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

export function BalanceView({ group, currentUser, members, refreshKey, onSettlement }: BalanceViewProps) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [simplifiedDebts, setSimplifiedDebts] = useState<SimplifiedDebt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateBalances();
  }, [group.id, refreshKey, members]);

  async function calculateBalances() {
    setLoading(true);

    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, paid_by, amount')
      .eq('group_id', group.id);

    const { data: splits } = await supabase
      .from('expense_splits')
      .select('expense_id, user_id, amount')
      .in('expense_id', expenses?.map(e => e.id) || []);

    const { data: settlements } = await supabase
      .from('settlements')
      .select('from_user_id, to_user_id, amount')
      .eq('group_id', group.id);

    const userBalances: Record<string, number> = {};
    members.forEach(member => {
      userBalances[member.id] = 0;
    });

    expenses?.forEach(expense => {
      userBalances[expense.paid_by] = (userBalances[expense.paid_by] || 0) + parseFloat(expense.amount.toString());
    });

    splits?.forEach(split => {
      userBalances[split.user_id] = (userBalances[split.user_id] || 0) - parseFloat(split.amount.toString());
    });

    settlements?.forEach(settlement => {
      userBalances[settlement.from_user_id] = (userBalances[settlement.from_user_id] || 0) + parseFloat(settlement.amount.toString());
      userBalances[settlement.to_user_id] = (userBalances[settlement.to_user_id] || 0) - parseFloat(settlement.amount.toString());
    });

    const balanceArray: Balance[] = members.map(member => ({
      userId: member.id,
      userName: member.name,
      netBalance: userBalances[member.id] || 0
    }));

    setBalances(balanceArray);
    setSimplifiedDebts(simplifyDebts(balanceArray));
    setLoading(false);
  }

  function simplifyDebts(balances: Balance[]): SimplifiedDebt[] {
    const debtors = balances.filter(b => b.netBalance < -0.01).map(b => ({ ...b }));
    const creditors = balances.filter(b => b.netBalance > 0.01).map(b => ({ ...b }));

    const debts: SimplifiedDebt[] = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(Math.abs(debtor.netBalance), creditor.netBalance);

      debts.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount: amount
      });

      debtor.netBalance += amount;
      creditor.netBalance -= amount;

      if (Math.abs(debtor.netBalance) < 0.01) i++;
      if (Math.abs(creditor.netBalance) < 0.01) j++;
    }

    return debts;
  }

  async function settleDebt(debt: SimplifiedDebt) {
    const { error } = await supabase
      .from('settlements')
      .insert({
        group_id: group.id,
        from_user_id: debt.fromUserId,
        to_user_id: debt.toUserId,
        amount: debt.amount
      });

    if (error) {
      console.error('Error settling debt:', error);
      alert('Error recording settlement');
    } else {
      onSettlement();
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Calculating balances...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Individual Balances
        </h3>
        <div className="space-y-2">
          {balances.map((balance) => (
            <div
              key={balance.userId}
              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
            >
              <span className={`font-medium ${balance.userId === currentUser.id ? 'text-slate-900' : 'text-slate-700'}`}>
                {balance.userName} {balance.userId === currentUser.id && '(You)'}
              </span>
              <span
                className={`font-semibold ${
                  balance.netBalance > 0.01
                    ? 'text-green-600'
                    : balance.netBalance < -0.01
                    ? 'text-red-600'
                    : 'text-slate-600'
                }`}
              >
                {balance.netBalance > 0.01 && '+'}
                ${balance.netBalance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Simplified Settlements
        </h3>
        {simplifiedDebts.length === 0 ? (
          <div className="text-center py-8 border border-slate-200 rounded-lg">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">All settled up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {simplifiedDebts.map((debt, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium text-slate-900">{debt.fromUserName}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{debt.toUserName}</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">
                    ${debt.amount.toFixed(2)}
                  </span>
                </div>
                {(debt.fromUserId === currentUser.id || debt.toUserId === currentUser.id) && (
                  <button
                    onClick={() => settleDebt(debt)}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    {debt.fromUserId === currentUser.id
                      ? `Mark as paid to ${debt.toUserName}`
                      : `Confirm payment from ${debt.fromUserName}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
