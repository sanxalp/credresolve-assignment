import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Group } from '../lib/database.types';
import { ExpenseList } from './ExpenseList';
import { BalanceView } from './BalanceView';
import { AddExpense } from './AddExpense';
import { ManageMembers } from './ManageMembers';
import { Receipt, Scale, UserPlus } from 'lucide-react';

interface GroupDetailProps {
  group: Group;
  currentUser: User;
  onGroupUpdate: () => void;
}

type Tab = 'expenses' | 'balances' | 'members';

export function GroupDetail({ group, currentUser, onGroupUpdate }: GroupDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadMembers();
  }, [group.id]);

  async function loadMembers() {
    const { data } = await supabase
      .from('group_members')
      .select('user_id, users(*)');

    if (data) {
      const memberUsers = data
        .filter((m: { user_id: string; users: User | null }) => m.users !== null)
        .map((m: { user_id: string; users: User }) => m.users);
      setMembers(memberUsers);
    }
  }

  function handleExpenseAdded() {
    setShowAddExpense(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">{group.name}</h2>
        {group.description && (
          <p className="text-slate-600 mt-1">{group.description}</p>
        )}
      </div>

      <div className="border-b border-slate-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'expenses'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expenses</span>
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'balances'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Balances</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Members</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'expenses' && (
          <>
            {!showAddExpense ? (
              <button
                onClick={() => setShowAddExpense(true)}
                className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Receipt className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            ) : (
              <AddExpense
                group={group}
                currentUser={currentUser}
                members={members}
                onExpenseAdded={handleExpenseAdded}
                onCancel={() => setShowAddExpense(false)}
              />
            )}
            <ExpenseList group={group} refreshKey={refreshKey} />
          </>
        )}

        {activeTab === 'balances' && (
          <BalanceView
            group={group}
            currentUser={currentUser}
            members={members}
            refreshKey={refreshKey}
            onSettlement={() => setRefreshKey((k) => k + 1)}
          />
        )}

        {activeTab === 'members' && (
          <ManageMembers
            group={group}
            members={members}
            onMembersChange={loadMembers}
          />
        )}
      </div>
    </div>
  );
}
