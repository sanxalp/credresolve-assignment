import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Group } from '../lib/database.types';
import { Users, Plus } from 'lucide-react';

interface GroupListProps {
  groups: Group[];
  currentUser: User;
  selectedGroup: Group | null;
  onSelectGroup: (group: Group) => void;
  onGroupsChange: () => void;
}

export function GroupList({
  groups,
  currentUser,
  selectedGroup,
  onSelectGroup,
  onGroupsChange,
}: GroupListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name: newGroupName, description: newGroupDescription })
      .select()
      .single();

    if (groupError) {
      console.error('Error creating group:', groupError);
      return;
    }

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: currentUser.id });

    if (memberError) {
      console.error('Error adding member:', memberError);
    } else {
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateForm(false);
      onGroupsChange();
      onSelectGroup(group);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">Groups</h2>
      </div>

      <div className="divide-y divide-slate-200 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {groups.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">No groups yet</p>
          </div>
        ) : (
          groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                selectedGroup?.id === group.id ? 'bg-slate-100' : ''
              }`}
            >
              <h3 className="font-medium text-slate-900">{group.name}</h3>
              {group.description && (
                <p className="text-sm text-slate-600 mt-1">{group.description}</p>
              )}
            </button>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-200">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        ) : (
          <form onSubmit={createGroup} className="space-y-3">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <input
              type="text"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
