export type SplitType = 'equal' | 'exact' | 'percentage';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          group_id: string;
          paid_by: string;
          amount: number;
          description: string;
          split_type: SplitType;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          paid_by: string;
          amount: number;
          description: string;
          split_type: SplitType;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          paid_by?: string;
          amount?: number;
          description?: string;
          split_type?: SplitType;
          created_at?: string;
        };
      };
      expense_splits: {
        Row: {
          id: string;
          expense_id: string;
          user_id: string;
          amount: number;
          percentage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_id: string;
          user_id: string;
          amount: number;
          percentage?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          expense_id?: string;
          user_id?: string;
          amount?: number;
          percentage?: number;
          created_at?: string;
        };
      };
      settlements: {
        Row: {
          id: string;
          group_id: string;
          from_user_id: string;
          to_user_id: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          from_user_id: string;
          to_user_id: string;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          from_user_id?: string;
          to_user_id?: string;
          amount?: number;
          created_at?: string;
        };
      };
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupMember = Database['public']['Tables']['group_members']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseSplit = Database['public']['Tables']['expense_splits']['Row'];
export type Settlement = Database['public']['Tables']['settlements']['Row'];
