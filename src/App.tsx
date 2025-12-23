import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { User, Group } from './lib/database.types';
import { UserSelector } from './components/UserSelector';
import { GroupList } from './components/GroupList';
import { GroupDetail } from './components/GroupDetail';
import { Users } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading groups:', error);
    } else {
      setGroups(data || []);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-slate-700" />
              <h1 className="text-2xl font-bold text-slate-900">Expense Sharing</h1>
            </div>
            <UserSelector currentUser={currentUser} onUserChange={setCurrentUser} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!currentUser ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Welcome to Expense Sharing</h2>
            <p className="text-slate-600">Select or create a user to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <GroupList
                groups={groups}
                currentUser={currentUser}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                onGroupsChange={loadGroups}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedGroup ? (
                <GroupDetail
                  group={selectedGroup}
                  currentUser={currentUser}
                  onGroupUpdate={loadGroups}
                />
              ) : (
                <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                  <p className="text-slate-600">Select a group to view expenses and balances</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
