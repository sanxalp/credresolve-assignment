import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/database.types';
import { UserCircle, Plus, ChevronDown } from 'lucide-react';

interface UserSelectorProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
}

export function UserSelector({ currentUser, onUserChange }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase
      .from('users')
      .insert({ name: newUserName, email: newUserEmail })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Email might already exist.');
    } else {
      onUserChange(data);
      setNewUserName('');
      setNewUserEmail('');
      setShowCreateForm(false);
      loadUsers();
    }
  }

  return (
    <div className="relative">
      {!currentUser ? (
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <UserCircle className="w-5 h-5" />
          <span>Select User</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <UserCircle className="w-5 h-5 text-slate-700" />
          <span className="text-slate-900 font-medium">{currentUser.name}</span>
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </button>
      )}

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <div className="p-2 max-h-80 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onUserChange(user);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 transition-colors"
                >
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-600">{user.email}</div>
                </button>
              ))}
            </div>
            <div className="border-t border-slate-200 p-2">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New User</span>
                </button>
              ) : (
                <form onSubmit={createUser} className="space-y-2">
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Name"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
