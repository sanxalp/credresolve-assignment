/*
  # Expense Sharing Application Schema

  ## Overview
  Creates the complete database schema for an expense sharing application similar to Splitwise.

  ## New Tables
  
  ### users
  - `id` (uuid, primary key) - Unique user identifier
  - `name` (text) - User's display name
  - `email` (text, unique) - User's email address
  - `created_at` (timestamptz) - Account creation timestamp

  ### groups
  - `id` (uuid, primary key) - Unique group identifier
  - `name` (text) - Group name
  - `description` (text) - Group description
  - `created_at` (timestamptz) - Group creation timestamp

  ### group_members
  - `id` (uuid, primary key) - Unique membership identifier
  - `group_id` (uuid) - Reference to groups table
  - `user_id` (uuid) - Reference to users table
  - `joined_at` (timestamptz) - Timestamp when user joined group

  ### expenses
  - `id` (uuid, primary key) - Unique expense identifier
  - `group_id` (uuid) - Reference to groups table
  - `paid_by` (uuid) - Reference to users table (who paid)
  - `amount` (decimal) - Total expense amount
  - `description` (text) - Expense description
  - `split_type` (text) - Type of split: 'equal', 'exact', or 'percentage'
  - `created_at` (timestamptz) - Expense creation timestamp

  ### expense_splits
  - `id` (uuid, primary key) - Unique split identifier
  - `expense_id` (uuid) - Reference to expenses table
  - `user_id` (uuid) - Reference to users table
  - `amount` (decimal) - Amount this user owes
  - `percentage` (decimal) - Percentage for percentage-based splits
  - `created_at` (timestamptz) - Split creation timestamp

  ### settlements
  - `id` (uuid, primary key) - Unique settlement identifier
  - `group_id` (uuid) - Reference to groups table
  - `from_user_id` (uuid) - Reference to users table (who paid)
  - `to_user_id` (uuid) - Reference to users table (who received)
  - `amount` (decimal) - Settlement amount
  - `created_at` (timestamptz) - Settlement timestamp

  ## Security
  - RLS enabled on all tables
  - Public access policies (no authentication required as per requirements)

  ## Notes
  1. No authentication system - all tables are publicly accessible
  2. Balances are calculated on-the-fly by querying expense_splits and settlements
  3. Split types supported: equal, exact, percentage
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  paid_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  split_type text NOT NULL CHECK (split_type IN ('equal', 'exact', 'percentage')),
  created_at timestamptz DEFAULT now()
);

-- Create expense_splits table
CREATE TABLE IF NOT EXISTS expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL CHECK (amount >= 0),
  percentage decimal(5, 2) DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  created_at timestamptz DEFAULT now()
);

-- Create settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now(),
  CHECK (from_user_id != to_user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_group_id ON settlements(group_id);
CREATE INDEX IF NOT EXISTS idx_settlements_from_user ON settlements(from_user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_to_user ON settlements(to_user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Public access policies (no authentication required)
CREATE POLICY "Public access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to groups" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to group_members" ON group_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to expense_splits" ON expense_splits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to settlements" ON settlements FOR ALL USING (true) WITH CHECK (true);