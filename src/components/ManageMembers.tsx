import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Group } from '../lib/database.types';
import { UserPlus, X } from 'lucide-react';

interface ManageMembersProps {
  group: Group;
  members: User[];
  onMembersChange: () => void;
}

export function ManageMembers({ group, members, onMembersChange }: ManageMembersProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    loadAllUsers();
  }, []);

  async function loadAllUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('name');

    setAllUsers(data || []);
  }

  const availableUsers = allUsers.filter(
    user => !members.some(member => member.id === user.id)
  );

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: selectedUserId
      });

    if (error) {
      console.error('Error adding member:', error);
      alert('Error adding member');
    } else {
      setSelectedUserId('');
      setShowAddForm(false);
      onMembersChange();
    }
  }

  async function removeMember(userId: string) {
    if (!confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing member:', error);
      alert('Error removing member');
    } else {
      onMembersChange();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Group Members ({members.length})
        </h3>
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
            >
              <div>
                <div className="font-medium text-slate-900">{member.name}</div>
                <div className="text-sm text-slate-600">{member.email}</div>
              </div>
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Remove member"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {availableUsers.length > 0 && (
        <div>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          ) : (
            <form onSubmit={addMember} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <h4 className="font-medium text-slate-900 mb-3">Add Member to Group</h4>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full px-3 py-2 mb-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
